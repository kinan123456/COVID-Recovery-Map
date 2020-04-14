import { Component, OnInit, NgZone, DoCheck } from '@angular/core';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';

let viewer: any;
let ellipsoid: any;
let pinBuilder = new Cesium.PinBuilder();

const MINIMUM_ZOOM_DISTANCE = 250;
const MAXIMUM_ZOOM_DISTANCE = 12000000;
const MINIMUM_ZOOM_RATE = 300;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  countries: Country[] = [];  

  constructor(private countrySvc: CountryService, private ngZone: NgZone) { }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.setup();

      this.countrySvc.getCountries().subscribe(resp => {
        this.countries = resp
        for (var i = 0; i < this.countries.length; i++) {
          this.addPins(this.countries[i]);
        }
      });
  
      this.limitZoomAbility();
      this.flyToCountry();
    });
  }

  private limitZoomAbility() {
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = MINIMUM_ZOOM_DISTANCE;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAXIMUM_ZOOM_DISTANCE;		
    viewer.scene.screenSpaceCameraController._minimumZoomRate = MINIMUM_ZOOM_RATE;
  }

  private flyToCountry() {
    this.countrySvc.selectedCountry.subscribe(
      selectedCountry => {
        var entity = viewer.entities.getById(selectedCountry.country);
        viewer.flyTo(entity, {
          offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 3000000)
        }).then(function(result) {
            if (result) {
              viewer.selectedEntity = entity;
            }
        });
      });
  }
  
  /**
  * Add pins as markers to all countries at map.
  * @param country Country object
  */
 private addPins(country) {
    //Create a red pin representing a hospital from the maki icon set.
    Cesium.when(pinBuilder.fromMakiIconId('marker', Cesium.Color.GREEN, 48), function(canvas) {
      return viewer.entities.add({
        id: country.country,
        position : Cesium.Cartesian3.fromDegrees(country.countryInfo.long, country.countryInfo.lat),
        billboard : {
          image : canvas.toDataURL(),
          verticalOrigin : Cesium.VerticalOrigin.BOTTOM
        },
        info: country,
        description: 
          '<table class="cesium-infoBox-defaultTable"><tbody>' +
          '<tr><th>Country Name</th><td>' + country.country + '</td></tr>' +
          '<tr><th>Total Cases</th><td>' + country.cases + '</td></tr>' +
          '<tr><th>Total Deaths</th><td>' + country.deaths + '</td></tr>' +
          '<tr><th>Total Recovered</th><td>' +  country.recovered  + '</td></tr>' +
          '<tr><th>Total Active</th><td>' +  country.active + '</td></tr>' +
          '</tbody></table>'
      });
    });
  }

  /**
   * Zoom in button click handler: Move camera forward.
   */
  zoomIn() {
    viewer.camera.moveForward(
      ellipsoid.cartesianToCartographic(viewer.camera.position).height / 10.0
    );
  }

  /***
   * Zoom out button click handler: Move camera backward.
   */
  zoomOut() {
    viewer.camera.moveBackward(
      ellipsoid.cartesianToCartographic(viewer.camera.position).height / 10.0
    );
  }

  private setup() {
    //////////////////////////////////////////////////////////////////////////
    // Creating the Viewer & Imagery
    //////////////////////////////////////////////////////////////////////////
    viewer = new Cesium.Viewer("cesiumContainer", {
      imageryProvider: Cesium.createWorldImagery({
        style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
        assetId: 3954
      }),
      baseLayerPicker: false, ////Hide the base layer picker
      timeline: false,  //Timeline disabled
      animation: false, //Hide Clock
      homeButton: false,  //Hide HomeButton top right corner
      fullscreenButton: false,
      sceneModePicker: false,
      scene3DOnly: true, //Each geometry instance will only be rendered in 3D to save GPU memory.
      projectionPicker: true,  //Add projection button
      geocoder: false //Disable cesium search
    });

    viewer.scene.canvas.setAttribute('tabIndex', 1);

    viewer.screenSpaceEventHandler.setInputAction(function(e) {
        viewer.scene.canvas.focus();
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    

    // Remove credit logo.
    viewer.scene.frameState.creditDisplay.destroy();

    //////////////////////////////////////////////////////////////////////////
    // Add information about camera longtitude, latitude & alt.
    //////////////////////////////////////////////////////////////////////////
    var cartographic = new Cesium.Cartographic();
    var camera = viewer.scene.camera;
    ellipsoid = viewer.scene.mapProjection.ellipsoid;

    var hud = document.getElementById("hud");

    viewer.clock.onTick.addEventListener(function(clock) {
      ellipsoid.cartesianToCartographic(camera.positionWC, cartographic);
      hud.innerHTML =
        "Lon: " +
        Cesium.Math.toDegrees(cartographic.longitude).toFixed(2) +
        "&#176<br/>" +
        "Lat: " +
        Cesium.Math.toDegrees(cartographic.latitude).toFixed(2) +
        "&#176<br/>" +
        "Alt: " +
        (cartographic.height * 0.001).toFixed(1) +
        " km";
    });

    //////////////////////////////////////////////////////////////////////////
    // Custom mouse move interaction for highlighting and selecting entities
    //////////////////////////////////////////////////////////////////////////

    var labelEntity = viewer.entities.add({
      label : {
          show : false,
          showBackground : true,
          font : '14px monospace',
          horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
          verticalOrigin : Cesium.VerticalOrigin.TOP,
          pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    });

    // If the mouse is over a point of interest, change the entity billboard scale and color
    var previousPickedEntity;

    var handler = viewer.screenSpaceEventHandler;
    handler.setInputAction(function(movement) {
      var pickedPrimitive = viewer.scene.pick(movement.endPosition);
      var pickedEntity = Cesium.defined(pickedPrimitive)
        ? pickedPrimitive.id
        : undefined;
      // Unhighlight the previously picked entity
      if (Cesium.defined(previousPickedEntity)) {
        previousPickedEntity.billboard.scale = 1.0;
        previousPickedEntity.billboard.color = Cesium.Color.WHITE;
        labelEntity.label.show = false;
      }
      // Highlight the currently picked entity
      if (
        Cesium.defined(pickedEntity) &&
        Cesium.defined(pickedEntity.billboard)
      ) {
        var cartesian = viewer.scene.pickPosition(movement.endPosition);
        
        labelEntity.position = cartesian;
        labelEntity.label.show = true;
        labelEntity.label.text = pickedEntity.id;

        pickedEntity.billboard.scale = 2.0;
        pickedEntity.billboard.color = Cesium.Color.ORANGERED;
        previousPickedEntity = pickedEntity;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //////////////////////////////////////////////////////////////////////////
    // Custom mouse double left click interaction for selecting entities
    //////////////////////////////////////////////////////////////////////////
    viewer.screenSpaceEventHandler.setInputAction((e) => {
      var picked = viewer.scene.pick(e.position);
      if (Cesium.defined(picked)) {
          var id = Cesium.defaultValue(picked.id, picked.primitive.id);
          if (id instanceof Cesium.Entity) {
              var entity = id;
              if (Cesium.defined(entity)) {
                viewer.flyTo(entity, {
                  offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 3000000)
                });
                viewer.selectedEntity = entity;
                this.countrySvc.updateCountry(entity.info as Country);
              }
          }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }
}

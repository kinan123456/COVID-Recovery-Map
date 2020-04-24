import { Component, OnInit, NgZone, DoCheck, ChangeDetectorRef } from '@angular/core';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';

let viewer: any;
let ellipsoid: any;
let pinBuilder = new Cesium.PinBuilder();

const MINIMUM_ZOOM_DISTANCE = 250;
const MAXIMUM_ZOOM_DISTANCE = 12000000;
const MINIMUM_ZOOM_RATE = 300;
const DEFAULT_ZOOM_AMOUNT = 2000000;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  countries: Country[] = [];
  isLoaded = false;

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
    // Create a green marker representing a country.
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
    if (this.getCurrentZoom() - DEFAULT_ZOOM_AMOUNT > MINIMUM_ZOOM_DISTANCE) {
      viewer.camera.zoomIn(DEFAULT_ZOOM_AMOUNT);
    }
  }

  /***
   * Zoom out button click handler: Move camera backward.
   */
  zoomOut() {
    if (this.getCurrentZoom() + DEFAULT_ZOOM_AMOUNT < MAXIMUM_ZOOM_DISTANCE) {
      viewer.camera.zoomOut(DEFAULT_ZOOM_AMOUNT);
    }
  }

  private getCurrentZoom(): number {
    return ellipsoid.cartesianToCartographic(viewer.camera.position).height;
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

    var helper = new Cesium.EventHelper();
    helper.add(viewer.scene.globe.tileLoadProgressEvent, function (event) {
      if (event == 0) {
      setVisible('#loading', false);
      }
    });

    function setVisible(selector, visible) {
      document.querySelector(selector).style.display = visible ? 'block' : 'none';
    }

    // Remove credit logo.
    viewer.scene.frameState.creditDisplay.destroy();
    ellipsoid = viewer.scene.mapProjection.ellipsoid;

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

    var hud = document.getElementById("hud");
    var handler = viewer.screenSpaceEventHandler;
    handler.setInputAction(function(movement) {

      displayLongtitudeLatitude(movement);

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
    // Mouse over the globe to see the cartographic position
    //////////////////////////////////////////////////////////////////////////
    function displayLongtitudeLatitude(movement) {
      var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
      if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
          var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

          hud.innerHTML =
            'Lon: ' + ('   ' + longitudeString).slice(-7) + '\u00B0' +
            '\nLat: ' + ('   ' + latitudeString).slice(-7) + '\u00B0';
      } else {
        hud.innerHTML = '';
      } 
    }
    //////////////////////////////////////////////////////////////////////////
    // Custom mouse double left click interaction for selecting entities
    //////////////////////////////////////////////////////////////////////////
    viewer.scene.canvas.setAttribute('tabIndex', 1);

    viewer.screenSpaceEventHandler.setInputAction((e) => {
      viewer.scene.canvas.focus();
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
                this.ngZone.run(() => this.countrySvc.updateCountry(entity.info as Country));
              }
          }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }
}

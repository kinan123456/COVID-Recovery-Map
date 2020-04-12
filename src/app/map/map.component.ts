import { Component, OnInit } from '@angular/core';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';

let viewer: any;
let ellipsoid: any;
let pinBuilder = new Cesium.PinBuilder();
let pinMarkers: any[] = [];

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
  constructor(private countrySvc: CountryService) { }

  ngOnInit() {
    this.setup();

    this.countrySvc.getCountries().subscribe(resp => {
      var i;
      this.countries = resp
      for (i = 0; i < this.countries.length; i++) {
        this.addPins(this.countries[i]);
      }
    });
/*
    //Since some of the pins are created asynchronously, wait for them all to load before zooming/
    Cesium.when(pinMarkers, function(pins){
      viewer.zoomTo(pins)
    });*/

    this.limitZoomAbility();
  }

  limitZoomAbility() {
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = MINIMUM_ZOOM_DISTANCE;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAXIMUM_ZOOM_DISTANCE;		
    viewer.scene.screenSpaceCameraController._minimumZoomRate = MINIMUM_ZOOM_RATE;
  }
  
  /**
  * Add pins as markers to all countries at map.
  * @param country Country object
  */
  addPins(country) {
    //Create a red pin representing a hospital from the maki icon set.
    var pinMarker = Cesium.when(pinBuilder.fromMakiIconId('marker', Cesium.Color.GREEN, 48), function(canvas) {
      return viewer.entities.add({
        name : country.country,
        position : Cesium.Cartesian3.fromDegrees(country.countryInfo.long, country.countryInfo.lat),
        billboard : {
          image : canvas.toDataURL(),
          verticalOrigin : Cesium.VerticalOrigin.BOTTOM
        },
        info: country,
        description: 
                    '\
            <p>\
              Country Name: ' + country.country + '<br/>\
              Total Cases:' + country.cases + '<br/>\
              Total Deaths:' + country.deaths + '<br/>\
              Total Recovered:' + country.recovered + '<br/>\
              Total Active:' + country.active + '<br/>\
            </p>'
      });
    });
    pinMarkers.push(pinMarker);
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
    var backwardDistance = ellipsoid.cartesianToCartographic(viewer.camera.position).height / 10.0;
    viewer.camera.moveBackward(backwardDistance);
    if (ellipsoid.cartesianToCartographic(viewer.camera.position).height > MAXIMUM_ZOOM_DISTANCE)
    ellipsoid.cartesianToCartographic(viewer.camera.position).height = MAXIMUM_ZOOM_DISTANCE * 0.001;
  }

  setup() {
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
    });

    // Remove credit logo.
    viewer.scene.frameState.creditDisplay.destroy();

    //////////////////////////////////////////////////////////////////////////
    // Add information about camera longtiture, latitude & alt.
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

      viewer.canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
      viewer.canvas.onclick = function() {
        viewer.canvas.focus();
      };
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
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        
        labelEntity.position = cartesian;
        labelEntity.label.show = true;
        labelEntity.label.text = pickedEntity.name;

        labelEntity.label.eyeOffset = new Cesium.Cartesian3(0.0, 0.0, -cartographic.height * (viewer.scene.mode === Cesium.SceneMode.SCENE2D ? 1.5 : 1.0));

        pickedEntity.billboard.scale = 2.0;
        pickedEntity.billboard.color = Cesium.Color.ORANGERED;
        previousPickedEntity = pickedEntity;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //////////////////////////////////////////////////////////////////////////
    // Custom mouse double left click interaction for selecting entities
    //////////////////////////////////////////////////////////////////////////
    viewer.screenSpaceEventHandler.setInputAction(function(e) {
      var picked = viewer.scene.pick(e.position);
      if (Cesium.defined(picked)) {
          var id = Cesium.defaultValue(picked.id, picked.primitive.id);
          if (id instanceof Cesium.Entity) {
              var entity = id;
              if (Cesium.defined(entity)) {
                viewer.flyTo(entity, {
                  offset: new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 3000000)
                }).then(function(result) {
                    if (result) {
                        viewer.selectedEntity = entity;
                    }
                });
              }
          }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);        
  }
}

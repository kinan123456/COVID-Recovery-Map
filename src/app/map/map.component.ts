import { Component, OnInit } from '@angular/core';

let viewer: any;
let ellipsoid: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {


  constructor() { }

  ngOnInit() {
    this.setup();
  }

  zoomIn() {
    viewer.camera.moveForward(
      ellipsoid.cartesianToCartographic(viewer.camera.position).height / 10.0
    );
  }

  zoomOut() {
    viewer.camera.moveBackward(
      ellipsoid.cartesianToCartographic(viewer.camera.position).height / 10.0
    );
  }

  setup() {
    //////////////////////////////////////////////////////////////////////////
    // Create a clock that loops on Christmas day 2013 and runs in 4000x real time.
    //////////////////////////////////////////////////////////////////////////
    var clock = new Cesium.Clock({
      clockRange: Cesium.ClockRange.LOOP_STOP, // loop when we hit the end time
      clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
      multiplier: 1, // how much time to advance each tick
      shouldAnimate: true // Animation on by default
    });

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
      infoBox: false, //InfoBox widget won't be created
      fullscreenButton: false,
      sceneModePicker: false,
      vrButton: true,
      scene3DOnly: true, //Each geometry instance will only be rendered in 3D to save GPU memory.
      projectionPicker: true,  //Add projection button
    });

    //////////////////////////////////////////////////////////////////////////
    // Adding buttons with lon, lat, alt information
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
    // Add Pins to map
    //////////////////////////////////////////////////////////////////////////
    var pinBuilder = new Cesium.PinBuilder();

    //Create a red pin representing a hospital from the maki icon set.
    var hospitalPin = Cesium.when(
      pinBuilder.fromMakiIconId("hospital", Cesium.Color.RED, 48),
      function(canvas) {
        return viewer.entities.add({
          name: "Hospital",
          position: Cesium.Cartesian3.fromDegrees(-75.1698606, 39.9211275),
          billboard: {
            image: canvas.toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
      }
    );

    var url = Cesium.buildModuleUrl("Assets/Textures/maki/grocery.png");
    var groceryPin = Cesium.when(
      pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48),
      function(canvas) {
        return viewer.entities.add({
          name: "Grocery store",
          position: Cesium.Cartesian3.fromDegrees(-75.1705217, 39.921786),
          billboard: {
            image: canvas.toDataURL(),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });
      }
    );

    //Since some of the pins are created asynchronously, wait for them all to load before zooming/
    Cesium.when.all([hospitalPin, groceryPin], function(pins) {
      viewer.zoomTo(pins);
    });

    //////////////////////////////////////////////////////////////////////////
    // Custom mouse interaction for highlighting and selecting
    //////////////////////////////////////////////////////////////////////////

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
      }
      // Highlight the currently picked entity
      if (
        Cesium.defined(pickedEntity) &&
        Cesium.defined(pickedEntity.billboard)
      ) {
        pickedEntity.billboard.scale = 2.0;
        pickedEntity.billboard.color = Cesium.Color.ORANGERED;
        previousPickedEntity = pickedEntity;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  }
}

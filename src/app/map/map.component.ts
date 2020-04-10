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

    });
    // Add map controls
    this.map.addControl(new mapboxgl.NavigationControl());*/
  }
}

import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DistanceLegendService implements OnInit {
    private barWidthSource;
    barWidthObservable;
    private distanceLabelSource;
    distanceLabelObservable;

    private geodesic;
    barWidth: number;
    distanceLabel: string;
    distances = [
        1, 2, 3, 5,
        10, 20, 30, 50,
        100, 200, 300, 500,
        1000, 2000, 3000, 5000,
        10000, 20000, 30000, 50000,
        100000, 200000, 300000, 500000,
        1000000, 2000000, 3000000, 5000000,
        10000000, 20000000, 30000000, 50000000];

    constructor() {
        this.barWidthSource = new BehaviorSubject<number>(0);
        this.distanceLabelSource = new BehaviorSubject<string>('');
        this.barWidthObservable = this.barWidthSource.asObservable();
        this.distanceLabelObservable = this.distanceLabelSource.asObservable();
        this.geodesic = new Cesium.EllipsoidGeodesic();
     }

    ngOnInit() {

    }

    updateDistanceLegendCesium(viewer) {
        // Find the distance between two pixels at the bottom center of the screen.
        var width = viewer.scene.canvas.clientWidth;
        var height = viewer.scene.canvas.clientHeight;

        var left = viewer.scene.camera.getPickRay(new Cesium.Cartesian2((width / 2) | 0, height - 1));
        var right = viewer.scene.camera.getPickRay(new Cesium.Cartesian2(1 + (width / 2) | 0, height - 1));

        var globe = viewer.scene.globe;
        var leftPosition = globe.pick(left, viewer.scene);
        var rightPosition = globe.pick(right, viewer.scene);

        if (!(leftPosition) || !(rightPosition)) {
            this.barWidth = undefined;
            this.distanceLabel = undefined;
            return;
        }

        var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
        var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

        this.geodesic.setEndPoints(leftCartographic, rightCartographic);
        var pixelDistance = this.geodesic.surfaceDistance;

        // Find the first distance that makes the scale bar less than 100 pixels.
        var maxBarWidth = 100;
        var distance;
        for (var i = this.distances.length - 1; !(distance) && i >= 0; --i) {
            if (this.distances[i] / pixelDistance < maxBarWidth) {
                distance = this.distances[i];
            }
        }

        if ((distance)) {
            var label;
            if (distance >= 1000) {
                label = (distance / 1000).toString() + ' km';
            } else {
                label = distance.toString() + ' m';
            }

            this.barWidth = (distance / pixelDistance) | 0;
            this.distanceLabel = label;
            this.barWidthSource.next(this.barWidth);
            this.distanceLabelSource.next(this.distanceLabel);
        } else {
            this.barWidth = undefined;
            this.distanceLabel = undefined;
        }
    }
}
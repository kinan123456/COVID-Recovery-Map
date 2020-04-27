import { Component, OnInit } from '@angular/core';
import { DistanceLegendService } from './distance-legend.service';

@Component({
  selector: 'distance-scale',
  templateUrl: './distance-scale.component.html',
  styleUrls: ['./distance-scale.component.css']
})
export class DistanceScaleComponent implements OnInit {

  barWidth: number;
  distanceLabel: string;
  distanceLabelElement: HTMLElement;
  barWidthElement: HTMLElement;

  constructor(private distanceLegendSvc: DistanceLegendService) { 
  }

  ngOnInit(): void {
    this.distanceLegendSvc.barWidthObservable.subscribe((resp) => {
      this.barWidth = resp;
      document.getElementById("distance-label-bar").style.width = this.barWidth + 'px';
      document.getElementById("distance-label-bar").style.left = (5 + (125 - this.barWidth) / 2) + 'px';
    });

    this.distanceLegendSvc.distanceLabelObservable.subscribe((resp) => {
      this.distanceLabel = resp;
      document.getElementById("distance-label").innerHTML = this.distanceLabel;
    });
  } 
}


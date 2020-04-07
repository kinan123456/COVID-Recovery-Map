import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data-service.service';

@Component({
  selector: 'app-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.css']
})
export class InformationPanelComponent implements OnInit {
  info: Promise<string>;
  totalRecovered: number;
  constructor(private dataSvc: DataService) { }

  ngOnInit(): void {
    this.totalRecovered = 0;
    this.dataSvc.extractCovid19Data();
    this.outputRecovered();
  }

  outputRecovered() {
    console.log("total is: " + this.totalRecovered)
  }
}

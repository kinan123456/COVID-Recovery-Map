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
    this.dataSvc.extractCovid19Data()
      .then(data => {
        let recoveredData = 0;
        data["Israel"].forEach((date, confirmed, recovered, deaths) => {
          recoveredData += recovered;
        }) 
    });

    this.outputRecovered();
  }

  outputRecovered() {
    console.log("total is: " + this.totalRecovered)
  }
}

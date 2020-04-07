import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data-service.service';
import { CountryInfo } from './country-info.model';

@Component({
  selector: 'app-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.css']
})
export class InformationPanelComponent implements OnInit {
  totalRecovered: number;
  countList: CountryInfo[] = [];

  constructor(private api: DataService) { }

  ngOnInit(): void {
    this.totalRecovered = 0;
    this.fetchCountriesData();
  }

  fetchCountriesData() {
    this.api.fetchData()
      .subscribe(data => {
        for(const countryName of Object.keys(data)) {
          let countryConfiremd = 0;
          let countryRecovered = 0;
          let countryDeaths = 0;

          data[countryName].forEach(({date, confirmed, recovered, deaths}) => {
            countryConfiremd += +confirmed
            countryRecovered += +recovered
            countryDeaths += +deaths
          });
          this.countList.push(new CountryInfo(countryName, countryConfiremd, countryRecovered, countryDeaths));
        }
      });
  }
}

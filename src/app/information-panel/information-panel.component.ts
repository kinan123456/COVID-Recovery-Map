import { Component, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { CountryService } from '../country/country.service';

@Component({
  selector: 'app-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.css']
})
export class InformationPanelComponent implements OnInit{
  @Input('recoveredCases') recoveredCases: number;

  constructor(private countrySvc: CountryService) { }

  ngOnInit(): void {
  }

}
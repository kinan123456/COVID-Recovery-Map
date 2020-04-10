import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';

@Component({
  selector: 'app-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.css']
})
export class InformationPanelComponent implements OnInit, OnDestroy {
  chosenCountry: Country;
  
  constructor(private countrySvc: CountryService) { }

  ngOnInit(): void {
    this.countrySvc.selectedCountry.subscribe(
      selectedCountry => {
        this.chosenCountry = selectedCountry
      });
  }

  // Cleanup just before Angular destroys the directive/component.
  // Unsubscribe observables and detach event handlers to avoid memory leaks.
  ngOnDestroy(): void {
    this.countrySvc.selectedCountry.unsubscribe();
  }  

}
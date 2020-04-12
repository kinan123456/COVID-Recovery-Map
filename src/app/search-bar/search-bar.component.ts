import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  filteredCountries: Observable<Country[]>;
  countries: Country[] = [];
  usersForm: FormGroup;

  constructor(private fb: FormBuilder, private countrySvc: CountryService) {}
  
  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null
    });

    this.countrySvc.getCountries().subscribe(resp => {
      this.countries = resp
      this.countries.sort((obj1, obj2) => obj1.country.localeCompare(obj2.country));
    });

    this.filteredCountries = this.usersForm.get('userInput').valueChanges
      .pipe(map(val => this._filter(val))
    );
  }


  _filter(val: string) {
    return this.countries.filter(country =>
      country.country.toLowerCase().includes(val.toLowerCase()));
  }

  parseCountry(country: Country) {
    this.countrySvc.updateCountry(country);
  }
}
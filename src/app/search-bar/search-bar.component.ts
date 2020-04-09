import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, startWith, map, tap, finalize } from 'rxjs/operators';
import { CountryService } from '../country/country.service';
import { Country } from '../country/country.model';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  filteredCountries: Observable<Country[]>;
  countries: Country[] = [];
  usersForm: FormGroup;
  test: any;

  constructor(private fb: FormBuilder, private countrySvc: CountryService) {}
  
  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null
    });
    this.filteredCountries = this.usersForm.get('userInput').valueChanges
    .pipe(
      debounceTime(300),
      switchMap(value => this.countrySvc.getCountries())
    );    
  }

  displayFn(country?: Country): string | undefined {
    return country ? country.country : undefined;
  } 
}
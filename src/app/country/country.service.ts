import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError as observableThrowError, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country } from './country.model';

const url = 'https://corona.lmao.ninja/countries';

@Injectable({
    providedIn: 'root'
})
export class CountryService{

  selectedCountry: Subject<Country>;

  constructor(private httpClient: HttpClient) {  
    this.selectedCountry = new Subject<Country>();
  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<Country[]>(url)
        .pipe(catchError(this.handleError));
  }
  
  handleError(res: HttpErrorResponse | any) {
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server Error');
  }

  updateCountry(country: Country) {
    this.selectedCountry.next(country);
  }
}
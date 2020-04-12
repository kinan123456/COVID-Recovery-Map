import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, throwError as observableThrowError, Subject, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Country } from './country.model';

const url = 'https://corona.lmao.ninja/countries';

@Injectable({
    providedIn: 'root'
})
export class CountryService{

  private countrySource = new BehaviorSubject<Country>(new Country());
  selectedCountry = this.countrySource.asObservable();

  constructor(private httpClient: HttpClient) {  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<Country[]>(url)
        .pipe(catchError(this.handleError));
  }
  
  handleError(res: HttpErrorResponse | any) {
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server Error');
  }

  updateCountry(country: Country) {
    this.countrySource.next(country);
  }
}
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { catchError, map, filter, tap } from 'rxjs/operators';
import { Country } from './country.model';

const url = 'https://corona.lmao.ninja/countries';

@Injectable({
    providedIn: 'root'
})
export class CountryService {

  constructor(private httpClient: HttpClient) {  }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<Country[]>(url)
        .pipe(catchError(this.handleError));
  }
  
  handleError(res: HttpErrorResponse | any) {
    console.error(res.error || res.body.error);
    return observableThrowError(res.error || 'Server Error');
  }  
}
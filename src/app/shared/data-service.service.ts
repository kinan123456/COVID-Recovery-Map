import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CountryInfo } from '../information-panel/country-info.model';

const url = 'https://pomber.github.io/covid19/timeseries.json';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    constructor(private httpClient: HttpClient) {}

    fetchData() {
        return this.httpClient.get(url);
    }


      /*getSmartphoneById(id: any): Observable<any> {
        return this.http.get<Smartphone>(localUrl + id).pipe(
          retry(3), catchError(this.handleError<Smartphone>('getSmartphone')));
      }*/
}
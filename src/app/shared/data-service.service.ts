import { InformationPanelComponent } from '../information-panel/information-panel.component';

export class DataService {
    info: any;
    url: string;

    constructor() {
        this.url = "https://pomber.github.io/covid19/timeseries.json";
    }
    // Standard variation
    extractCovid19Data():  Promise<string> {
        
        return fetch(this.url)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            return response.json() as Promise<string>
        })
    }
}
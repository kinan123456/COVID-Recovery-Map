export class Country {
    country: string;
    continent: string;
    countryInfo: {_id: number, iso2: string, iso3: string, lat: number, long: number, flag: string};
    updated: number;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    active: number;
    critical: number;
    casesPerOneMillion: number;
    deathsPerOneMillion: number;
    tests: number;
    testsPerOneMillion: number;
}
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}


Cesium.buildModuleUrl.setBaseUrl('/assets/cesium/');
Cesium.Ion.defaultAccessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MWRlNjFhZC0wMjM3LTQ1NDMtYjg1YS0zMTYzNjk2Y2U3Y2EiLCJpZCI6MjU3NjQsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1ODY1MTM2NTB9.B4y-yIiQ5UeyPxWG8svabNTefAOv42dw7X8sP4ZMKaM";

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

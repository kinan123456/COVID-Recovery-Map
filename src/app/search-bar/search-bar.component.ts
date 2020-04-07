import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data-service.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  info: Promise<string>;
  constructor(private dataSvc: DataService) { }

  ngOnInit(): void {
    this.dataSvc.extractCovid19Data();
  }
}

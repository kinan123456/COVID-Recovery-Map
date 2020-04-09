import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-information-panel',
  templateUrl: './information-panel.component.html',
  styleUrls: ['./information-panel.component.css']
})
export class InformationPanelComponent implements OnInit {
  totalRecovered: number;
  
  constructor() { }

  ngOnInit(): void {
  }

}
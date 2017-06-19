import { Component, OnInit } from '@angular/core';
import { MdTabChangeEvent } from "@angular/material";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  private _selectedTab: number = 0;

  constructor() { }

  ngOnInit() {
  }

  get selectedTab(): number {
    return this._selectedTab;
  }

  setSelectedTab(event: MdTabChangeEvent): void {
    this._selectedTab = event.index;
  }

}

import { Component, OnInit } from '@angular/core';
import { MdTabChangeEvent } from "@angular/material";
import { SessionService } from "services/session.service";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  
  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  get selectedTab(): number {
    return this._session.selectedAdminTab;
  }

  set selectedTab(tab: number) {
    this._session.selectedAdminTab = tab;
  }

  setSelectedTab(event: MdTabChangeEvent): void {
    this._session.selectedAdminTab = event.index;
  }

}

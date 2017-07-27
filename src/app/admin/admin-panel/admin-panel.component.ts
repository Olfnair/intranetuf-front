import { Component } from '@angular/core';
import { MdTabChangeEvent } from "@angular/material";
import { SessionService } from "app/services/session.service";
import { RoleChecker, AdminRoleChecker } from "app/services/role-checker";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  private _roleChecker: RoleChecker;
  
  constructor(private _session: SessionService) {
    this._roleChecker = new AdminRoleChecker(this._session);
  }

  get roleChecker(): RoleChecker {
    return this._roleChecker;
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

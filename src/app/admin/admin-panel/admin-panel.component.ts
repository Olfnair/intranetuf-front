import { Component, OnInit } from '@angular/core';
import { MdTabChangeEvent } from "@angular/material";
import { SessionService } from "app/services/session.service";
import { RoleChecker } from "app/shared/role-checker";

class AdminRoleChecker extends RoleChecker { 
  public roleCheck(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  private _roleChecker: AdminRoleChecker = undefined;
  
  constructor(private _session: SessionService) {
    this._roleChecker = new AdminRoleChecker(this._session);
  }

  get roleChecker(): AdminRoleChecker {
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

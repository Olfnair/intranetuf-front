import { Component, OnInit } from '@angular/core';
import { MdTabChangeEvent } from "@angular/material";
import { SessionService } from "app/services/session.service";
import { RoleChecker } from "app/shared/role-checker";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent extends RoleChecker {
  
  constructor(session: SessionService) {
    super(session);
  }

  get selectedTab(): number {
    return this.session.selectedAdminTab;
  }

  set selectedTab(tab: number) {
    this.session.selectedAdminTab = tab;
  }

  setSelectedTab(event: MdTabChangeEvent): void {
    this.session.selectedAdminTab = event.index;
  }

  roleCheck(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }

}

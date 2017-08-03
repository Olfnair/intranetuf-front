import { Component } from '@angular/core';
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  private _usersTabIndex: number = 0;
  private _projectsTabIndex: number = 0; 

  constructor(private _session: SessionService) { }

  set usersTabIndex(usersTabIndex: number) {
    this._usersTabIndex = usersTabIndex;
  }

  get usersTabIndex(): number {
    return this._usersTabIndex;
  }

  set projectsTabIndex(projectsTabIndex: number) {
    this._projectsTabIndex = projectsTabIndex;
  }

  get projectsTabIndex(): number {
    return this._projectsTabIndex;
  }

  get selectedItem(): number {
    return this._session.selectedAdminItem;
  }
}

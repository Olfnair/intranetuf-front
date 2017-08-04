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
  private _logsTabIndex: number = 0; 

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

  set logsTabIndex(logsTabIndex: number) {
    this._logsTabIndex = logsTabIndex;
  }

  get logsTabIndex(): number {
    return this._logsTabIndex;
  }

  get selectedItem(): number {
    return this._session.selectedAdminItem;
  }

  getItem(item: string): number {
    return this._session.getAdminNavListItemId(item);
  }
}

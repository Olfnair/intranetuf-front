import { Component } from '@angular/core';
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent { 
  constructor(private _session: SessionService) { }

  get selectedItem(): number {
    return this._session.selectedAdminItem;
  }
}

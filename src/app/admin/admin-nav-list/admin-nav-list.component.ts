import { Component, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { NavList, NavListSelection } from "app/gui/nav-list";
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-admin-nav-list',
  templateUrl: './admin-nav-list.component.html',
  styleUrls: ['./admin-nav-list.component.css']
})
export class AdminNavListComponent extends NavList {
  constructor(
    sanitizer: DomSanitizer,
    private _session: SessionService
  ) {
    super(sanitizer);
    let items: string[] = [
      'Utilisateurs', // 0
      'Projets',      // 1
      'Logs'          // 2
    ];
    let i: number = 0;
    this.selectables = [];
    this._session.clearAdminNavListItemToIdMap();
    items.forEach((item: string) => {
      this.selectables.push(new NavListSelection(i, item, '#000000', '#ffffff'));
      this._session.mapAdminNavListItemToId(item, i++);
    });
  }

  select(selection: NavListSelection): void {
    this._session.selectedAdminItem = selection.id;
    this.selected = this.selectables[selection.id];
  }

  @Input() set selectedAdminItem(index: number) {
    this.selected = this.selectables[index];
  }
}

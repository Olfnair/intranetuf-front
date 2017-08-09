/**
 * Auteur: Florian
 * License:
 */

import { Component } from '@angular/core';
import { SessionService } from "app/services/session.service";

/**
 * Panneau d'administration
 */
@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent {
  
  /** Index de l'onglet actif dans users-section */
  private _usersTabIndex: number = 0;
  
  /** Index de l'onglet actif dans projects-section */
  private _projectsTabIndex: number = 0;
  
  /** Index de l'onglet actif dans logs-section */
  private _logsTabIndex: number = 0;

  /**
   * @constructor
   * @param {SessionService} _session - le service session global
   */
  constructor(private _session: SessionService) { }

  /** @property {number} usersTabIndex - index de l'onglet actif dans users-section */
  get usersTabIndex(): number {
    return this._usersTabIndex;
  }
  
  set usersTabIndex(usersTabIndex: number) {
    this._usersTabIndex = usersTabIndex;
  }

  /** @property {number} projectsTabIndex - index de l'onglet actif dans projects-section */
  get projectsTabIndex(): number {
    return this._projectsTabIndex;
  }

  set projectsTabIndex(projectsTabIndex: number) {
    this._projectsTabIndex = projectsTabIndex;
  }

  /** @property {number} logsTabIndex - index de l'onglet actif dans logs-section */
  get logsTabIndex(): number {
    return this._logsTabIndex;
  }

  set logsTabIndex(logsTabIndex: number) {
    this._logsTabIndex = logsTabIndex;
  }

  /** @property {number} selectedItemId - id de l'item sélectionné dans le menu de navigation du panneau d'admin */
  get selectedItemId(): number {
    return this._session.selectedAdminItem;
  }

  /**
   * Renvoie l'id de l'item
   * @param item - chaine de caractères correspondant à l'item voulu
   * @returns {number} - id de l'item
   */
  getItemId(item: string): number {
    return this._session.getAdminNavListItemId(item);
  }
  
}

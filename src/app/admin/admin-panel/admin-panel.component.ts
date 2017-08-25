/**
 * Auteur: Florian
 * License:
 */

import { Component } from '@angular/core';
import { SessionService } from "app/services/session.service";
import { Pannel } from "app/user/pannel";

/**
 * Panneau d'administration
 */
@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent extends Pannel {

  /**
   * @constructor
   * @param {SessionService} _session - le service session global
   */
  constructor(session: SessionService) {
    super('Admin', session);
  }
  
}

/**
 * Auteur: Florian
 * License: 
 */

import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SimpleNavList } from "app/user/simple-nav-list";
import { SessionService } from "app/services/session.service";
import { RoleCheckerService } from "app/services/role-checker";

/**
 * Menu de navigation du panneau d'admin
 */
@Component({
  selector: 'app-admin-nav-list',
  templateUrl: './admin-nav-list.component.html',
  styleUrls: ['./admin-nav-list.component.css']
})
export class AdminNavListComponent extends SimpleNavList {
  
  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour le style de couleur du texte
   * @param {SessionService} _session - le service de session global
   */
  constructor(sanitizer: DomSanitizer, session: SessionService, roleChecker: RoleCheckerService) {
    super(
      'Admin',
      roleChecker.userIsSuperAdmin() ? [ 'Utilisateurs', 'Projets', 'Logs' ] : [ 'Utilisateurs', 'Projets' ],
      sanitizer,
      session
    );
  }

}

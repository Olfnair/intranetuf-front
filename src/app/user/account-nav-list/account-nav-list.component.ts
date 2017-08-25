/**
 * Auteur: Florian
 * License: 
 */

import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { SimpleNavList } from "app/user/simple-nav-list";
import { SessionService } from "app/services/session.service";

/**
 * Menu de navigation du panneau d'admin
 */
@Component({
  selector: 'app-account-nav-list',
  templateUrl: './account-nav-list.component.html',
  styleUrls: ['./account-nav-list.component.css']
})
export class AccountNavListComponent extends SimpleNavList {
  
  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour le style de couleur du texte
   * @param {SessionService} _session - le service de session global
   */
  constructor(sanitizer: DomSanitizer, session: SessionService) {
    super('Account', [ 'Informations', 'Fichiers', 'Contrôles', 'Validations' ], sanitizer, session);
  }

}

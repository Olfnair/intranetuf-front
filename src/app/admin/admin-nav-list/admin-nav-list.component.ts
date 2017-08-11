/**
 * Auteur: Florian
 * License: 
 */

import { Component, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { NavList, NavListSelectable } from "app/gui/nav-list";
import { SessionService } from "app/services/session.service";

/**
 * Menu de navigation du panneau d'admin
 */
@Component({
  selector: 'app-admin-nav-list',
  templateUrl: './admin-nav-list.component.html',
  styleUrls: ['./admin-nav-list.component.css']
})
export class AdminNavListComponent extends NavList {
  
  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour le style de couleur du texte
   * @param {SessionService} _session - le service de session global
   */
  constructor(
    sanitizer: DomSanitizer,
    private _session: SessionService
  ) {
    super(sanitizer);
    
    // définition des items du menu :
    let items: string[] = [
      // ITEM         // INDEX
      'Utilisateurs', //  0   Section utilisateurs
      'Projets',      //  1   Section projets
      'Logs'          //  2   Section logs
    ];
    
    // ajout des items aux éléments de la NavList :
    // dans session, on va créer un mapping 'AdminNavListItemToIdMap' pour pouvoir récupérer index à partir de item
    let i: number = 0;
    this.selectables = [];                        // on s'assure que la NavList soit vide
    this._session.clearAdminNavListItemToIdMap(); // clear du mapping item -> index
    items.forEach((item: string) => {
      this.selectables.push(new NavListSelectable(i, item, '#000000', '#ffffff')); // ajout de l'item à la NavList
      this._session.mapAdminNavListItemToId(item, i++);                           // création du mapping item -> index
    });
  }

  /**
   * Met à jour l'item sélectionné
   * @param {NavListSelectable} selection - la sélection
   */
  select(selection: NavListSelectable): void {
    this._session.selectedAdminItem = selection.id;
    this.selected = this.selectables[selection.id];
  }

  /** @property {number} selectedAdminItem - Met à jour la sélection en fonction de index indiqué */
  @Input()
  set selectedAdminItem(index: number) {
    this.selected = this.selectables[index];
  }

}

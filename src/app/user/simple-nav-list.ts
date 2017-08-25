/**
 * Auteur: Florian
 * License:
 */

import { Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { NavList, NavListSelectable } from "app/gui/nav-list";
import { SessionService } from "app/services/session.service";

/**
 * Menu de navigation basique
 */
export class SimpleNavList extends NavList {
  
  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour le style de couleur du texte
   * @param {SessionService} _session - le service de session global
   */
  constructor(
    private _navListName: string,
    items: string[],
    sanitizer: DomSanitizer,
    private _session: SessionService
  ) {
    super(sanitizer);

    // Créée un id pour la nav-list si nécessaire
    this._session.getNavListId(this._navListName);
    
    // ajout des items aux éléments de la NavList :
    // dans session, on va créer un mapping 'navListItemToIdMap' pour pouvoir récupérer index à partir de item
    let i: number = 0;
    this.selectables = [];                                    // on s'assure que la NavList soit vide
    this._session.clearNavListItemToIdMap(this._navListName); // clear du mapping item -> index
    items.forEach((item: string) => {
      this.selectables.push(new NavListSelectable(i, item, '#000000', '#ffffff')); // ajout de l'item à la NavList
      this._session.mapNavListItemToId(this._navListName, item, i++);              // création du mapping item -> index
    });
  }

  /**
   * Met à jour l'item sélectionné
   * @param {NavListSelectable} selection - la sélection
   */
  select(selection: NavListSelectable): void {
    this._session.setSelectedItemId(this._navListName, selection.id);
    this.selected = this.selectables[selection.id];
  }

  /** @property {number} selectedItem - Met à jour la sélection en fonction de index indiqué */
  @Input()
  set selectedItem(index: number) {
    this.selected = this.selectables[index];
  }

}
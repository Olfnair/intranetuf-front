/**
 * Auteur : Florian
 * License :
 */

import { Component } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { NavList } from "./nav-list";

/**
 * Composant NavList
 */
@Component({
  selector: 'nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent extends NavList {

  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour les CSS styles (Injecté par le framework)
   */
  constructor(sanitizer: DomSanitizer) {
    super(sanitizer);
  }

}

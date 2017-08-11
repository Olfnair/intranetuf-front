/**
 * Auteur : Florian
 * Licsense :
 */

import { Component, Input, Directive } from '@angular/core';

/**
 * Sélecteur du menu de navigation
 */
@Directive({
  selector: 'sl-sidenav'
})
export class SlSidenav { }

/**
 * Sélecteur du contenu
 */
@Directive({
  selector: 'sl-content'
})
export class SlContent { }


/**
 * Layout : Menu de navigation à gauche | contenu à droite
 */
@Component({
  selector: 'sidenav-layout',
  templateUrl: './sidenav-layout.component.html',
  styleUrls: ['./sidenav-layout.component.css']
})
export class SidenavLayoutComponent {

  /** indique si le menu de navigation est ouvert sur un écran large (> 900px) */
  private _openSidenavOnLarge: boolean = true;
  
  /** indique si le menu de navigation est ouvert sur un petit écran (<= 900px : Tablettes et smartphones) */
  private _openSidenavOnSmall: boolean = false;

  /** @constructor */
  constructor() { }

  /** @property {boolean} openSidenavOnLarge - Sidenav ouvert sur écran large ? */
  get openSidenavOnLarge(): boolean {
    return this._openSidenavOnLarge;
  }

  @Input() set openSidenavOnLarge(value: boolean) {
    this._openSidenavOnLarge = value;
  }

  /** @property {boolean} openSidenavOnSmall - Sidenav ouvert sur petit écran (tablette, smartphone) ? */
  get openSidenavOnSmall(): boolean {
    return this._openSidenavOnSmall;
  }

  @Input() set openSidenavOnSmall(value: boolean) {
    this._openSidenavOnSmall = value;
  }

  /** @property {boolean} - Sidenav ouvert sur écran large OU sur écran petit  */
  get openSidenav(): boolean {
    return (this.openSidenavOnLarge || this.openSidenavOnSmall);
  }

}

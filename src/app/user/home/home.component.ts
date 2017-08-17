/**
 * Auteur : Florian
 * License : 
 */

import { Component } from '@angular/core';
import { SessionService } from "app/services/session.service";

/**
 * Home
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  
  /**
   * @constructor
   * @param {SessionService} _session : données globales de session
   */
  constructor(private _session: SessionService) { }

  /** @property {boolean} logged - indique si l'utilisateur courant est loggé ou non */
  get logged(): boolean {
    return this._session.logged;
  }
  
}

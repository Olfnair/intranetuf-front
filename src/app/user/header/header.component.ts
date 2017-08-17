/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { SessionService } from "app/services/session.service";
import { RoleCheckerService } from "app/services/role-checker";

/**
 * Header de l'application
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  /** Afficher le bouton pour afficher/cacher le menu de navigation ? */
  private _displayListButton: boolean = false;

  /** @event - Affiche/Cache le menu de navigation sur un écran large (> 900px) */
  private _toggleOnLarge$: EventEmitter<void> = new EventEmitter<void>();
  /** @event - Affiche/Cache le menu de navigation sur un petit écran (<= 900px) */
  private _toggleOnSmall$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @constructor
   * @param {SessionService} _session - données globales de session
   * @param {RoleCheckerService} _roleCheckerService - service global de check des rôles
   */
  constructor(
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService
  ) { }

  /**
   * @event toggleOnLarge - Afficher/Cacher le menu sur un écran large
   * @returns {EventEmitter<void>}
   */
  @Output('toggleOnLarge')
  get toggleOnLarge$(): EventEmitter<void> {
    return this._toggleOnLarge$;
  }

  /**
   * @event toggleOnSmall - Afficher/Cacher le menu sur un petit écran
   * @returns {EventEmitter<void>}
   */
  @Output('toggleOnSmall')
  get toggleOnSmall$(): EventEmitter<void> {
    return this._toggleOnSmall$;
  }

  /**
   * @property {boolean} displayListButton - indique s'il faut afficher ou non le bouton pour afficher/cacher le menu
   */
  get displayListButton(): boolean {
    return this._displayListButton;
  }

  @Input()
  set displayListButton(value: boolean) {
    this._displayListButton = value;
  }

  /** @property {boolean} logged - indique si l'utlisateur courant est loggé ou non */
  get logged(): boolean {
    return this._session.logged;
  }

  /** @property {boolean} isAdmin - indique si l'utilisateur courant est admin ou non */
  get isAdmin(): boolean {
    return this._roleCheckerService.userIsAdmin()
        || this._roleCheckerService.userIsSuperAdmin();
  }

  /** @property {string} userLogin - le login de l'utilisateur courant */
  get userLogin(): string {
    return this._session.userLogin;
  }

  /**
   * Déconnecte l'utilisateur courant
   */
  disconnect(): void {
    this._session.logout();
  }

  /**
   * @emits toggleOnLarge - Affiche/Cacher le menu sur un écran large
   */
  toggleOnLarge(): void {
    this._toggleOnLarge$.emit();
  }

  /**
   * @emits toggleOnSmall -  Afficher/Cacher le menu sur un petit écran
   */
  toggleOnSmall(): void {
    this._toggleOnSmall$.emit();
  }

}

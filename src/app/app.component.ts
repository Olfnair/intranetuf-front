/**
 * Auteur : Florian
 * License : 
 */

import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from "app/services/session.service";
import { Project } from "entities/project";

/**
 * Composant racine de l'application
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  /** Afficher sidenav (menu de navigation) sur écran large ? (> 900px) */
  private _sidenavShowOnLarge: boolean = true;
  /** Afficher sidenav sur petit écran ? */
  private _sidenavShowOnSmall: boolean = false;

  /**
   * @constructor
   * @param {SessionService} _session - données globales de session
   * @param {Router} _router - router pour connaitre la route activée 
   */
  constructor(private _session: SessionService, private _router: Router) { }

  /** @property {boolean} showSidenav - indique s'il faut afficher le menu de navigation ou non */
  get showSidenav(): boolean {
    return this._sidenavShowOnLarge || this._sidenavShowOnSmall;
  }

  /**
   * @property {boolean} sidenavShowOnLarge - indique s'il faut afficher le menu de navigation sur écran
   *                                          large (> 900px)
   */
  get sidenavShowOnLarge(): boolean {
    return this._sidenavShowOnLarge;
  }

   /**
   * @property {boolean} sidenavShowOnSmall - indique s'il faut afficher le menu de navigation sur petit
   *                                          écran (<= 900px)
   */
  get sidenavShowOnSmall(): boolean {
    return this._sidenavShowOnSmall;
  }

  /** @property {boolean} logged - indique si l'utilisateur dcourant est connecté ou non */
  get logged(): boolean {
    return this._session.logged;
  }

  /** @property {Project} selectedProject - projet sélectionné dans le menu de navigation des projets */
  get selectedProject(): Project {
    return this._session.selectedProject;
  }

  /** @property {boolean} updateProjectList - indique s'il faut mettre à jour la liste des projets ou non */
  get updateProjectList(): boolean {
    return this._session.updateProjectList;
  }

  /**
   * @property {number} selectedAdminItem - id de l'élément sélectionné dans le menu de navigation du panneau
   *                                        d'admin
   */
  get selectedAdminItem(): number {
    return this._session.selectedAdminItem;
  }

  /** @property {string} route - la route courante */
  get route(): string {
    return this._router.url;
  }

  /**
   * Affiche/Cache le menu de navigation sur un petit écran
   */
  toggleSidenavOnSmall(): void {
    this._sidenavShowOnSmall = ! this._sidenavShowOnSmall;
  }

  /**
   * Affiche/Cache le menu de navigation sur un écran large
   */
  toggleSidenavOnLarge(): void {
    this._sidenavShowOnLarge = ! this._sidenavShowOnLarge;
  }

  /**
   * Indique s'il faut afficher le menu de navigation des projets
   * @returns {boolean} - true s'il faut afficher le menu de navigation des projets, sinon false
   */
  showProjectList(): boolean {
    return this.route == '/home' && this.logged;
  }

  /**
   * Indique s'il faut afficher le menu de navigation du panneau d'admin
   * @returns {boolean} - true s'il faut afficher le menu de navigation du panneau d'admin, sinon false
   */
  showAdminNavList(): boolean {
    return this.route == '/admin';
  }

  /**
   * Indique à la page qu'elle est autorisée à charger son contenu
   */
  loaded(): void {
    this._session.readyForContent = true;
  }
  
}

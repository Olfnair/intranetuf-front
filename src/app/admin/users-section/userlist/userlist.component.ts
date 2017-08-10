/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { BasicRoleChecker, RoleCheckerService } from "app/services/role-checker";
import { DatatableContentManager } from "app/gui/datatable";
import { User, Roles } from "entities/user";
import { FlexQueryResult } from "objects/flex-query-result";

/**
 * Datatable de la liste des utilisateurs dans le panneau d'admin
 */
@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent extends DatatableContentManager<User, RestApiService> implements OnInit {
  
  // Events :
  /** @event - Ajouter un utilisateur */
  private _add$: EventEmitter<void> = new EventEmitter<void>();
  /** @event - editer un utilisateur */
  private _edit$: EventEmitter<User> = new EventEmitter<User>();
  /** @event - gérer les droits d'un utilisateur */
  private _rights$: EventEmitter<User> = new EventEmitter<User>();

  /**
   * @constructor
   * @param {RestApiService} restService - service REST
   * @param {SessionService} _session - service de session global
   * @param {RoleCheckerService} _roleCheckerService - service de vérification de rôle global
   * @param {Router} _router - router pour pouvoir faire des navigations/redirections
   */
  constructor(
    restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _router: Router
  ) {
    super(
      restService, // service REST à utiliser
      'fetchUsers' // nom de la méthode du service à utiliser
    );
  }

  /**
   * Après l'initialisation...
   */
  ngOnInit() {
    this.load(); // chargement des utilisateurs dans la datatable
  }

  /**
   * @event add - demande d'ajout d'un utilisateur
   * @returns {EventEmitter<void>}
   */
  @Output('add')
  get add$(): EventEmitter<void> {
    return this._add$;
  }

  /**
   * @event edit - demande d'édition d'un utilisateur
   * @returns {EventEmitter<User>} - l'utilisateur à éditer
   */
  @Output('edit')
  get edit$(): EventEmitter<User> {
    return this._edit$;
  }

  /**
   * @event rights - demande de gestion des droits d'un utilisateur
   * @returns {EventEmitter<User>} - l'utilisateur dont on veut gérer les droits
   */
  @Output('rights')
  get rights$(): EventEmitter<User> {
    return this._rights$;
  }

  /**
   * Ajouter un utilisateur
   * @emits add - demande d'ajout d'un utilisateur
   */
  add(): void {
    this._add$.emit();
  }

  /**
   * Editer/modifier l'utilisateur user
   * @param {User} user l'utilisateur à modifier
   * @emits edit - demande d'édition de l'utilisateur user 
   */
  edit(user: User) {
    this._edit$.emit(user);
  }

  /**
   * Afficher les droits de l'utilisateur user
   * @param {User} user _ utilisateur dont on doit afficher les droits
   * @emits rights - demande d'affichage des droits de l'utilisateur user
   */
  rights(user: User): void {
    this._rights$.emit(user);
  }

  /**
   * Suppression de l'utilisateur user
   * @param {User} user - utilisateur à supprimer
   */
  delete(user: User): void {
    
  }

  /** @property {BasicRoleChecker} roleChecker - roleChecker permettant de vérifier le role de l'utiliseur courant */
  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
  }

  /**
   * Utiliser le compte correspondant à login
   * @param {string} login - le login du compte qu'on veut utiliser 
   */
  adminLoginAs(login: string): void {
    // Authentification :
    let sub: Subscription = this._session.adminLoginAs(login).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (success: Response) => { // OK : authentification réussie
        this._router.navigate(['/']); // retour vers l'accueil sur le compte correspondant à 'login'
      },
      (error: Response) => {   // Erreur :
        // TODO : afficher un beau message d'erreur (hints : utiliser ModalService)
      }
    );
  }

  /**
   * Indique si l'utilisateur user a le rôle SUPERADMIN ou non
   * @param {User} user - l'utilisateur dont on veut savoir s'il est SUPERADMIN ou non
   * @returns {boolean} - true => user est SUPERADMIN, false => user n'est pas SUPERADMIN 
   */
  isSuperAdmin(user: User): boolean {
    return User.hasRole(user.role, Roles.SUPERADMIN);
  }
}

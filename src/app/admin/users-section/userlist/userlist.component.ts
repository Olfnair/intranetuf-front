/**
 * Auteur : Florian
 * License : 
 */

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { BasicRoleChecker, RoleCheckerService } from "app/services/role-checker";
import { DatatableContentManager, DatatableSelectionManager } from "app/gui/datatable";
import { User, Roles } from "entities/user";

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

  /** permet d'activer/désactiver la sélection */
  private _selectionManager: DatatableSelectionManager<User, RestApiService, ModalService>;

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
    private _router: Router,
    private _modal: ModalService
  ) {
    super(
      restService,  // service REST à utiliser
      'fetchUsers', // nom de la méthode du service à utiliser
      false,        // ne pas afficher le spinner de chargement lors des chargements suivants
      () => {       // mets à jour les utlisateurs sélectionnés
        this._selectionManager.updateSelectedEntities(this._selectionManager.selectedEntities);
      }
    );

    this._selectionManager = new DatatableSelectionManager<User, RestApiService, ModalService>(
      restService,              // service REST utilisé
      'activateManyUsers',      // méthode pour activer ou désactiver les utilisateurs sélectionnés
      this,                     // content manager
      this._modal               // modale pour les messages d'erreur
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
   * @property {DatatableSelectionManager<User, RestApiService, ModalService>} selectionManager -
   * manager des sélections
   */
  get selectionManager(): DatatableSelectionManager<User, RestApiService, ModalService> {
    return this._selectionManager;
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
   * Réinitialisation du mot de passe de l'utilisateur
   * @param {User} user - l'utilisateur dont il faut réinitialiser le mot de passe
   */
  resetPassword(user: User): void {
    user.pending = true;
    let sub : Subscription = this._restService.editUser(user).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: Response) => {    // OK :
        this._modal.info('Activation', 'Un mail d\'activation a été envoyé', true).subscribe();
      },
      (error: Response) => {  // Erreur :
        this._modal.info(
          'Erreur',
          'Erreur lors de la tentative d\'envoi d\'un e-mail d\'activation',
          false
        ).subscribe();
      }
    );
  }

  /**
   * Active ou désactive un compte
   * @param {User} user - utilisateur dont il faut activer/désactiver le compte
   * @param {boolean} activate - true => activer, false => désactiver
   */
  activateAccount(user: User, activate: boolean): void {
    let methodName: string;
    let userCopy: any = {};
    Object.keys(user).forEach((k: string) => { userCopy[k] = user[k] });
    if(activate) {  // Activation
      userCopy.active = true;
      methodName = 'editUser';
    }
    else {          // Désactivation
      methodName = 'deleteUser';
    }
    let sub: Subscription = this._restService[methodName](userCopy).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: Response) => {    // OK :
        this.load(); // on recharge la table
      },
      (error: Response) => {  // Erreur :
        // TODO : afficher un message d'erreur (utiliser ModalService)
      }
    );
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

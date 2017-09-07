/**
 * Auteur : Florian
 * License :
 */

import { Component, Output, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { RoleCheckerService, BasicRoleChecker } from "app/services/role-checker";
import { ModalService } from "app/gui/modal.service";
import { GuiForm } from "app/gui/gui-form";
import { CustomValidators } from "app/shared/custom-validators";
import { User } from "entities/user";

/**
 * Formulaire d'ajout / édition d'un utilisateur
 */
@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent extends GuiForm {

  /** Utilisateur à éditer, undefined pour créer un nouvel utilisateur */
  private _userToEdit: User = undefined;

  /** mode admin ou non */
  private _isAdminMode: boolean = false;

  /** Rôles courants définis pour l'utilisateur dans le form */
  private _roles: number = 0;

  /** form avant modfification */
  private _initialValue: any = undefined;
  
  /** @event - click sur le bouton 'ajouter' */
  private _close$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST
   * @param {ModalService} _modal - service d'affichage des fenêtres popups
   * @param {RoleCheckerService} _roleCheckerService - service global permettant de checker les rôles de l'utilisateur
   */
  constructor(
    private _restService: RestApiService,
    private _modal: ModalService,
    private _roleCheckerService: RoleCheckerService
  ) {
    super();
  }

  /** @property {User} userToEdit - Utilisateur à éditer, undefined pour créer un nouvel utilisateur */
  get userToEdit(): User {
    return this._userToEdit;
  }

  @Input()
  set userToEdit(userToEdit: User) {
    if(userToEdit != undefined) {
      this._roles = userToEdit.role;
      this.form.patchValue(userToEdit);
      this._initialValue = this.form.value;
    }
    this._userToEdit = userToEdit;
  }

  /**
   * @property {boolean} isAdminMode - indique si on édite du point de vue d'un admin (true)
   *                                   ou de celui d'un utilisateur (false)
   */
  get isAdminMode(): boolean {
    return this._isAdminMode;
  }

  @Input()
  set isAdminMode(isAdminMode: boolean) {
    this._isAdminMode = isAdminMode;
  }

  /** @property {BasicRoleChecker} roleChecker - roleChecker permettant de vérifier le role de l'utiliseur courant */
  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
  }

  addRole(role: number): number {
    return this._roles | role;
  }

  removeRole(role: number): number {
    return this._roles & (0xffffffff - role);
  }

  setRole(add: boolean, role: number): void {
    this._roles = add ? this.addRole(role) : this.removeRole(role);
    this.form.controls.role.patchValue(this._roles.toString());
  }

  hasRole(role: number): boolean {
    return User.hasRole(this._roles, role); 
  }

  /** @property {boolean} modified - indique si le formulaire a été modifié ou non */
  get modified(): boolean {
    let keys: string[] = Object.keys(this.form.value);
    for(let i: number = 0; i < keys.length; ++i) {
      if(this._initialValue[keys[i]] != this.form.value[keys[i]]) {
        return true;
      }
    }
    return false;
  }

  /**
   * @event close - fermeture du formulaire
   * @returns {EventEmitter<boolean>} - true => enregistré, false => annulé
   */
  @Output('close')
  get close$(): EventEmitter<boolean> {
    return this._close$;
  }

  /**
   * Enregistre la création d'un utilisateur
   * @emits close - fermeture du formulaire
   */
  submit(): void {
    // Création d'une instance user en fonction des informations du formulaire :
    let user: User = new User();
    if(this._userToEdit != undefined) {
      Object.keys(this._userToEdit).forEach((k: string) => { user[k] = this._userToEdit[k]});
    }
    user.name = this.form.value.name;
    user.firstname = this.form.value.firstname;
    user.login = this.form.value.login;
    user.email = this.form.value.email;
    user.role = this._roles;

    // création ou édition :
    this.editOrCreateUser(user);
  }

  editOrCreateUser(user: User) {
    let methodName: string;
    let modalTitle: string;
    let modalText: string;
    if(this._userToEdit != undefined) {
      methodName = 'editUser';
      user.id = this._userToEdit.id;
      modalTitle = 'Compte Modifié';
      modalText = 'Le compte a été modifié avec succès.';
    }
    else {
      methodName = 'createUser';
      modalTitle = 'Compte Créé';
      modalText = "Le compte a été créé avec succès. L'utilisateur va recevoir un email qui l'invite à choisir "
        + "un mot de passe avant de pouvoir utiliser son compte.";
    }

    // Appel au service REST pour créer/modifier l'utilisateur dans la bdd :
    let createUserSub: Subscription = this._restService[methodName](user).finally(() => {
      createUserSub.unsubscribe(); // Finally, quand tout est terminé : libérer les ressources
    }).subscribe(
      (res: any) => {           // OK : utilisateur créé/modifié avec succès
        let sub: Subscription = this._modal.info(modalTitle, modalText, true).finally(() => {
          sub.unsubscribe();
        }).subscribe();
        this._userToEdit = user;
        this._initialValue = this.form.value;
        this._close$.emit(true);
      },
      (error: Response) => {    // Erreur :
        if(error.json().restError.message == 'login') { // le login choisi existait déjà
          let sub: Subscription = this._modal.info(
            "Login invalide",
            "Le login choisi est déjà utilisé par un autre utilisateur",
            false
          ).finally(() => sub.unsubscribe()).subscribe();
        }
        else {                                          // autre erreur
          let sub: Subscription = this._modal.info(
            "Erreur",
            "Une erreur indéterminée s'est produite...",
            false
          ).finally(() => sub.unsubscribe()).subscribe();
        }
      }
    );
  }

  /**
   * Annule la création/modification
   * @emits close - fermeture du formulaire
   */
  cancel(): void {
    this._close$.emit(false);
  }

  /**
   * Construit le formulaire
   * @protected
   * @override
   * @returns {FormGroup} - Le formulaire construit
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      // champ Nom :
      name: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2) // requis, au moins 2 caractères
      ])),

      // champ Prénom :
      firstname: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2) // requis, au moins 2 caractères
      ])),

      // champ Login : 
      login: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2), // requis, au moins 2 caractères,
        CustomValidators.login                        // regex login (: que lettres sans accents et chiffres)
      ])),

      // champ E-mail :
      email: new FormControl('', Validators.compose([
        Validators.required, CustomValidators.email   // requis, regex email
      ])),

      // champ Rôle :
      role: new FormControl('0')                      // champ caché contenant le rôle
    });
  }

}

/**
 * Auteur : Florian
 * License :
 */

import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
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
  
  /** @event - click sur le bouton 'ajouter' */
  private _close$: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST
   * @param {ModalService} _modal - service d'affichage des fenêtres popups
   */
  constructor(
    private _restService: RestApiService,
    private _modal: ModalService
  ) {
    super();
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
   * Enregistre la création/modification d'un utilisateur
   * @emits close - fermeture du formulaire
   */
  submit(): void {
    // Création d'une instance user en fonction des informations du formulaire :
    let user: User = new User();
    user.name = this.form.value.name;
    user.firstname = this.form.value.firstname;
    user.login = this.form.value.login;
    user.email = this.form.value.email;

    // Appel au service REST pour créer l'utilisateur dans la bdd :
    let addUserSub: Subscription = this._restService.createUser(user).finally(() => {
        addUserSub.unsubscribe(); // Finally, quand tout est terminé : libérer les ressources
    }).subscribe(
      (user: User) => {           // OK : utilisateur créé avec succès
        let sub: Subscription = this._modal.info(
          "Compte créé",
          "Le compte a été créé avec succès. L'utilisateur va recevoir un email qui l'invite à choisir " +
          "un mot de passe avant de pouvoir utiliser son compte.",
          true
        ).finally(() => sub.unsubscribe()).subscribe();
        this._close$.emit(true);
      },
      (error: Response) => {      // Erreur :
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
      ]))
    });
  }

}

/**
 * Auteur : Florian
 * License : 
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Response } from "@angular/http";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { GuiForm } from "app/gui/gui-form";
import { Base64 } from "app/shared/base64";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { User } from "entities/user";

/**
 * Composant pour que les utilisateurs puissent choisir leur mot de passe et activer leur compte
 */
@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent extends GuiForm implements OnInit, OnDestroy {
  
  /** Longeur min du mot de passe */
  public static readonly minlength: number = 8;
  
  /** subscription aux paramètres de route */
  private _paramsSub: Subscription;

  /** token d'authentification pour l'activation */
  private _authToken: AuthToken;
  /** user à activer */
  private _user: User = undefined;
  /** erreur ? */
  private _error: boolean = false;
  /** texte d'erreur */
  private _errorText: string = '';

  /**
   * @constructor
   * @param {Router} _router - router
   * @param {ActivatedRoute} _route - route activée 
   * @param {SessionService} _session - infos globales de session 
   * @param {RestApiService} _restService - service REST utilisé
   * @param {ModalService} _modal - service pour afficher les modales
   */
  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _session: SessionService,
    private _restService: RestApiService,
    private _modal: ModalService
  ) { super(); }

  /**
   * Après initialisation...
   */
  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      // récupération du token dans l'url :
      this._authToken = JSON.parse(Base64.urlDecode(params['token']) || undefined);
      if (!this._authToken) {
        this._router.navigate(['/home']);
      }
      else {
        this._session.authToken = this._authToken;
        
        // utilisateur à activer :
        let userSub: Subscription = this._restService.getUserToActivate()
          .finally(() => {
            userSub.unsubscribe();
          })
          .subscribe(
            (user: User) => {
              this._user = user;
            },
            (error: Response) => {
              if(error.status == 404) {
                this.setError("Erreur: impossible de trouver le compte à activer. Vérifiez le lien d'activation dans l'email qui vous a été envoyé. Si l'erreur persiste, contactez l'administrateur.");
              }
              else if(error.status == 403 && error.text() == 'user') {
                this.setError("Erreur: ce compte a déjà été activé. Connectez-vous à partir de l'accueil.");
              }
              else if(error.status == 401) {
                this.setError("Erreur: lien invalide. Contactez l'administrateur pour qu'il vous en renvoie un.");
              }
              else {
                this.setError("Erreur: une erreur dont la provenance n'a pu être identifiée s'est produite.");
              }
            }
          );
      }
    });
  }

  /**
   * Après la destruction du composant...
   */
  ngOnDestroy() {
    this._paramsSub.unsubscribe();
  }

  /** @property {boolean} error - indique s'il y a une erreur de chargement ou non */
  get error(): boolean {
    return this._error;
  }

  /** @property {string} errorText - texte de l'erreur de chargement */
  get errorText(): string {
    return this._errorText;
  }

  
  /**
   * Mettre une erreur
   * @param {string} text - texte de l'erreur 
   */
  setError(text: string): void {
    this._error = true;
    this._errorText = text;
  }

  /** @property {User} user - utilisateur à activer */
  get user(): User {
    return this._user;
  }

  /** @property {number} longueur min du mot de passe */
  get minlength(): number {
    return ActivateAccountComponent.minlength;
  }

  /** @property {boolean} valid - indique si le formulaire est valide ou pas */
  get valid(): boolean {
    return (this.form.valid && this.form.controls.pwd.value == this.form.controls.pwd_confirm.value);
  }

  /**
   * Enregistre le mot de passe entré dans le formulaire et redirige l'utilisateur vers l'accueil pour
   * l'inviter à se connecter
   */
  submit(): void {
    let userActivateSub: Subscription = this._restService.activateUser(this._user.id, new Credentials(undefined, this.form.value.pwd))
      .finally(() => {
        userActivateSub.unsubscribe();
      })
      .subscribe(
        (status: number) => {
          let text = "Votre compte a été activé avec succès ! Vous allez être redirigé vers l'acceuil où vous pourrez vous connecter.";
          this._session.logout(); // reset la session : on avait modifié le token pour l'activation, il faut mtn un token de session
          this.infoModal('Compte Activé', text, true);
        },
        (error: Response) => {
          let text: string;
          if(error.status == 401) {
            text = 'Ce compte n\'est pas le votre !';
          }
          else if(error.status == 403 && error.text() == 'user') {
            text = 'Ce compte est déjà activé !';
          }
          else if(error.status == 403 && error.text() == 'password') {
            text = 'Votre mot de passe n\'est pas suffisamment robuste';
          }
          else {
            text = 'Une erreur s\'est produite.';
          }
          this.infoModal('Erreur', text, false);
        }
      );
  }

  /**
   * Redirection vers l'accueil
   */
  cancel(): void {
    this._router.navigate(['/home']);
  }

  /**
   * Modale d'information
   * @param {string} title - titre
   * @param {string} text - texte de la modale
   * @param {boolean} success - information de réussite (true), ou d'échec (false)
   */
  infoModal(title: string, text: string, success: boolean = false): void {
    let modalSub: Subscription = this._modal.info(title, text, success).finally(() => {
      modalSub.unsubscribe();
    }).subscribe(
      (success: boolean) => {
        if(success) {
          this._router.navigate(['/home']);
        }
      },
      (error: any) => {
        // gestion erreur
      }
    );
  }

  /**
   * Construction du formulaire
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      pwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(ActivateAccountComponent.minlength)
      ])),
      pwd_confirm: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }
  
}

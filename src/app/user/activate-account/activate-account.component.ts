import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Response } from "@angular/http";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { GuiForm } from "app/gui/gui-form";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { User } from "entities/user";

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent extends GuiForm implements OnInit, OnDestroy {
  public static readonly minlength: number = 8;
  
  private _paramsSub: Subscription;

  private _authToken: AuthToken;
  private _user: User = undefined;
  private _error: boolean = false;
  private _errorText: string = '';

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _session: SessionService,
    private _restService: RestApiService,
    private _modal: ModalService
  ) { super(); }

  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      this._authToken = JSON.parse(decodeURIComponent(params['token']) || undefined);
      console.log(this._authToken);
      if (!this._authToken) {
        this._router.navigate(['/home']);
      }
      else {
        this._session.authToken = this._authToken;
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

  ngOnDestroy() {
    this._paramsSub.unsubscribe();
  }

  get error(): boolean {
    return this._error;
  }

  get errorText(): string {
    return this._errorText;
  }

  setError(text: string): void {
    this._error = true;
    this._errorText = text;
  }

  get user(): User {
    return this._user;
  }

  get minlength(): number {
    return ActivateAccountComponent.minlength;
  }

  get valid(): boolean {
    return (this.form.valid && this.form.controls.pwd.value == this.form.controls.pwd_confirm.value);
  }

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

  cancel(): void {
    this._router.navigate(['/home']);
  }

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
     * @override
     */
  protected _buildForm(): FormGroup {
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

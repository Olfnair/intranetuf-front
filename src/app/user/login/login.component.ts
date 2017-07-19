import { Component } from '@angular/core';
import { Response } from "@angular/http";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { GuiForm } from "app/gui/gui-form";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends GuiForm {
  private _loginFail: boolean = false;
  private _loginFailMessage: string = undefined;

  constructor(private _router: Router, private _session: SessionService) {
    super();
  }

  get loginFail(): boolean {
    return this._loginFail;
  }

  get loginFailMessage(): string {
    return this._loginFailMessage;
  }

  private _loginFailure(res: Response): void {
    if(res.status == 401) {
      this._loginFailMessage = 'Identifiants invalides !';
    }
    else if(res.status == 0) {
      this._loginFailMessage = 'Problème de connexion au serveur...';
    }
    else {
      this._loginFailMessage = 'Une erreur indéterminée est survenue.';
    }
    this._loginFail = true;
    this.reset(); 
  }

  private _loginSuccess(): void {
    this._loginFail = false;
    this._router.navigate(['/home']);
  }

  submit(): void {
    let login: string = this.form.value.login;
    let password: string = this.form.value.pwd;
    let sub: Subscription = this._session.login(this.form.value.login, this.form.value.pwd).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (success: Response) => {
        this._loginSuccess()
      },
      (error: Response) => {
        this._loginFailure(error)
      }
    );
  }

  cancel() {
    this._router.navigate(['/home']);
  }

  /**
     *
     * @override
     */
  protected _buildForm(): FormGroup {
    return new FormGroup({
      login: new FormControl('', Validators.compose([
        Validators.required
      ])),
      pwd: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }
}

import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { GuiForm } from "app/gui/gui-form";
import { Router } from "@angular/router";
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends GuiForm {
  private _loginFail: boolean = false;

  constructor(private _router: Router, private _session: SessionService) {
    super();
  }

  get loginFail(): boolean {
    return this._loginFail;
  }

  private _loginFailure(): void {
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
    this._session.login(this.form.value.login, this.form.value.pwd).subscribe(
      data => data ? this._loginSuccess() : this._loginFailure(),
      error => this._loginFailure()
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

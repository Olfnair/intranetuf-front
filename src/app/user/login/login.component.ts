import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SessionService } from "services/session.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // private property to store form value
  private _form: FormGroup;
  private _loginFail: boolean;

  constructor(private _router: Router, private _session: SessionService) {
    this._form = this._buildForm();
    this._loginFail = false;
  }

  ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }

  get loginFail(): boolean {
    return this._loginFail;
  }

  private _loginFailure(): void {
    this._loginFail = true;
    this._form = this._buildForm(); 
  }

  private _loginSuccess(): void {
    this._loginFail = false;
    this._router.navigate(['/home']);
  }

  submit(): void {  
    let login: string = this._form.value.login;
    let password: string = this._form.value.pwd;
    this._session.login(this._form.value.login, this._form.value.pwd).subscribe(
      data => data ? this._loginSuccess() : this._loginFailure(),
      error => this._loginFailure()
    );
  }

  cancel() {
    this._router.navigate(['/home']);
  }

  /**
     * Function to build our form
     *
     * @returns {FormGroup}
     *
     * @private
     */
  private _buildForm(): FormGroup {
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

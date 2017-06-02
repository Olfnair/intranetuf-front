import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { RestApiService } from "app/shared/rest-api.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // private property to store form value
  private _form: FormGroup;

  constructor(private _router: Router, private _restService: RestApiService) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form() {
    return this._form;
  }

  submit() {  
    let login: string = this._form.value.login;
    let password: string = this._form.value.pwd;
    this._restService.authUser(this._form.value.login, this._form.value.pwd).subscribe(
      data => data ? console.log('ok') : console.log('pas ok')
    );
    
    console.log(this._form.value.login);
    console.log(this._form.value.pwd);
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

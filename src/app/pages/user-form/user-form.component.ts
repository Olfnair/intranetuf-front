import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CustomValidators } from "app/shared/custom-validator";

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private _form: FormGroup;

  constructor(private _router: Router) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form() {
    return this._form;
  }

  cancel() {
    this._router.navigate(['/home']);
  }

  noPaste(event: Event) {
    event.preventDefault();
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
      name: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2)
      ])),
      firstname: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2)
      ])),
      login: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2)
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required, CustomValidators.email
      ]))/*,
      pwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2)
      ])),
      pwd_confirm: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(2)
      ]))*/
    });
  }

}

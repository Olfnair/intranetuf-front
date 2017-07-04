import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "services/rest-api.service";
import { CustomValidators } from "app/shared/custom-validators";
import { User } from "entities/user";

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private _form: FormGroup;
  private _close$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private _router: Router, private _restService: RestApiService) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }

  submit(): void {
    let user: User = new User();
    user.name = this._form.value.name;
    user.firstname = this._form.value.firstname;
    user.login = this._form.value.login;
    user.email = this._form.value.email;
    let addUserSub: Subscription = this._restService.addUser(user)
      .finally(() => {
        addUserSub.unsubscribe();
        this._close$.emit(true);
      })
      .subscribe();
  }

  cancel(): void {
    this._close$.emit(false);
  }

  @Output('close') get close$(): EventEmitter<boolean> {
    return this._close$;
  }

  noPaste(event: Event): void {
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
      ]))
    });
  }

}

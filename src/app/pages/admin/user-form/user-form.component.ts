import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
  private _close$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private _router: Router) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }

  submit(): void {
    this._close$.emit(true);
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

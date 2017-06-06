import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {
  // private property to store form value
  private _form: FormGroup;

  public static readonly minlength: number = 8;

  constructor(private _router: Router) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }

  get minlength(): number {
    return ActivateAccountComponent.minlength;
  }

  submit(): void {
  }

  cancel(): void {
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
      pwd: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(ActivateAccountComponent.minlength)
      ])),
      pwd_confirm: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }
}

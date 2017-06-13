import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  private _form: FormGroup;

  constructor(private _router: Router) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  get form(): FormGroup {
    return this._form;
  }

  submit(): void {
    this._router.navigate(['/home']);
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
      filename: new FormControl('', /*Validators.compose([
        Validators.required
      ])*/)
    });
  }

}

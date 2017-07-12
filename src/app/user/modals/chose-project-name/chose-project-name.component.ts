import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProjectlistComponent } from "app/user/projectlist/projectlist.component";
import { GuiForm } from "app/gui/gui-form";
import { ModalService } from "app/gui/modal.service";
import { ChoseProjectNameOptions } from "app/user/modals/chose-project-name/chose-project-name-options";

@Component({
  selector: 'chose-project-name',
  templateUrl: './chose-project-name.component.html',
  styleUrls: ['./chose-project-name.component.css']
})
export class ChoseProjectNameComponent extends GuiForm {

  private _options: ChoseProjectNameOptions = undefined;

  constructor(private _modal: ModalService, @Inject(MD_DIALOG_DATA) options: ChoseProjectNameOptions) {
    super();
    this._options = new ChoseProjectNameOptions(options);
  }

  get options(): ChoseProjectNameOptions {
    return this._options;
  }

  submit(): void {
    this._modal.close(this.form.controls.name.value);
  }

  /**
     * Function to build our form
     *
     * @returns {FormGroup}
     *
     * @override
     */
  protected _buildForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

}

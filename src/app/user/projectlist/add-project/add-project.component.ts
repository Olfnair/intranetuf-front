import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ProjectlistComponent } from "app/user/projectlist/projectlist.component";
import { GuiForm } from "app/gui/gui-form";
import { ModalService } from "app/gui/modal.service";

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent extends GuiForm {

  constructor(private _modal: ModalService) {
    super();
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

import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MD_DIALOG_DATA } from '@angular/material';
import { ProjectlistComponent } from "app/user/projectlist/projectlist.component";

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  private _form: FormGroup;

  constructor(@Inject(MD_DIALOG_DATA) private _projectList: ProjectlistComponent) {
    this._form = this._buildForm();
  }

  ngOnInit() {
  }

  close(projectName: string): void {
    if(this._projectList && this._form.valid) {
      this._projectList.closeAddDlg(projectName);
    }
  }

  get form(): FormGroup {
    return this._form;
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
        Validators.required
      ]))
    });
  }

}

import { FormGroup } from "@angular/forms";

export abstract class GuiForm {
  private _form: FormGroup = this._buildForm();

  constructor() { }
  
  get form(): FormGroup {
    return this._form;
  }

  protected get guiForm(): GuiForm {
    return this;
  }

  reset(): void {
    this._form = this._buildForm();
  }

  /**
     * Function to build our form
     *
     * @returns {FormGroup}
     *
     * @protected
     */
  protected abstract _buildForm(): FormGroup;
}
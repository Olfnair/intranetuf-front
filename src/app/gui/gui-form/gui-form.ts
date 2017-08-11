/**
 * Auteur : Florian
 * License : 
 */

import { FormGroup } from "@angular/forms";

/**
 * Classe à étendre par les composants qui doivent gérer un formulaire
 * @abstract
 */
export abstract class GuiForm {
  
  /** Contrôles/Inputs et sur ces inputs du formulaire */
  private _form: FormGroup = this.buildForm();

  /** @constructor */
  constructor() { }
  
  /** @property {FormGroup} form - Contrôles/Inputs du formulaire */
  get form(): FormGroup {
    return this._form;
  }

  /**
   * @property {GuiForm} guiForm - objet this
   * @protected
   */
  protected get guiForm(): GuiForm {
    return this;
  }

  /**
   * Réinitialise le formulaire
   */
  reset(): void {
    this._form = this.buildForm();
  }

  /**
   * Function qui va générer le formulaire
   * @protected
   * @abstract
   * @returns {FormGroup} - les contrôles/inputs du formulaire
   */
  protected abstract buildForm(): FormGroup;
  
}
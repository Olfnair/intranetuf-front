/**
 * Auteur : Florian
 * License : 
 */

import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { GuiForm } from "app/gui/gui-form";
import { ModalService } from "app/gui/modal.service";
import { ChoseProjectNameOptions } from "app/user/modals/chose-project-name/chose-project-name-options";

/**
 * Modale de choix de nom de projet
 */
@Component({
  selector: 'chose-project-name',
  templateUrl: './chose-project-name.component.html',
  styleUrls: ['./chose-project-name.component.css']
})
export class ChoseProjectNameComponent extends GuiForm {

  /** options de la modale */
  private _options: ChoseProjectNameOptions = undefined;

  /**
   * @constructor
   * @param {ModalService} _modal - service d'affichage des modales
   * @param {ChoseProjectNameOptions} options - options de la modale
   */
  constructor(private _modal: ModalService, @Inject(MD_DIALOG_DATA) options: ChoseProjectNameOptions) {
    super();
    this._options = new ChoseProjectNameOptions(options);
  }

  /** @property {ChoseProjectNameOptions} options - options de la modale */
  get options(): ChoseProjectNameOptions {
    return this._options;
  }

  /**
   * Ferme la modale en renvoyant le nom choisi
   */
  submit(): void {
    this._modal.close(this.form.controls.name.value);
  }

  /**
   * Construction du formulaire de choix du nom de projet
   * @protected
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

}

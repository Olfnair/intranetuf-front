/**
 * Auteur : Florian
 * License : 
 */

import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { GuiModalData } from "app/gui/gui-modal";

/**
 * Composant générique pour afficher une modale
 */
@Component({
  selector: 'gui-modal',
  templateUrl: './gui-modal.component.html',
  styleUrls: ['./gui-modal.component.css']
})
export class GuiModalComponent {

  /**
   * @constructor
   * @param {GuiModalData} _data - données de la modale {title, text, success, yesno}
   */
  constructor(@Inject(MD_DIALOG_DATA) private _data: GuiModalData) { }

  /** @property {string} title - titre de la modale */
  get title(): string {
    return this._data.title;
  }
  
  /** @property {string} text - texte de la modale */
  get text(): string {
    return this._data.text;
  }

  /** @property {boolean} success - modale qui indique une réussite ou non */
  get success(): boolean {
    return this._data.success;
  }

  /** @property {boolean} yesno - true => boutons Oui et Non, false => bouton OK */
  get yesno(): boolean {
    return this._data.yesno || false;
  }

  /** @property {string} buttonColor - couleur du bouton OK */
  get buttonColor(): string {
    return this._data.success ? 'primary' : 'warn';
  }

}

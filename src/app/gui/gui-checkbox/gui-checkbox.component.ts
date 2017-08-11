/**
 * Auteur : Florian
 * License : 
 */

import { Component, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { MdCheckbox, MdCheckboxChange } from "@angular/material";

/**
 * Composant checkbox, extension de MdCheckbox de Angular Material
 * - Emet un event 'change' même lorsque l'état de la checkbox est changé par
 *   @Input() checked et non par l'utilisateur final
 */
@Component({
  selector: 'gui-checkbox',
  templateUrl: './gui-checkbox.component.html',
  styleUrls: ['./gui-checkbox.component.css']
})
export class GuiCheckboxComponent {
  
  /** MdChecbox utilisé dans le template */
  @ViewChild(MdCheckbox)
  private _mdCheckbox: MdCheckbox;
  
  /** @event - l'état de la checkbox a changé */
  private _change$: EventEmitter<MdCheckboxChange> = new EventEmitter<MdCheckboxChange>();

  /** Couleur de la checkbox */
  private _color: string = 'primary';

  /** @constructor */
  constructor() { }

  /** @event change - l'état de la checkbox a changé */
  @Output('change')
  get change$(): EventEmitter<MdCheckboxChange> {
    return this._change$;
  }

  /**
   * Emet un event 'change'
   * @param {MdCheckboxChange} event - informations sur le nouvel état de la checkbox
   * @emits change - event avec les informations sur le changement d'état
   */
  change(event: MdCheckboxChange): void {
    this._change$.emit(event);
  }

  /** @property {boolean} checked - indique si la checkbox est cochée ou non */
  @Input()
  set checked(checked: boolean) {
    if (checked != undefined) { // passer undefined en paramètre permet de conserver l'état actuel
      this._mdCheckbox.checked = checked;
      let event: MdCheckboxChange = new MdCheckboxChange();
      event.checked = checked;
      this.change(event); // émet un event 'change'
    }
  }

  /** @property {string} color - choix de la couleur parmi ['primary', 'accent', 'warn'] (voir Angular Material) */
  get color(): string {
    return this._color;
  }

  @Input()
  set color(color: string) {
    let lowColor: string = color.toLowerCase();
    if (lowColor === 'accent' || lowColor === 'warn') {
      this._color = lowColor; // couleur "spéciale"
      return;
    }
    this._color = 'primary';  // couleur par défaut
  }

}

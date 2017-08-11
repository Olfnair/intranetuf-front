/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output, Directive } from '@angular/core';
import { FormGroup } from "@angular/forms";

/**
 * Composant générique pour les formulaires
 */
@Component({
  selector: 'gui-form',
  templateUrl: './gui-form.component.html',
  styleUrls: ['./gui-form.component.css']
})
export class GuiFormComponent {
  
  /** titre du formulaire */
  private _title: string = undefined;
  
  /** Controles/inputs du formulaire */
  private _form: FormGroup = undefined;
  
  /** Indique s'il faut submit quand on appuie sur enter */
  private _submitOnEnter: boolean = false;
  
  /** true si on peut submit, sinon false */
  private _submitCondition: boolean = undefined;

  /** @event - submit du formulaire */
  private _submit$: EventEmitter<void> = new EventEmitter<void>();

  /** @constructor */
  constructor() { }

  /** @property {string} title - titre du formulaire */
  get title(): string {
    return this._title;
  }
  
  @Input()
  set title(title: string) {
    this._title = title;
  }

  /**
   * @property {FormGroup} formGroup
   * - contrôles du formulaire
   * - propriété set nommée formGroup au lieu de form pour contourner le fait qu'angular attend un
   *    input() formGroup et non form pour les formulaires
   */
  @Input() set formGroup(form: FormGroup) {
    this._form = form;
  }

  /** @property {FormGroup} form - controles/inputs du formulaire */
  get form(): FormGroup {
    return this._form;
  }

  /** @property {boolean} submitOnEnter - submit quand on appuie sur enter ? */
  get submitOnEnter(): boolean {
    return this._submitOnEnter;
  }

  @Input()
  set submitOnEnter(submitOnEnter: boolean) {
    this._submitOnEnter = submitOnEnter;
  }

  @Input()
  set submitCondition(submitCondition: boolean) {
    this._submitCondition = submitCondition;
  }

  /** @property {boolean} valid - indique si le formulaire est valide */
  get valid(): boolean {
    if(this._submitCondition != undefined) {
      return this._submitCondition;
    }
    return this._form.valid;
  }

  // !! ne pas nommer l'event 'submit', ca génère l'event en double parce que submit est un event qui !!
  // !! existe déjà sur les form !!
  /** 
   * @event formSubmit - soumission du formulaire
   * @returns {EventEmitter<void>}
   */
  @Output('formSubmit')
  get submit$(): EventEmitter<void> {
    return this._submit$;
  }

  /**
   * Soumission du formulaire quand on appuie sur Enter
   * @emits formSubmit - event de soumission du formulaire
   */
  submit(): void {
    if(this._submitOnEnter) { // Seulement si on peut submit en appuyant sur Enter
      this._submit$.emit();
    }
  }

}

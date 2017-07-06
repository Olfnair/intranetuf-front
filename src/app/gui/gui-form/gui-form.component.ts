import { Component, Input, EventEmitter, Output, Directive } from '@angular/core';
import { FormGroup } from "@angular/forms";

@Component({
  selector: 'gui-form',
  templateUrl: './gui-form.component.html',
  styleUrls: ['./gui-form.component.css']
})
export class GuiFormComponent {
  private _title: string = undefined;
  private _form: FormGroup = undefined;
  private _submitOnEnter: boolean = false;
  private _submitCondition: boolean = undefined;

  private _submit$: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  @Input() set title(title: string) {
    this._title = title;
  }

  get title(): string {
    return this._title;
  }

  @Input() set formGroup(form: FormGroup) {
    this._form = form;
  }

  get form(): FormGroup {
    return this._form;
  }

  @Input() set submitOnEnter(submitOnEnter: boolean) {
    this._submitOnEnter = submitOnEnter;
  }

  @Input() set submitCondition(submitCondition: boolean) {
    this._submitCondition = submitCondition;
  }

  get submitOnEnter(): boolean {
    return this._submitOnEnter;
  }

  get valid(): boolean {
    if(this._submitCondition != undefined) {
      return this._submitCondition;
    }
    return this._form.valid;
  }

  // !! ne pas nommer l'event 'submit', ca génère l'event en double parce que submit est un event qui existe déjà sur les form !!
  @Output('formSubmit') get submit$(): EventEmitter<void> {
    return this._submit$;
  }

  submit(): void {
    if(this._submitOnEnter) {
      this._submit$.emit();
    }
  }

}

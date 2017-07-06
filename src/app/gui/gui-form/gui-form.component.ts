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

  get submitOnEnter(): boolean {
    return this._submitOnEnter;
  }

  @Output('submit') get submit$(): EventEmitter<void> {
    return this._submit$;
  }

  submit(): void {
    if(this._submitOnEnter) {
      this._submit$.emit();
    }
  }

}

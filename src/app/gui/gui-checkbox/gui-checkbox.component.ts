import { Component, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { MdCheckbox, MdCheckboxChange } from "@angular/material";

@Component({
  selector: 'gui-checkbox',
  templateUrl: './gui-checkbox.component.html',
  styleUrls: ['./gui-checkbox.component.css']
})
export class GuiCheckboxComponent {
  @ViewChild(MdCheckbox) private _mdCheckbox: MdCheckbox;
  private _change$: EventEmitter<MdCheckboxChange> = new EventEmitter<MdCheckboxChange>();

  constructor() { }

  @Output('change') get change$(): EventEmitter<MdCheckboxChange> {
    return this._change$;
  }

  change(event: MdCheckboxChange): void {
    this._change$.emit(event);
  }

  @Input('checked') set checked(checked: boolean) {
    if (checked != undefined) {
      this._mdCheckbox.checked = checked;
      let event: MdCheckboxChange = new MdCheckboxChange();
      event.checked = checked;
      this.change(event);
    }
  }

}

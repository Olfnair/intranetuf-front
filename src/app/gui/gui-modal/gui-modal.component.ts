import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { GuiModalData } from "app/gui/gui-modal";

@Component({
  selector: 'gui-modal',
  templateUrl: './gui-modal.component.html',
  styleUrls: ['./gui-modal.component.css']
})
export class GuiModalComponent {

  constructor(@Inject(MD_DIALOG_DATA) private _data: GuiModalData) { }

  get title(): string {
    return this._data.title;
  }
  
  get text(): string {
    return this._data.text;
  }

  get success(): boolean {
    return this._data.success;
  }

  get yesno(): boolean {
    return this._data.yesno || false;
  }

  get buttonColor(): string {
    return this._data.success ? 'primary' : 'warn';
  }

}

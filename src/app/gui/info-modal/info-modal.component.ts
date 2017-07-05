import { Component, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { InfoModalData } from "app/gui/info-modal";

@Component({
  selector: 'info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent {

  constructor(@Inject(MD_DIALOG_DATA) private _data: InfoModalData) { }

  get title(): string {
    return this._data.title;
  }
  
  get text(): string {
    return this._data.text;
  }

  get success(): boolean {
    return this._data.success;
  }

  get buttonColor(): string {
    return this._data.success ? 'primary' : 'warn';
  }

}

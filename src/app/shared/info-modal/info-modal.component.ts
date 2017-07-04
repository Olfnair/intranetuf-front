import { Component, OnInit, Inject } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { Subscription } from "rxjs/Subscription";

export class inputData {
  public title: string = '';
  public text: string = '';
  public success: boolean = false;

  constructor() { }
}

@Component({
  selector: 'app-info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.css']
})
export class InfoModalComponent implements OnInit {

  constructor(@Inject(MD_DIALOG_DATA) private _data: inputData) { }
  
  ngOnInit() {
  }

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

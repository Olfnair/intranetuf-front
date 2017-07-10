import { Component, Input } from '@angular/core';

@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent {

  private _status: string = '';

  constructor() { }

  @Input() set status(status: string) {
    this._status = status;  
  }

  get status(): string {
    return this._status;
  }
}

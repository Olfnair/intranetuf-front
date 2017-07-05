import { Component, Input, Directive } from '@angular/core';

@Directive({
  selector: 'sl-sidenav'
})
export class SlSidenav { }

@Directive({
  selector: 'sl-content'
})
export class SlContent { }

@Component({
  selector: 'sidenav-layout',
  templateUrl: './sidenav-layout.component.html',
  styleUrls: ['./sidenav-layout.component.css']
})
export class SidenavLayoutComponent {

  private _openSidenavOnLarge: boolean = true;
  private _openSidenavOnSmall: boolean = false;

  constructor() { }

  @Input() set openSidenavOnLarge(value: boolean) {
    this._openSidenavOnLarge = value;
  }

  @Input() set openSidenavOnSmall(value: boolean) {
    this._openSidenavOnSmall = value;
  }

  get openSidenavOnLarge(): boolean {
    return this._openSidenavOnLarge;
  }

  get openSidenavOnSmall(): boolean {
    return this._openSidenavOnSmall;
  }

  get openSidenav() {
    return (this.openSidenavOnLarge || this.openSidenavOnSmall);
  }

}

import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-navbutton',
  templateUrl: './navbutton.component.html',
  styleUrls: ['./navbutton.component.css']
})
export class NavbuttonComponent {

  private _path: string;
  private _value: string;

  get value(): string {
    return this._value;
  }
  
  constructor(private _router: Router) { }

  /**
   * Sets private property _path
   *
   * @param path
   */
  @Input() set path(path: string) {
    this._path = path;
  }

  @Input() set value(value: string) {
    this._value = value;
  }

  navigate() {
    this._router.navigate([this._path]);
  }
}

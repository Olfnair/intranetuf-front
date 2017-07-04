import { Component } from '@angular/core';
import { NavList } from "./nav-list";

@Component({
  selector: 'nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent extends NavList {

  constructor() { super(); }

}

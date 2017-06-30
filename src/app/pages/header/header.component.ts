import { Component, OnInit } from '@angular/core';
import { SessionService } from "app/shared/session.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  get logged(): boolean {
    return this._session.logged;
  }

  get admin(): boolean {
    return true;
  }

  get userLogin(): string {
    return this._session.userLogin;
  }

  disconnect(): void {
    this._session.logout();
  }

}

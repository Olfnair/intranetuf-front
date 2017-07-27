import { Component } from '@angular/core';
import { Router, NavigationEnd } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { SessionService } from "app/services/session.service";
import { Project } from "entities/project";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _sidenavShowOnLarge: boolean = true;
  private _sidenavShowOnSmall: boolean = false;

  constructor(private _session: SessionService, private _router: Router) { }

  get showSidenav(): boolean {
    return this._sidenavShowOnLarge || this._sidenavShowOnSmall;
  }

  get sidenavShowOnLarge(): boolean {
    return this._sidenavShowOnLarge;
  }

  get sidenavShowOnSmall(): boolean {
    return this._sidenavShowOnSmall;
  }

  get logged(): boolean {
    return this._session.logged;
  }

  get selectedProject(): Project {
    return this._session.selectedProject;
  }

  get updateProjectList(): boolean {
    return this._session.updateProjectList;
  }

  toggleSidenavOnSmall(): void {
    this._sidenavShowOnSmall = ! this._sidenavShowOnSmall;
  }

  toggleSidenavOnLarge(): void {
    this._sidenavShowOnLarge = ! this._sidenavShowOnLarge;
  }

  showProjectList(): boolean {
    return this._router.url == '/home' && this.logged;
  }

  loaded(): void {
    this._session.readyForContent = true;
  }
}

import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from "app/shared/session.service";
import { Project } from "app/entities/project";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _sidenavShowOnLarge: boolean = true;
  private _sidenavShowOnSmall: boolean = false;

  constructor(private _router: Router, private _session: SessionService) { }

  get showSidenav(): boolean {
    return this._sidenavShowOnLarge || this._sidenavShowOnSmall;
  }

  get sidenavShowOnLarge(): boolean {
    return this._sidenavShowOnLarge;
  }

  get sidenavShowOnSmall(): boolean {
    return this._sidenavShowOnSmall;
  }

  get route(): string {
    return this._router.url;
  }

  get logged(): boolean {
    return this._session.logged;
  }

  selectProject(project: Project): void {
    this._session.selectedProject = project;
  }
}

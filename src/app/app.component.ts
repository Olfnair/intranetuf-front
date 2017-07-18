import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { SessionService } from "app/services/session.service";
import { Project } from "entities/project";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private _sidenavShowOnLarge: boolean = true;
  private _sidenavShowOnSmall: boolean = false;

  private _routerEventsSub: Subscription = undefined;

  constructor(private _router: Router, private _session: SessionService) { }

  ngOnInit() {
    this._routerEventsSub = this._router.events.subscribe((event) => {
      if(this.showProjectList()) {
        this._session.readyForContent = false;
      }
    });
  }

  ngOnDestroy() {
    if(this._routerEventsSub) {
      this._routerEventsSub.unsubscribe();
    }
  }

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
    return this.route == '/home' && this.logged;
  }

  loaded(): void {
    this._session.readyForContent = true;
  }
}

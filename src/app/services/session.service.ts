import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Response } from "@angular/http";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { Observable, Subscription } from "rxjs";
import 'rxjs/add/operator/map';
import { RestApiService } from "app/services/rest-api.service";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { Project } from "entities/project";
import { ProjectRight } from "entities/project-right";
import { User, Roles } from "entities/user";

@Injectable()
export class SessionService implements OnDestroy {

  // apps
  private _readyForContent: boolean = true;
  private _selectedProject: Project = undefined;
  private _selectedAdminTab: number = 0;

  private _updateProjectList = false;

  private _routerEventsSub: Subscription = undefined;

  // utilisateur
  private _userLogin: string = undefined;
  private _authToken: AuthToken = undefined;
  private _base64AuthToken: string = undefined;
  private _logged: boolean = false;

  private _userRole: number = undefined;
  private _userRights: number = undefined;
  private _roleLoading: boolean = false;
  private _rightsLoading: boolean = false;

  constructor(
    private _router: Router,
    private _restService: RestApiService
  ) {
    this._routerEventsSub = this._router.events.subscribe((event) => {
      this.loadRole();
    });
  }

  private loadRole(): void {
    if(this._logged) {
      this._userRole = undefined;
      this._roleLoading = true;
      // TODO : subscribe pour récupérer le role
      // pour l'instant on le récupère du token :
      this._userRole = this._authToken.r;
      this._roleLoading = false;
    }
  }

  private loadRights(): void {
    if(this.route == '/home' && this._logged && this._selectedProject != undefined) { // seul endroit où l'user peut voir les projets
      this._userRights = undefined;
      this._rightsLoading = true;
      let sub: Subscription = this.getRightsForProject(this._selectedProject).finally(() => {
        this._rightsLoading = false;
        sub.unsubscribe();
      }).subscribe(
        (projectRights: ProjectRight[]) => {
          if(projectRights.length > 0) {
            this._userRights = projectRights[0].rights;
          }
        },
        (error: Response) => {
          // gérer erreur ?
        }
      );
    }
  }

  ngOnDestroy() {
    if(this._routerEventsSub) {
      this._routerEventsSub.unsubscribe();
    }
  }

  get route(): string {
    return this._router.url;
  }

  get readyForContent(): boolean {
    return this._readyForContent;
  }

  set readyForContent(value: boolean) {
    this._readyForContent = value;
  }

  get selectedProject(): Project {
    return this._selectedProject;
  }

  set selectedProject(project : Project) {
    if(project == this._selectedProject) {
      return;
    }
    this._selectedProject = project;
    this.loadRights();
  }

  get updateProjectList(): boolean {
    return this._updateProjectList;
  }

  set updateProjectList(update: boolean) {
    setTimeout(() => {
      this._updateProjectList = update;
    }, 0);
  }

  get selectedAdminTab(): number {
    return this._selectedAdminTab;
  }

  set selectedAdminTab(tab : number) {
    this._selectedAdminTab = tab;
  }

  get userId(): number {
    return this._authToken ? this._authToken.u : undefined;
  }

  get userRole(): number {
    return this._userRole;
  }

  set userRole(role: number) {
    this._userRole = role;
  }

  get userIsAdmin(): boolean {
    return User.hasRole(this._userRole, Roles.ADMIN) || User.hasRole(this._userRole, Roles.SUPERADMIN);
  }

  get userIsSuperAdmin(): boolean {
    return User.hasRole(this._userRole, Roles.SUPERADMIN);
  }

  get userRights(): number {
    return this._userRights;
  }

  set userRights(rights: number) {
    this._userRights = rights;
  }

  get roleLoading(): boolean {
    return this._roleLoading;
  }

  get rightsLoading(): boolean {
    return this._rightsLoading;
  }

  get userLogin(): string {
    return this._userLogin;
  } 

  get authToken(): AuthToken {
    return this._authToken;
  }

  get base64AuthToken(): string {
    return this._base64AuthToken;
  }

  set authToken(authToken: AuthToken) {
    this._authToken = authToken;
    this._restService.authToken = authToken;
    this._base64AuthToken = btoa(JSON.stringify(this._authToken));
  }

  get logged(): boolean {
    return this._logged;
  }

  private _login(login: string, res: Response): Response {
    this.logout();
    this._userLogin = login;
    this.authToken = res.json();
    this._userRole = this._authToken.r;
    this._logged = true;
    return res;
  }

  /**
   * Function to auth user
   *
   * @returns {Observable<boolean>}
   */
  login(login: string, pwd: string): Observable<Response> {
    return this._restService.login(new Credentials(login, pwd)).map((res: Response) => {
      return this._login(login, res);
    });
  }

  adminLoginAs(login: string): Observable<Response> {
    return this._restService.adminLoginAs(login).map((res: Response) => {
      return this._login(login, res);
    });
  }

  logout(): void {
    this._userLogin = undefined;
    this._authToken = undefined;
    this._base64AuthToken = undefined;
    this._restService.authToken = undefined;
    this._userRole = undefined;
    this._logged = false;
    this._selectedProject = undefined;
  }

  getRightsForProject(project: Project) : Observable<ProjectRight[]> {
    return this._restService.getRightsForProject(project).map((res: Response) => {
      return res.json().projectRight;
    });
  }

}

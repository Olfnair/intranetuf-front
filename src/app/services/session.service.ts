import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Router } from "@angular/router";
import { environment } from "environments/environment";
import { Observable, Subscription } from "rxjs";
import 'rxjs/add/operator/map';
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

  private _routerEventsSub: Subscription = undefined;

  // utilisateur
  private _userLogin: string = undefined;
  private _authToken: AuthToken = undefined;
  private _logged: boolean = false;

  private _userRole: number = undefined;
  private _userRights: number = undefined;
  private _roleLoading: boolean = false;
  private _rightsLoading: boolean = false;

  // backend urls
  private _authUrl: string = environment.backend.protocol + "://"
                           + environment.backend.host + ":"
                           + environment.backend.port
                           + environment.backend.endpoints.auth;

  private _rightsUrl: string = environment.backend.protocol + "://"
                           + environment.backend.host + ":"
                           + environment.backend.port
                           + environment.backend.endpoints.projectRight;

  constructor(
    private _http: Http,
    private _router: Router,
  ) {
    this._routerEventsSub = this._router.events.subscribe((event) => {
      this.loadRole();
      this.loadRights();
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
        (projectRights: ProjectRight) => {
          this._userRights = projectRights.rights;
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
    this._selectedProject = project;
    this.loadRights();
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

  set authToken(authToken: AuthToken) {
    this._authToken = authToken;
  }

  get logged(): boolean {
    return this._logged;
  }

  private _login(login: string, res: Response): boolean {
    if(res.status !== 200) {
        return false;
    }
    this.logout();
    this._userLogin = login;
    this._authToken = res.json();
    this._userRole = this._authToken.r;
    this._logged = true;
    return true;
  }

  /**
   * Function to auth user
   *
   * @returns {Observable<boolean>}
   */
  login(login: string, pwd: string): Observable<boolean> {
    return this._http.post(this._authUrl, {credentials: new Credentials(login, pwd)}).map((res: Response) => {
      return this._login(login, res);
    });
  }

  adminLoginAs(login: string): Observable<boolean> {
    return this._http.get(this._authUrl + '/adminLoginAs/' + login, this.options('text/plain')).map((res: Response) => {
      return this._login(login, res);
    });
  }

  logout(): void {
    this._userLogin = undefined;
    this._authToken = undefined;
    this._userRole = undefined;
    this._logged = false;
    this._selectedProject = undefined;
  }

  getRightsForProject(project: Project) : Observable<ProjectRight> {
    return this._http.get(this._rightsUrl + '/' + project.id, this.options()).map((res: Response) => {
      return res.json().projectRight;
    });
  }

  /**
     * Function to return request options
     *
     * @returns {RequestOptions}
     */
  public options(accept: string = 'application/json', headerList: Object = {}): RequestOptions {
    const headers: Headers = new Headers(Object.assign({ 'Accept': accept, 'Authorization': 'Bearer ' + JSON.stringify(this._authToken) }, headerList));
    return new RequestOptions({ headers: headers });
  }

}

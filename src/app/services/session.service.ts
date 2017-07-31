import { Injectable, Inject } from '@angular/core';
import { Response } from "@angular/http";
import { Router, NavigationEnd } from "@angular/router";
import { environment } from "environments/environment";
import { Observable, Subscription, Observer } from "rxjs";
import 'rxjs/add/operator/map';
import { RestApiService } from "app/services/rest-api.service";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { Project } from "entities/project";
import { ProjectRight } from "entities/project-right";
import { User, Roles } from "entities/user";
import { RoleCheckerService } from "app/services/role-checker";

@Injectable()
export class SessionService {

  // apps
  private _readyForContent: boolean = true;
  private _selectedProject: Project = undefined;
  private _selectedAdminTab: number = 0;

  private _updateProjectList = false;

  // indique si l'admin veut la liste des projets actifs ou inactifs (supprimés)
  private _fetchActiveProjects = true;

  private _currentRoute: string = undefined;

  // utilisateur
  private _userLogin: string = undefined;
  private _authToken: AuthToken = undefined;
  private _base64AuthToken: string = undefined;
  private _logged: boolean = false;

  constructor(
    private _restService: RestApiService,
    private _roleCheckerService: RoleCheckerService
  ) { }

  get readyForContent(): boolean {
    return this._readyForContent;
  }

  set readyForContent(value: boolean) {
    this._readyForContent = value;
  }

  get selectedProject(): Project {
    return this._selectedProject;
  }

  set selectedProject(project: Project) {
    if (project == this._selectedProject) {
      return;
    }
    this._selectedProject = project;
  }

  get updateProjectList(): boolean {
    return this._updateProjectList;
  }

  set updateProjectList(update: boolean) {
    setTimeout(() => {
      this._updateProjectList = update;
    }, 0);
  }

  get fetchActiveProjects(): boolean {
    return this._fetchActiveProjects;
  }

  set fetchActiveProjects(fetchActiveProjects: boolean) {
    this._fetchActiveProjects = fetchActiveProjects;
  }

  get selectedAdminTab(): number {
    return this._selectedAdminTab;
  }

  set selectedAdminTab(tab: number) {
    this._selectedAdminTab = tab;
  }

  get userId(): number {
    return this._authToken ? this._authToken.u : undefined;
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
    this._logged = true;
    this._roleCheckerService.directLoad(this.authToken.r);
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
    this._logged = false;
    this._roleCheckerService.reset();
    this._selectedProject = undefined;
    this._fetchActiveProjects = true;
  }

}

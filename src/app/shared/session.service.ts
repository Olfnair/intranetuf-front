import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Credentials } from "app/entities/credentials";
import 'rxjs/add/operator/map';
import { Project } from "app/entities/project";
import { AuthToken } from "app/entities/auth-token";

@Injectable()
export class SessionService {

  private _userLogin: string = undefined;
  private _authToken: AuthToken = undefined;
  private _logged: boolean = false;
  private _authUrl: string = environment.backend.protocol + "://"
                           + environment.backend.host + ":"
                           + environment.backend.port
                           + environment.backend.endpoints.auth;

  // mémorise le projet selectionné pour toute la session
  private _selectedProject: Project = undefined;
  private _selectedAdminTab: number = 0;

  constructor(private _http: Http) {
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

  get userId(): number {
    return this._authToken ? this._authToken.u : undefined;
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

  get selectedProject(): Project {
    return this._selectedProject;
  }

  set selectedProject(project : Project) {
    this._selectedProject = project;
  }

  get selectedAdminTab(): number {
    return this._selectedAdminTab;
  }

  set selectedAdminTab(tab : number) {
    this._selectedAdminTab = tab;
  }

  private _login(login: string, res: Response): boolean {
    if(res.status !== 200) {
        return false;
    }
    this.logout();
    this._userLogin = login;
    this._authToken = res.json();
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
    this._logged = false;
    this._selectedProject = undefined;
  }

}

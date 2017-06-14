import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Credentials } from "app/entities/credentials";
import 'rxjs/add/operator/map';
import { Project } from "app/entities/project";

@Injectable()
export class SessionService {

  private _authToken: string = '';
  private _logged: boolean = false;
  private _authUrl: string = environment.backend.protocol + "://"
                           + environment.backend.host + ":"
                           + environment.backend.port
                           + environment.backend.endpoints.auth;

  // mémorise le projet selectionné pour toute la session
  private _selectedProject: Project = undefined;

  constructor(private _http: Http) {
  }

  get authToken(): string {
    return this._authToken;
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

  /**
   * Function to auth user
   *
   * @returns {Observable<boolean>}
   */
  login(login: string, pwd: string): Observable<boolean> {
    this.logout();
    return this._http.post(this._authUrl, {credentials: new Credentials(login, pwd)}).map((res: Response) => {
      if(res.status !== 200) {
        return false;
      }
      this._authToken = res.text();
      this._logged = true;
      return true;
    });
  }

  logout(): void {
    this._authToken = '';
    this._logged = false;
    this._selectedProject = undefined;
  }

}

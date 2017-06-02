import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Credentials } from "app/entities/credentials";
import 'rxjs/add/operator/map';

@Injectable()
export class SessionService {

  private _authToken: string;
  private _logged: boolean;
  private _authUrl: string;

  constructor(private _http: Http) {
    this._authToken = '';
    this._logged = false;
    this._authUrl =  environment.backend.protocol + "://"
                  + environment.backend.host + ":"
                  + environment.backend.port
                  + environment.backend.endpoints.auth;
  }

  get authToken() {
    return this._authToken;
  }

  get logged() {
    return this._logged;
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
      return true;
    });
  }

  logout(): void {
    this._authToken = '';
    this._logged = false;
  }

}

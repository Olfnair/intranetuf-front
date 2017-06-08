import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { SessionService } from "app/shared/session.service";
import { Credentials } from "app/entities/credentials";
import 'rxjs/add/operator/map';

@Injectable()
export class RestApiService {

  private _backendURL: any;

  constructor(private _http: Http, private session: SessionService) {   
    this._backendURL = {};

    // build backend base url
    let baseUrl = `${environment.backend.protocol}://${environment.backend.host}`;
    if (environment.backend.port) {
      baseUrl += `:${environment.backend.port}`;
    }

    // build all backend urls
    Object.keys(environment.backend.endpoints).forEach(k => this._backendURL[k] = `${baseUrl}${environment.backend.endpoints[k]}`);
  }

  get backendURL() {
    return this._backendURL;
  }

  /**
   * Function to return list of projects
   *
   * @returns {Observable<R>}
   */
  fetchProjects(): Observable<any[]> {
    return this._http.get(this._backendURL.allProjects, this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().project;
      }
      else {
        return [];
      }
    });
  }

  fetchFilesByProject(id: number): Observable<any[]> {
    return this._http.get(this._backendURL.filesByProject + id.toString(), this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().file;
      }
      else {
        return [];
      }
    });
  }

  /**
   * Function to return list of users
   *
   * @returns {Observable<R>}
   */
  fetchUsers(): Observable<any[]> {
    return this._http.get(this._backendURL.allUsers , this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().user;
      }
      else {
        return [];
      }
    });
  }

  /**
     * Function to return request options
     *
     * @returns {RequestOptions}
     */
  private _options(headerList: Object = {}): RequestOptions {
    const headers = new Headers(Object.assign({ 'Accept': 'application/json', 'Authorization': 'Bearer ' + this.session.authToken }, headerList));
    return new RequestOptions({ headers: headers });
  }

}

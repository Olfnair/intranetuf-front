import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { SessionService } from "app/shared/session.service";
import { Credentials } from "app/entities/credentials";
import 'rxjs/add/operator/map';
import { Project } from "app/entities/project";
import { User } from "app/entities/user";
import { File } from "app/entities/file";

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
  fetchProjects(): Observable<Project[]> {
    return this._http.get(this._backendURL.allProjects, this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().project;
      }
      else {
        return [];
      }
    });
  }

  fetchFilesByProject(project: Project): Observable<File[]> {
    return this._http.get(this._backendURL.filesByProject + project.id.toString(), this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().file;
      }
      else {
        return [];
      }
    });
  }

  createFile(file: File) {
    return this._http.post(this._backendURL.allFiles, {file: file}, this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().file;
      }
      else {
        return [];
      }
    });
  }

  /**
   * Function to create project
   *
   * @returns {Observable<boolean>}
   */
  createProject(name: string): Observable<Project> {
    let project = new Project();
    project.name = name;
    return this._http.post(this._backendURL.allProjects, {project: project}, this._options()).map((res: Response) => {
      return res.json().project;
    });
  }

  /**
   * Function to return list of users
   *
   * @returns {Observable<R>}
   */
  fetchUsers(): Observable<User[]> {
    return this._http.get(this._backendURL.allUsers, this._options()).map((res: Response) => {
      if (res.status === 200) {
        return res.json().user;
      }
      else {
        return [];
      }
    });
  }

  addUser(user: User): Observable<User> {
    return this._http.post(this._backendURL.allUsers, {user: user}, this._options()).map((res: Response) => {
      return res.json().user;
    });
  }

  /**
     * Function to return request options
     *
     * @returns {RequestOptions}
     */
  private _options(accept: string = 'application/json', headerList: Object = {}): RequestOptions {
    const headers = new Headers(Object.assign({ 'Accept': accept, 'Authorization': 'Bearer ' + this.session.authToken }, headerList));
    return new RequestOptions({ headers: headers });
  }

}

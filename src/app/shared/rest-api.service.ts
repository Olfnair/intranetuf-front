import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from "@angular/http";
import { environment } from "environments/environment";
import { SessionService } from "app/shared/session.service";
import { Credentials } from "app/entities/credentials";
import { Project } from "app/entities/project";
import { User } from "app/entities/user";
import { File } from "app/entities/file";
import { AuthToken } from "app/entities/auth-token";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import { ProjectRight } from "app/entities/project-right";

@Injectable()
export class RestApiService {

  private _backendURL: any;

  constructor(private _http: Http, private _session: SessionService) {   
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

  // le token de session doit être réglé pour récupérer le bon user (compte)
  getUserToActivate(): Observable<User> {
    return this._http.get(this._backendURL.activateUser, this._options()).map((res: Response) => {
      return res.json().user;
    });
  }

  activateUser(userId: number, credentials: Credentials): Observable<number> {
    return this._http.put(this._backendURL.activateUser + '/' + userId, {credentials: credentials}, this._options()).map((res: Response) => {
      return res.status;
    });
  }

  getRights(user: User): Observable<ProjectRight[]> {
    return this._http.get(this._backendURL.rights + '/user/' + user.id, this._options()).map((res: Response) => {
      return res.json().projectRight;
    });
  }

  setRights(rights: ProjectRight[]): Observable<number> {
    return this._http.post(this._backendURL.rights, {projectRight: rights}, this._options()).map((res: Response) => {
      return res.status;
    });
  }

  /**
     * Function to return request options
     *
     * @returns {RequestOptions}
     */
  private _options(accept: string = 'application/json', headerList: Object = {}): RequestOptions {
    const headers = new Headers(Object.assign({ 'Accept': accept, 'Authorization': 'Bearer ' + JSON.stringify(this._session.authToken) }, headerList));
    return new RequestOptions({ headers: headers });
  }

}

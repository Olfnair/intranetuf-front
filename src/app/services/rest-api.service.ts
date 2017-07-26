import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import { Base64 } from "app/shared/base64";
import { FlexQueryResult } from "objects/flex-query-result";
import { RestLong } from "objects/rest-long";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { File } from "entities/file";
import { Project } from "entities/project";
import { ProjectRight, Right } from "entities/project-right";
import { Status, WorkflowCheck } from "entities/workflow-check";
import { User } from "entities/user";

@Injectable()
export class RestApiService {

  private _backendURL: any;

  private _authToken: AuthToken = undefined;

  constructor(private _http: Http) {   
    this._backendURL = {};

    // build backend base url
    let baseUrl = `${environment.backend.protocol}://${environment.backend.host}`;
    if (environment.backend.port) {
      baseUrl += `:${environment.backend.port}`;
    }

    // build all backend urls
    Object.keys(environment.backend.endpoints).forEach(k => this._backendURL[k] = `${baseUrl}${environment.backend.endpoints[k]}`);
  }

  private static encodeQueryParams(searchParams: string, orderParams: string, index: number, limit: number): string {
    return Base64.urlEncode(searchParams) + '/' + Base64.urlEncode(orderParams) + '/' + index + '/' + limit;
  }

  get backendURL() {
    return this._backendURL;
  }

  set authToken(authToken: AuthToken) {
    this._authToken = authToken;
  }

  /**
   * Function to return list of projects
   *
   * @returns {Observable<R>}
   */
  fetchProjects(searchParams: string): Observable<Project[]> {
    return this._http.get(
      this._backendURL.project + '/' + Base64.urlEncode(searchParams),
      this.options()
    ).map((res: Response) => {
      return res.json().project;
    });
  }

  fetchFilesByProject(project: Project, searchParams: string, orderParams: string, index: number, limit: number): Observable<FlexQueryResult> {
    return this._http.get(
      this._backendURL.file + '/project/' + project.id.toString() + '/'
      + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  createFile(file: File): Observable<File> {
    return this._http.post(this._backendURL.file, {file: file}, this.options()).map((res: Response) => {
      return res.json().file;
    });
  }

  // supression logique
  deleteFile(file: File): Observable<number> {
    return this._http.delete(this._backendURL.file + '/' + file.id, this.options()).map((res: Response) => {
      return res.status;
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
    return this._http.post(this._backendURL.project, {project: project}, this.options()).map((res: Response) => {
      return res.json().project;
    });
  }

  editProject(project: Project): Observable<Response> {
    return this._http.put(this._backendURL.project + '/' + project.id, {project: project}, this.options());
  }

  deleteProject(project: Project): Observable<Response> {
    return this._http.delete(this._backendURL.project + '/' + project.id, this.options());
  }

  /**
   * Function to return list of users
   *
   * @returns {Observable<R>}
   */
  fetchUsers(searchParams: string, orderParams: string, index: number, limit: number): Observable<FlexQueryResult> {
    return this._http.get(
      this._backendURL.user + '/' + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  addUser(user: User): Observable<User> {
    return this._http.post(this._backendURL.user, {user: user}, this.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  // le token de session doit être réglé pour récupérer le bon user (compte)
  getUserToActivate(): Observable<User> {
    return this._http.get(this._backendURL.activate, this.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  activateUser(userId: number, credentials: Credentials): Observable<number> {
    return this._http.put(this._backendURL.activate + '/' + userId, {credentials: credentials}, this.options()).map((res: Response) => {
      return res.status;
    });
  }

  getRights(user: User): Observable<ProjectRight[]> {
    return this._http.get(this._backendURL.projectRight + '/user/' + user.id, this.options()).map((res: Response) => {
      return res.json().projectRight;
    });
  }

  setRights(rights: ProjectRight[]): Observable<number> {
    return this._http.post(this._backendURL.projectRight, {projectRight: rights}, this.options()).map((res: Response) => {
      return res.status;
    });
  }

  fetchUsersByRightOnProject(project: Project, right: Right): Observable<User[]> {
    return this._http.get(this._backendURL.user + '/rightOnProject/' + project.id + '/' + right, this.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  fetchWorkflowCheckByStatusUserVersions(status: Status, userId: number, files: File[]): Observable<WorkflowCheck[]> {
    let versionIds: RestLong[] = [];
    files.forEach((file: File) => {
      versionIds.push(new RestLong(file.version.id));
    });
    return this._http.post(this._backendURL.workflowCheck + '/' + userId + '/' + status, {restLong: versionIds}, this.options()).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  updateWorkflowCheck(check: WorkflowCheck): Observable<number> {
    return this._http.put(this._backendURL.workflowCheck + '/' + check.id, {workflowCheck: check}, this.options()).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Function to auth user
   *
   * @returns {Observable<boolean>}
   */
  login(credentials: Credentials): Observable<Response> {
    return this._http.post(this._backendURL.auth, {credentials: credentials});
  }

  adminLoginAs(login: string): Observable<Response> {
    return this._http.get(this._backendURL.auth + '/adminLoginAs/' + login, this.options('text/plain'));
  }

  getRightsForProject(project: Project) : Observable<Response> {
    return this._http.get(this._backendURL.projectRight + '/' + project.id, this.options());
  }

  getWorkflowChecksForVersion(versionId: number): Observable<WorkflowCheck[]> {
    return this._http.get(this._backendURL.workflowCheck + '/forVersion/' + versionId, this.options()).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  getWorkflowChecksForFile(fileId: number): Observable<WorkflowCheck[]> {
    return this._http.get(this._backendURL.workflowCheck + '/forLastVersion/' + fileId, this.options()).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  /**
     * Function to return request options
     *
     * @returns {RequestOptions}
     */
  private options(accept: string = 'application/json', headerList: Object = {}): RequestOptions {
    const headers: Headers = new Headers(Object.assign({ 'Accept': accept, 'Authorization': 'Bearer ' + JSON.stringify(this._authToken) }, headerList));
    return new RequestOptions({ headers: headers });
  }

}

import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from "environments/environment";
import { SessionService } from "./session.service";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import { RestLong } from "objects/rest-long";
import { Credentials } from "entities/credentials";
import { File } from "entities/file";
import { Project } from "entities/project";
import { ProjectRight, Right } from "entities/project-right";
import { Status, WorkflowCheck } from "entities/workflow-check";
import { User } from "entities/user";

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
    return this._http.get(this._backendURL.project, this._session.options()).map((res: Response) => {
      return res.json().project;
    });
  }

  fetchFilesByProject(project: Project): Observable<File[]> {
    return this._http.get(this._backendURL.file + '/project/' + project.id.toString(), this._session.options()).map((res: Response) => {
      return res.json().file;
    });
  }

  createFile(file: File) {
    return this._http.post(this._backendURL.file, {file: file}, this._session.options()).map((res: Response) => {
      return res.json().file;
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
    return this._http.post(this._backendURL.project, {project: project}, this._session.options()).map((res: Response) => {
      return res.json().project;
    });
  }

  /**
   * Function to return list of users
   *
   * @returns {Observable<R>}
   */
  fetchUsers(): Observable<User[]> {
    return this._http.get(this._backendURL.user, this._session.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  addUser(user: User): Observable<User> {
    return this._http.post(this._backendURL.user, {user: user}, this._session.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  // le token de session doit être réglé pour récupérer le bon user (compte)
  getUserToActivate(): Observable<User> {
    return this._http.get(this._backendURL.activate, this._session.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  activateUser(userId: number, credentials: Credentials): Observable<number> {
    return this._http.put(this._backendURL.activate + '/' + userId, {credentials: credentials}, this._session.options()).map((res: Response) => {
      return res.status;
    });
  }

  getRights(user: User): Observable<ProjectRight[]> {
    return this._http.get(this._backendURL.projectRight + '/user/' + user.id, this._session.options()).map((res: Response) => {
      return res.json().projectRight;
    });
  }

  setRights(rights: ProjectRight[]): Observable<number> {
    return this._http.post(this._backendURL.projectRight, {projectRight: rights}, this._session.options()).map((res: Response) => {
      return res.status;
    });
  }

  fetchUsersByRightOnProject(project: Project, right: Right): Observable<User[]> {
    return this._http.get(this._backendURL.user + '/rightOnProject/' + project.id + '/' + right, this._session.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  fetchWorkflowCheckByStatusUserVersions(status: Status, userId: number, files: File[]): Observable<WorkflowCheck[]> {
    let versionIds: RestLong[] = [];
    files.forEach((file: File) => {
      versionIds.push(new RestLong(file.version.id));
    });
    return this._http.post(this._backendURL.workflowCheck + '/' + userId + '/' + status, {restLong: versionIds}, this._session.options()).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  updateWorkflowCheck(check: WorkflowCheck): Observable<number> {
    return this._http.put(this._backendURL.workflowCheck + '/' + check.id, {workflowCheck: check}, this._session.options()).map((res: Response) => {
      return res.status;
    });
  }

}

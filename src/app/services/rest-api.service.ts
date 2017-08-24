/**
 * Auteur : Florian
 * License : 
 */

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
import { Entity } from "entities/entity";
import { File } from "entities/file";
import { Project } from "entities/project";
import { ProjectRight, Right } from "entities/project-right";
import { Status, WorkflowCheck } from "entities/workflow-check";
import { User } from "entities/user";

/**
 * Service REST : classe reprenant la plupart des appels au backend.
 */
@Injectable()
export class RestApiService {

  /** URL's du backend */
  private _backendURL: any;

  /** Token de l'user courant */
  private _authToken: AuthToken = undefined;

  /**
   * @constructor
   * @param {Http} _http - Service HTTP qui va servir en envoyer les requêtes au service REST.
   */
  constructor(private _http: Http) {   
    this._backendURL = {};

    // build backend base url
    let baseUrl = `${environment.backend.protocol}://${environment.backend.host}`;
    if (environment.backend.port) {
      baseUrl += `:${environment.backend.port}`;
    }

    // build all backend urls
    Object.keys(environment.backend.endpoints).forEach(k => {
      this._backendURL[k] = `${baseUrl}${environment.backend.endpoints[k]}`
    });
  }

  /**
   * Encode des paramètres de requête (tri/recherche/pagination) en URL base 64
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   */
  private static encodeQueryParams(searchParams: string, orderParams: string, index: number, limit: number): string {
    return Base64.urlEncode(searchParams) + '/' + Base64.urlEncode(orderParams) + '/' + index + '/' + limit;
  }

  /** @property {any} - objet contenant les URL's du backend */
  get backendURL(): any {
    return this._backendURL;
  }

  /** @property {AuthToken} authToken - token d'authentification de l'user courant */
  set authToken(authToken: AuthToken) {
    this._authToken = authToken;
  }

  /**
   * Récupère la liste des projets en fonction des paramètres
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchProjects(
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<Project>> {
    return this._http.get(
      this._backendURL.project + '/query/'
        + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Récupère la liste des fichiers pour un projet en fonction des paramètres
   * @param {Project} project - le projet duquel on veut charger les fichiers
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchFilesByProject(
    project: Project,
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<File>> {
    return this._http.get(
      this._backendURL.file + '/project/' + project.id.toString() + '/query/'
      + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Crée l'entité d'un fichier
   * @param {File} file - le fichier à créer
   * @returns {Observable<File>} - le fichier créé 
   */
  createFile(file: File): Observable<File> {
    return this._http.post(this._backendURL.file, {file: file}, this.options()).map((res: Response) => {
      return res.json().file;
    });
  }

  /**
   * Suppression logique du fichier (file)
   * @param {File} file - le fichier à supprimer
   * @returns {Observable<number>} - statut de la réponse http qui indique la réussite ou non de la suppression
   */
  deleteFile(file: File): Observable<number> {
    return this._http.delete(this._backendURL.file + '/' + file.id, this.options()).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Indique si l'utilisateur est auteur du fichier dont l'id est fileId ou non
   * @param {number} fileId - id du fichier dont on veut savoir si l'utilisateur actuel est l'auteur
   * @returns {Observable<RestLong>} - contient 1 si l'utilisateur courant est l'auteur, 0 sinon
   */
  userIsFileAuthor(fileId: number): Observable<RestLong> {
    return this._http.get(
      this._backendURL.file + '/' + fileId + '/isauthor/' + this._authToken.u,
      this.options()
    ).map((res: Response) => {
      return res.json().restLong;
    });
  }

  /**
   * Crée un projet
   * @param {string} name - nom du projet à créer
   * @returns {Observable<Project>} - Obervable sur le projet créé
   */
  createProject(name: string): Observable<Project> {
    let project = new Project();
    project.name = name;
    return this._http.post(this._backendURL.project, {project: project}, this.options()).map((res: Response) => {
      return res.json().project;
    });
  }

  /**
   * Edite un projet
   * @param {Project} project - le projet à éditer
   * @returns {Observable<Response>} - Observable sur la réponse http
   */
  editProject(project: Project): Observable<Response> {
    return this._http.put(this._backendURL.project + '/' + project.id, {project: project}, this.options());
  }

  /**
   * Supprime un projet
   * @param {Project} project - le projet à supprimer
   * @returns {Observable<Response>} - Observable sur la réponse http
   */
  deleteProject(project: Project): Observable<Response> {
    return this._http.delete(this._backendURL.project + '/' + project.id, this.options());
  }

  /**
   * Supprime (logiquement) ou restaure plusieurs projets en une seule requête
   * @param {Project[]} projects - Liste des projets à affecter
   * @param {boolean} activate - true => restaurer, false => supprimer
   * @returns {Observable<Response>} - réponse http 
   */
  activateManyProjects(projects: Project[], activate: boolean): Observable<Response> {
    return this._http.put(
      this._backendURL.project + '/activateMany/' + (activate ? '1' : '0'),
      {restLong: RestApiService.listIds(projects)},
      this.options()
    );
  }

  /**
   * Liste les utilisateurs en fonction des paramètres
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchUsers(
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<User>> {
    return this._http.get(
      this._backendURL.user + '/' + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Liste les utilisateurs en fonction des paramètres, sauf ceux dont les id's sont précisés
   * @param {number[]} ids - liste des id's des utlisateurs qu'on ne veut pas lister
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchUsersExcludeIds(
    ids: number[],
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<User>> {
    let excludedUserIds: RestLong[] = [];
    ids.forEach((id: number) => {
      excludedUserIds.push(new RestLong(id));
    });
    return this._http.post(
      this._backendURL.user + '/' + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      {restLong: excludedUserIds},
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Crée un utilisateur
   * @param {User} user - utilisateur à créer
   * @returns {Observable<User>} - Observable sur l'utilisateur créé par le backend 
   */
  createUser(user: User): Observable<User> {
    return this._http.post(this._backendURL.user, {user: user}, this.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  /**
   * Edite un utilisateur
   * @param {User} user - l'utilisateur modifié
   * @returns {Observable<Response>} - la réponse du serveur
   */
  editUser(user: User): Observable<Response> {
    return this._http.put(this._backendURL.user + '/' + user.id, {user: user}, this.options());
  }

  editUsers(users: User[]): Observable<number> {
    return this._http.put(this._backendURL.user, {user: users}, this.options()).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Supprime un utilisateur
   * @param {User} user - l'utilisateur à supprimer
   * @returns {Observable<Response>} - la réponse du serveur
   */
  deleteUser(user: User): Observable<Response> {
    return this._http.delete(this._backendURL.user + '/' + user.id, this.options());
  }

  /**
   * Active/désactive plusieurs utilisateurs en une seule requête
   * @param {User[]} users - Liste des utilisateurs à affecter
   * @param {boolean} activate - true => restaurer, false => supprimer
   * @returns {Observable<Response>} - réponse http 
   */
  activateManyUsers(users: User[], activate: boolean): Observable<Response> {
    return this._http.put(
      this._backendURL.user + '/activateMany/' + (activate ? '1' : '0'),
      {restLong: RestApiService.listIds(users)},
      this.options()
    );
  }

  /**
   * Récupère le(s) rôle(s) de l'utilisateur actuel
   * @returns {Observable<RestLong>} - la valeur du rôle de l'utilisateur actuel
   */
  getUserRole(): Observable<RestLong> {
    return this._http.get(
      this._backendURL.user + '/' + (this._authToken ? this._authToken.u : 0) + '/role',
      this.options()
    ).map((res: Response) => {
      return res.json().restLong;
    });
  }

  /**
   * Récupère l'user à activer (s'il existe) en fonction du token de session (activation de compte uniquement)
   * @returns {Observable<User>} - Observable sur l'utilisateur à activer
   */
  getUserToActivate(): Observable<User> {
    return this._http.get(this._backendURL.activate, this.options()).map((res: Response) => {
      return res.json().user;
    });
  }

  /**
   * Active l'utilisateur dont l'id est userId avec les credentials
   * @param {number} userId - id de l'utilisateur à activer
   * @param {Credentials} credentials - login + mot de pase à utiliser pour ce compte
   * @returns {Observable<number>} - statut de la réponse http
   */
  activateUser(userId: number, credentials: Credentials): Observable<number> {
    return this._http.put(
      this._backendURL.activate + '/' + userId,
      {credentials: credentials},
      this.options()
    ).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Crée ou édite (s'ils existent déjà) les droits passés en paramètre
   * @param {ProjectRight[]} rights - droits à créer ou éditer
   * @returns {Observable<number>} - statut de la réponse http
   */
  createOrEditRights(rights: ProjectRight[]): Observable<number> {
    return this._http.put(
      this._backendURL.projectRight,
      {projectRight: rights},
      this.options()
    ).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Récupère les droits de l'utilisateur courant sur le projet dont l'id est donné en paramètre
   * @param {number} projectId - id du projet dont on veut les droits pour l'utilisateur courant
   * @returns {Observable<ProjectRight[]>} Observable sur les droits de l'utilisateur
   */
  fetchRightsForUserByProject(projectId: number) : Observable<ProjectRight[]> {
    return this._http.get(
      this._backendURL.projectRight + '/project/' + projectId,
      this.options()
    ).map((res: Response) => {
      return res.json().projectRight;
    });
  }

  /**
   * Récupère les drois d'un utilisateur en fonction des paramètres
   * @param {User} user - l'utilisateur dont on veut récupérer les droits 
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchRightsForUser(
    user: User,
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<ProjectRight>> {
    return this._http.get(
      this._backendURL.projectRight + '/user/' + user.id + '/'
        + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Récupère les drois relatifs à un projet en fonction des paramètres
   * @param {Project} project - le projet dont on veut récupérer les droits relatifs
   * @param {string} searchParams - paramètres de recherche
   * @param {string} orderParams - paramètres de tri
   * @param {number} index - index du début pour la pagination
   * @param {number} limit - nombre max d'items pour la pagination
   * @returns {Observable<FlexQueryResult<Project>>} - résultat de la requête
   */
  fetchRightsForProject(
    project: Project,
    searchParams: string,
    orderParams: string,
    index: number,
    limit: number
  ): Observable<FlexQueryResult<ProjectRight>> {
    return this._http.get(
      this._backendURL.projectRight + '/project/' + project.id + '/'
        + RestApiService.encodeQueryParams(searchParams, orderParams, index, limit),
      this.options()
    ).map((res: Response) => {
      return res.json().flexQueryResult;
    });
  }

  /**
   * Récupère tous les utulisateurs qui ont le droit right sur le projet project
   * @param {Project} project - le projet sur lequel les utilisateurs doivent avoir le droit
   * @param {Right} right - le droit à vérifier pour les utilisateurs
   * @returns {Observable<User[]>} Observable sur la liste des utilisateurs correspondants
   */
  fetchUsersByRightOnProject(project: Project, right: Right): Observable<User[]> {
    return this._http.get(
      this._backendURL.user + '/rightOnProject/' + project.id + '/' + right,
      this.options()
    ).map((res: Response) => {
      return res.json().user;
    });
  }

  /**
   * Récupère tous les checks sur une liste de fichier en fonction du statut et de l'id utilisateur
   * donnés en paramètres.
   * @param {Status} status - le statut à vérifier 
   * @param {number} userId - id de l'utilisateur 
   * @param {File[]} files - les fichiers à tester
   * @returns {Observable<WorkflowCheck[]>} - Observable sur la liste des checks correspondants
   */
  fetchWorkflowCheckByStatusUserVersions(status: Status, userId: number, files: File[]): Observable<WorkflowCheck[]> {
    let versionIds: RestLong[] = [];
    files.forEach((file: File) => {
      versionIds.push(new RestLong(file.version.id));
    });
    return this._http.post(
      this._backendURL.workflowCheck + '/' + userId + '/' + status,
      {restLong: versionIds},
      this.options()
    ).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  /**
   * Récupère tous les checks pour une version donnée
   * @param {number} versionId - id de la version dont on veut récupérer les checks
   * @returns {Observable<WorkflowCheck[]>} - Observable sur la liste des checks correspondants
   */
  fetchWorkflowChecksForVersion(versionId: number): Observable<WorkflowCheck[]> {
    return this._http.get(
      this._backendURL.workflowCheck + '/forVersion/' + versionId,
      this.options()
    ).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  /**
   * Récupère tous les checks pour un fichier
   * @param {number} fileId - id du fichier dont on veut récupérer les checks
   * @returns {Observable<WorkflowCheck[]>} - Observable sur la liste des checks correspondants
   */
  fetchWorkflowChecksForFile(fileId: number): Observable<WorkflowCheck[]> {
    return this._http.get(
      this._backendURL.workflowCheck + '/forLastVersion/' + fileId,
      this.options()
    ).map((res: Response) => {
      return res.json().workflowCheck;
    });
  }

  /**
   * Edite un check
   * @param {WorkflowCheck} check _ check à éditer
   * @returns {Observable<number>} - statut de la réponse http
   */
  editWorkflowCheck(check: WorkflowCheck): Observable<number> {
    return this._http.put(
      this._backendURL.workflowCheck + '/' + check.id,
      {workflowCheck: check},
      this.options()
    ).map((res: Response) => {
      return res.status;
    });
  }

  /**
   * Authentification par le backend en fonction des credentials
   * @param {Credentials} credentials - credentials pour l'authentification (login + mot de pase)
   * @returns {Observable<Response>} - Observable sur la réponse http
   */
  login(credentials: Credentials): Observable<Response> {
    return this._http.post(this._backendURL.auth, {credentials: credentials});
  }

  /**
   * Permet à un super admin de se logger en tant que n'importe quel autre utilisateur
   * @param {string} login - login du compte à utiliser
   * @returns {Observable<Response>} - Observable sur la réponse http
   */
  adminLoginAs(login: string): Observable<Response> {
    return this._http.get(this._backendURL.auth + '/adminLoginAs/' + login, this.options('text/plain'));
  }

 /**
  * Méthode qui génère automatiquement les options/headers à ajouter à la requête.
  * @param {string} accept - type de contenu accepté : 'application/json' par défaut
  * @param {Object} headerList - headers auxquels on veut ajouter les options
  * @returns {RequestOptions} - options/headers de la requête
  */
  private options(accept: string = 'application/json', headerList: Object = {}): RequestOptions {
    const headers: Headers = new Headers(Object.assign({ 'Accept': accept, 'Authorization': 'Bearer ' + JSON.stringify(this._authToken) }, headerList));
    return new RequestOptions({ headers: headers });
  }

  private static listIds(entities: Entity[]): RestLong[] {
    let ids: RestLong[] = [];
    entities.forEach((entity: File) => {
      ids.push(new RestLong(entity.id));
    });
    return ids;
  }

}

/**
 * Auteur : Florian
 * License : 
 */

import { Injectable, Inject } from '@angular/core';
import { Response } from "@angular/http";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import 'rxjs/add/operator/map';
import { RestApiService } from "app/services/rest-api.service";
import { AuthToken } from "entities/auth-token";
import { Credentials } from "entities/credentials";
import { Project } from "entities/project";
import { User } from "entities/user";
import { RoleCheckerService } from "app/services/role-checker";

/**
 * Service des infos globales de session
 */
@Injectable()
export class SessionService {

  // app :
  /** Indique que la page est prête à afficher du contenu */
  private _readyForContent: boolean = false;
  /** projet sélectionné dans la nav-list des projets (côté utilisateur) */
  private _selectedProject: Project = undefined;
  /** id des items sélectionnés dans les nav list (sauf projets) */
  private _selectedItemId: number[] = [];
  /** mapping des noms des items des nav-list vers leurs id's  */
  private _navListItemToIdMap: Map<string, number>[] = [];

  /** mapping des noms des nav-list vers leurs id's */
  private _navListNameToIdMap: Map<string, number> = new Map<string, number>();
  /** id de la prochaine nav-list créée */
  private _currentNavListId: number = 0;

  /** true quand il faut mettre à jour la nav_list des projets */
  private _updateProjectList = false;

  /* indique si l'admin veut la liste des projets actifs ou inactifs (supprimés) */
  private _fetchActiveProjects = true;

  // utilisateur :
  /** login du l'utilisateur courant */
  private _userLogin: string = undefined;
  /** token d'authentification de l'utilisateur courant */
  private _authToken: AuthToken = undefined;
  /** token d'authentification de l'utilisateur courant en base 64 */
  private _base64AuthToken: string = undefined;
  /** true si user courant loggé, sinon false */
  private _logged: boolean = false;

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé
   * @param {RoleCheckerService} _roleCheckerService - RoleChecker global
   */
  constructor(
    private _restService: RestApiService,
    private _roleCheckerService: RoleCheckerService
  ) { }

  /**
   * Méthode de déconnexion
   */
  logout(): void {
    this._readyForContent = false;
    this._selectedProject = undefined;
    this._selectedItemId = [];
    this._navListItemToIdMap = [];
    this._navListNameToIdMap.clear();
    this._currentNavListId = 0;
    this._updateProjectList = false;
    this._fetchActiveProjects = true;
    this._userLogin = undefined;
    this._authToken = undefined;
    this._base64AuthToken = undefined;
    this._logged = false;
    this._restService.authToken = undefined;
    this._roleCheckerService.reset();
  }

  /** @property {boolean} readyForContent - indique si la page est prête à afficher du contenu */
  get readyForContent(): boolean {
    return this._readyForContent;
  }

  set readyForContent(value: boolean) {
    this._readyForContent = value;
  }

  /** @property {Project} selectedProject - le projet sélectionné dans la nav-list des projets */
  get selectedProject(): Project {
    return this._selectedProject;
  }

  set selectedProject(project: Project) {
    this._selectedProject = project;
  }

  /** @property {boolean} updateProjectList - indique s'il faut mettre à jour la nav_list des projets ou non */
  get updateProjectList(): boolean {
    return this._updateProjectList;
  }

  set updateProjectList(update: boolean) {
    setTimeout(() => {
      this._updateProjectList = update;
    }, 0);
  }

  /**
   * @property {boolean} fetchActiveProjects - indique s'il faut afficher les projets actifs ou inactifs dans la
   *                                           liste des projets
   */
  get fetchActiveProjects(): boolean {
    return this._fetchActiveProjects;
  }

  set fetchActiveProjects(fetchActiveProjects: boolean) {
    this._fetchActiveProjects = fetchActiveProjects;
  }

  /**
   * Renvoie l'id de l'item seléctionné pour la nav-list dont le nom
   * @param {string} navListName - id de la nav list dont on veut l'id de l'item sélectionné
   * @returns {number} - section sélectionnée dans la nav-list demandée
   */
  getSelectedItemId(navListName: string): number {
    return this._selectedItemId[this.getNavListId(navListName)];
  }

  /**
   * Met à jour la sélection avec l'id précisé pour la nav list dont on donne le nom
   * @param {string} navListName - nom de la nav-list à mettre à jour
   * @param {number} id - id de sélection
   */
  setSelectedItemId(navListName: string, id: number): void {
    this._selectedItemId[this.getNavListId(navListName)] = id;
  }

  /**
   * Ajoute un élément dans le map nom de section -> id correspondant pour la nav-list dont le nom est précisé
   * @param {string} navListName - nom de la nav-list
   * @param {string} item - item/nom de la section à mapper
   * @param {number} id - id correspondant
   */
  mapNavListItemToId(navListName:string, item: string, id: number): void {
    this._navListItemToIdMap[this.getNavListId(navListName)].set(item.toLowerCase(), id);
  }

  /**
   * Vide le mapping de la nav list dont on a précisé le nom
   * @param {string} navListName - nom de la nav list
   */
  clearNavListItemToIdMap(navListName: string): void {
    this._navListItemToIdMap[this.getNavListId(navListName)].clear();
  }

  /**
   * Renvoie l'id correspondant au nom de section (item) de la nav list donnée en paramètre
   * @param {string} navListName - nom de la nav list
   * @param {string} item - item/nom de la section dont on veut l'id
   * @returns {number} - id de la section demandée
   */
  getNavListItemId(navListName: string, item: string): number {
    return this._navListItemToIdMap[this.getNavListId(navListName)].get(item.toLowerCase());
  }

  /**
   * Renvoie l'id de la nav-list dont on a donné le nom.
   * Crée une entrée pour la nav-list si elle n'a pas encore d'id
   * @param {string} navListName - nom de la nav list dont on veut l'id
   * @returns {number} - id de la nav-list
   */
  getNavListId(navListName: string): number {  
    // on met tout en minuscule pour éviter les erreurs débiles
    navListName = navListName.toLowerCase();
    
    // Récupère l'id pour une nav-list existante :
    if(this._navListNameToIdMap.has(navListName)) {
      return this._navListNameToIdMap.get(navListName);
    }

    // NavList inconnue, on crée une nouvelle entrée :
    let id: number = this._currentNavListId;
    this._navListNameToIdMap.set(navListName, this._currentNavListId++);
    this._navListItemToIdMap.push(new Map<string, number>());
    this._selectedItemId.push(0); // sélection autmatique du premier item de la nav-list ajoutée
    return id;
  }

  /** @property {number} userId - id de l'user courant */
  get userId(): number {
    return this._authToken ? this._authToken.u : undefined;
  }

  /** @property {string} userLogin - login de l'user courant */
  get userLogin(): string {
    return this._userLogin;
  }

  set userLogin(userLogin: string) {
    this._userLogin = userLogin;
  }

  /** @property {AuthToken} authToken - token d'authentification de l'user courant */
  get authToken(): AuthToken {
    return this._authToken;
  }

  /** @property {string} base64AuthToken - token d'authentification de l'user courant en base 64 */
  get base64AuthToken(): string {
    return this._base64AuthToken;
  }

  set authToken(authToken: AuthToken) {
    this._authToken = authToken;
    this._restService.authToken = authToken;
    this._base64AuthToken = btoa(JSON.stringify(this._authToken));
  }

  /** @property {boolean} logged - indique si l'utilisateur courant est loggé ou pas. */
  get logged(): boolean {
    return this._logged;
  }

  /**
   * Méthode de login
   * @param {string} login - login de l'utilisateur 
   * @param {Response} res - réponse du serveur
   * @returns {Response} - réponse du serveur
   */
  private _login(login: string, res: Response): Response {
    this.logout();
    this._userLogin = login;
    this.authToken = res.json();
    this._logged = true;
    this._roleCheckerService.directLoad(this.authToken.r);
    return res;
  }

  /**
   * Méthode pour authentifier un utilisateur avec son login et mot de passe
   * @param {string} login - login de l'utilisateur
   * @param {string} pwd - mot de passe de l'utilisateur
   * @returns {Observable<Response>} - un Observable sur la réponse du serveur
   * (qui contient un token d'authentification pour les prochaines requêtes)
   */
  login(login: string, pwd: string): Observable<Response> {
    return this._restService.login(new Credentials(login, pwd)).map((res: Response) => {
      return this._login(login, res);
    });
  }

  /**
   * Méthode pour qu'un superadmin puisse s'authentifier sur n'importe quel autre compte
   * @param {string} login - login du compte sur lequel le superadmin veut s'authentifier
   * @returns {Observable<Response>} - un Observable sur la réponse du serveur
   * (qui contient un token d'authentification pour les prochaines requêtes)
   */
  adminLoginAs(login: string): Observable<Response> {
    return this._restService.adminLoginAs(login).map((res: Response) => {
      return this._login(login, res);
    });
  }

}

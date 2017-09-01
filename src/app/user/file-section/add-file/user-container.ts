/**
 * Auteur : Florian
 * License : 
 */

import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { CheckType, WorkflowCheck } from "entities/workflow-check";
import { Project } from "entities/project";
import { Right } from "entities/project-right";
import { User } from "entities/user";
import { Version } from "entities/version";

/**
 * Classe conteneur d'utilisateurs :
 * - Ensemble des utilisateurs sélectionnés
 * - Ensemble des utilisateurs disponibles
 * - Conjonction utilisateurs sélectionnés et libres = ensemble de tous les utlisateurs du container
 * - Disjonction utilisateurs sélectionnés et libres = ensemble vide
 */
export class UserContainer {
  // observables :
  /** Observable sur les utilisateurs choisis */
  private _usersObs: Observable<User[]> = undefined;
  /** Observable sur les utilisateurs disponibles */
  private _availableUsersObs: Observable<User[]> = undefined;

  // infos users
  /** Identifiants des utilisateurs à passer de l'ensemble disponibles à l'ensemble choisis */
  private _usersToAdd: number[] = []; // identifiants des users à ajouter
  /** ensemble des utilisateurs disponibles */
  private _availableUsers: User[] = [];
  /** ensemble des utilisateurs choisis */
  private _users: User[] = [];
  /** Pour les utilisateurs choisis, indique s'ils sont liés au précédent (true) ou pas (false) */
  private _chained: boolean[] = [];

  /** mapping interne */
  private _idToAvailableUserMap: Map<number, User> = new Map<number, User>();

  // config :
  /** droit relatif à ce conteneur (si on veut les utilisateurs étant contrôleurs par exemple) */
  private _right: Right = 0;

  // divers :
  /** mode ajout ? sinon liste */
  private _addMode: boolean = false;
  /** la liste des utilisateurs à passer de disponibles à choisis n'est pas vide ? */
  private _hasUsersToAdd: boolean = false;

  /** compteur d'ordre pour l'affichage */
  private _order: number = 1;

  /**
   * @constructor
   * @param {string} _title - titre du conteneur
   * @param {CheckType} _type - type de contrôles relatifs à ce conteneur
   * @param {Project} _project - projet relatif à ce conteneur
   * @param {Right} right - droit relatif à ce conteneur 
   * @param {RestApiService} _restService - service REST utilisé
   */
  constructor(
    private _title: string,
    private _type: CheckType = CheckType.CONTROL,
    private _project: Project,
    right: Right = 0,
    private _restService: RestApiService
  ) {
    this.right = right;
  }

  /**
   * Mets à jour la datatable affichant le conteneur
   * @param {User[]} data - les nouvelles données 
   */
  private static update(data: User[]): Observable<User[]> {
    return Observable.create((observer: Observer<User[]>) => {
      observer.next(data);
      observer.complete();
    });
  }

  /**
   * Mise à jour de la liste des utilisateurs choisis dans la datatable
   */
  updateUsers(): void {
    this._usersObs = UserContainer.update(this._users);
  }

  /**
   * Mise à jour de la liste des utilisateurs disponibles dans la datatable
   */
  updateAvailableUsers(): void {
    this._availableUsersObs = UserContainer.update(this._availableUsers);
  }

  /**
   * Mets à jour ce qu'il faut en fonction du mode d'affichage dans lequel on est (chosis/ajout)
   */
  update(): void {
    this._addMode ? this.updateAvailableUsers() : this.updateUsers();
  }

  /**
   * Effectue un mapping de l'id d'un user du tableau vers l'index de cet user dans le tableau
   */
  mapAvailableUsers(): void {
    this._idToAvailableUserMap.clear();
    for(let index: number = 0; this._availableUsers && index < this._availableUsers.length; ++index) {
      this._idToAvailableUserMap.set(this._availableUsers[index].id, this._availableUsers[index]);
    }
  }

  /** @property {Right} right - droit relatif au container */
  set right(right: Right) {
    this.reset();
    this._right = right;
    if(! this._right) {
      return;
    }
    let sub: Subscription = this._restService.fetchUsersByRightOnProject(this._project, right).subscribe(
      (users: User[]) => {
        this._availableUsers = users;
        this.mapAvailableUsers();
      },
      (error: Response) => {
        // gérer erreur ?
      },
      () => {
        sub.unsubscribe();
        this.update();
      }
    );
  }

  /** @property {string} title - titre du container */
  get title(): string {
    return this._title;
  }

  /** @property {string} name - dénomination des utilisateurs du container (en fonction du titre du container) */
  get name(): string {
    let name: string = this._title.toLocaleLowerCase();
    if(name.charAt(name.length - 1) == 's') {
      name = name.substring(0, name.length - 1);
    }
    return name;
  }

  /** @property {Project} project - project relatif au conteneur */
  get project(): Project {
    return this._project;
  }

  /** @property {CheckType} type - type de checks relatifs au conteneur */
  get type(): CheckType {
    return this._type;
  }

  /** @property {Right} right - droit relatif au conteneur */
  get right(): Right {
    return this._right;
  }

  /** @property {User[]} users - Ensemble des utilisateurs choisis */
  get users(): User[] {
    return this._users;
  }

  /** @property {boolean[]} chained - indique si l'utilisateur choisi correspondant est chainé au précédent ou pas */
  get chained(): boolean[] {
    return this._chained;
  }

  /** @property {Observable<User[]>} usersObs - Observable sur l'ensemble des utilisateurs choisis */
  get usersObs(): Observable<User[]> {
    return this._usersObs;
  }

  /** @property {Observable<User[]>} availableUsers - Observable sur l'ensemble des utilisateurs disponibles */
  get availableUsers(): Observable<User[]> {
    return this._availableUsersObs;
  }

  /** @property {number[]} usersToAdd - indexs des utilisateurs à passer de l'ensemble disponibles à choisis */
  set usersToAdd(indexes: number[]) {
    this._usersToAdd = indexes;
    this.hasUsersToAdd = (this._usersToAdd.length > 0);
  }

  /**
   * @property {boolean} hasUsersToAdd - indique s'il y a des utilisateurs à passer de l'ensemble disponible
   *                                      à choisis
   */
  get hasUsersToAdd(): boolean {
    return this._hasUsersToAdd;
  }

  set hasUsersToAdd(value: boolean) {
    setTimeout(() => {
      this._hasUsersToAdd = value;
    }, 0);
  }

  /** vide l'ensemble des utilisateurs à passer de disponibles à choisis */
  resetUsersToAdd(): void {
    this._usersToAdd = [];
    this.hasUsersToAdd = false;
  }

  /** @property {number} size - le nombre d'utilisateurs choisis */
  get size(): number {
    return this._users.length;
  }

  /** @property {number} availableSize - le nombre d'utilisateurs disponibles */
  get availableSize(): number {
    return this._availableUsers.length;
  }

  /**
   * Réinitialise le conteneur
   */
  reset(): void {
    this._users = [];
    this._chained = [];
    this._usersToAdd = [];
    this._hasUsersToAdd = false;
  }

  /**
   * Bascule entre les modes lister/ajout
   */
  switchMode(): void {
    this._addMode = ! this._addMode;
    this.update();
  }

  /**
   * Indique si le mode courant est le mode d'ajout
   * @returns {boolean} true si le mode courant est le mode d'ajout, sinon false
   */
  isAddMode(): boolean {
    return this._addMode;
  }

  /**
   * Indique si le mode courant est le mode liste des utilisateurs choisis ou non
   * @returns {boolean} - true si le mode courant est le mode liste des utilisateurs choisis, sinon false
   */
  isListMode(): boolean {
    return ! this.isAddMode();
  }

  /**
   * Supprime l'user correspondant à index de l'ensemble des users choisis
   * et l'ajoute à l'ensemble des users disponibles
   * @param {number} index - index de l'user à supprimer 
   */
  delete(index: number): void {
    let deletedUser: User = this._users.splice(index, 1)[0];      // supprime l'user de la liste
    this._availableUsers.push(deletedUser);                       // cet user est denouveau disponible
    this._idToAvailableUserMap.set(deletedUser.id, deletedUser);  // fait le mapping vers cet user supprimé à nouveau disponible
    this._chained.splice(index, 1);                               // on supprime également la priorité de cet user
    this.update();                                                // indique une mise à jour à la datatable
  }

  /**
   * Ajoute les utilisateurs correspondants aux identifiers à l'ensemble choisis et les supprime de disponibles
   * @param {number[]} identifiers - identifiants des users à ajouter
   */
  addUsers(identifiers: number[]): void {
    // Ajout des utilisateurs selectionnés...
    identifiers.forEach((id: number) => {
      let user: User = this._idToAvailableUserMap.get(id); // récupère l'utilisateur correspondant à cet identifiant
      this._idToAvailableUserMap.delete(id);               // supression du mapping (user plus dispo)
      this._users.push(user);                              // ajoute user à la liste des users sélectionnés
      this._chained.push(false);                           // ajout priorité
    });

    // Il faut maintenant recréer le tableau des utilisateurs disponibles
    // On va se servir du mapping qui lui est à jour...
    this._availableUsers = [];                                                // reset du tableau
    this._idToAvailableUserMap.forEach((user: User, identifier: number) => {
      this._availableUsers.push(user);                                        // ajout des users présents dans le mapping
    });
  }

  /**
   * Procède à l'ajout des utilisateurs à ajouter à l'ensemble choisis tout en les supprimant de l'ensemble disponibles
   */
  processUsersToAdd(): void {
    this.addUsers(this._usersToAdd);
    this.resetUsersToAdd();
  }

  /**
   * Précise si l'utilisateur choisi à l'index précisé est chainé au précédent ou pas
   * @param {number} index - index de l'utilisateur choisi à affecter
   * @param {boolean} value - chainé (true), non chainé (false)
   */
  chain(index: number, value: boolean): void {
    this._chained[index] = value;
  }

  /**
   * Indique si l'utilisateur choisi à l'index précisé est chainé au précédent ou pas
   * @param {number} index - index de l'utilisateur choisi
   * @returns {boolean} true si chainé, sinon false
   */
  isChained(index: number): boolean {
    return this._chained[index];
  }

  /**
   * Inverse l'état chainé pour l'utilisateur choisi à l'index précisé
   * @param {number} index - index de l'utilisateur choisi
   * @returns {boolean}  
   */
  chainToggle(index: number): void {
    this._chained[index] = ! this._chained[index];
  }

  /**
   * Echange l'utilisateur choisi à IndexA avec celui à IndexB
   * @param {number} indexA - utilisateur choisi A
   * @param {number} indexB - Utilisateur choisi B
   */
  swap(indexA: number, indexB: number): void {
    let tmpUser: User = this._users[indexA];
    let tmpChained: boolean = this._chained[indexA];
    this._users[indexA] = this._users[indexB];
    this._chained[indexA] = this._chained[indexB];
    this._users[indexB] = tmpUser;
    this._chained[indexB] = tmpChained;
    this.update();
  }

  /**
   * Compte l'ordre de priorité de l'utilisateur choisi à l'index précisé en fonction des informations du conteneur
   * @param {number} index - index de l'utilisateur dont on veut connaitre la priorité
   */
  countOrderValue(index: number): number {
    if(index == 0) {
      this._order = 1;
    }
    else if(this) {
      this._order = this._chained[index] ? this._order + 1 : this._order; 
    }
    return this._order;
  }

  /**
   * Transforme les utilisateurs choisis en checks du type correspondant à celui du conteneur
   * @param {Version} version - version à laquelle il faut ajouter ces checks
   */
  addAsChecksToVersionAndProject(version: Version, project: Project): void {
    let checks: WorkflowCheck[] = [];
    for(let index: number = 0; index < this._users.length; ++index) {
      let check: WorkflowCheck = new WorkflowCheck();
      check.type = this._type;
      check.order_num = this.countOrderValue(index) - 1;
      check.user = this._users[index];
      check.project = project;
      version.workflowChecks.push(check);
    }
  }
  
}
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { CheckType, WorkflowCheck } from "entities/workflow-check";
import { Project } from "entities/project";
import { Right } from "entities/project-right";
import { User } from "entities/user";
import { Version } from "entities/version";

export class UserContainer {
  // titre
  private _title: string;

  // observables
  private _usersObs: Observable<User[]> = undefined;
  private _availableUsersObs: Observable<User[]> = undefined;

  // infos users
  private _usersToAdd: number[] = []; // identifiants des users à ajouter
  private _availableUsers: User[] = [];
  private _users: User[] = [];
  private _chained: boolean[] = [];

  // mapping interne
  private _idToAvailableUserMap: Map<number, User> = new Map<number, User>();

  // config
  private _right: Right = 0;
  private _project: Project = undefined;
  private _type: CheckType = undefined;

  // service rest
  private _restService: RestApiService;

  // divers
  private _addMode: boolean = false;
  private _hasUsersToAdd: boolean = false;

  // compteur d'ordre pour l'affichage
  private _order: number = 1;

  constructor(
    title: string,
    type: CheckType = CheckType.CONTROL,
    project: Project,
    right: Right = 0,
    restService: RestApiService
  ) {
    this._restService = restService;
    this._title = title;
    this._type = type;
    this._project = project;
    this.right = right;
  }

  private static update(data: User[]): Observable<User[]> {
    return Observable.create((observer: Observer<User[]>) => {
      observer.next(data);
      observer.complete();
    });
  }

  updateUsers(): void {
    this._usersObs = UserContainer.update(this._users);
  }

  updateAvailableUsers(): void {
    this._availableUsersObs = UserContainer.update(this._availableUsers);
  }

  update(): void {
    this._addMode ? this.updateAvailableUsers() : this.updateUsers();
  }

  // effectue un mapping de l'id d'un user du tableau vers l'index de cet user dans le tableau
  mapAvailableUsers(): void {
    this._idToAvailableUserMap.clear();
    for(let index: number = 0; this._availableUsers && index < this._availableUsers.length; ++index) {
      this._idToAvailableUserMap.set(this._availableUsers[index].id, this._availableUsers[index]);
    }
  }

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

  get title(): string {
    return this._title;
  }

  get name(): string {
    let name: string = this._title.toLocaleLowerCase();
    if(name.charAt(name.length - 1) == 's') {
      name = name.substring(0, name.length - 1);
    }
    return name;
  }

  get project(): Project {
    return this._project;
  }

  get type(): CheckType {
    return this._type;
  }

  get right(): Right {
    return this._right;
  }

  get users(): User[] {
    return this._users;
  }

  get chained(): boolean[] {
    return this._chained;
  }

  get usersObs(): Observable<User[]> {
    return this._usersObs;
  }

  get availableUsers(): Observable<User[]> {
    return this._availableUsersObs;
  }

  set usersToAdd(indexes: number[]) {
    this._usersToAdd = indexes;
    this.hasUsersToAdd = (this._usersToAdd.length > 0);
  }

  set hasUsersToAdd(value: boolean) {
    setTimeout(() => {
      this._hasUsersToAdd = value;
    }, 0);
  }

  resetUsersToAdd(): void {
    this._usersToAdd = [];
    this.hasUsersToAdd = false;
  }

  get hasUsersToAdd(): boolean {
    return this._hasUsersToAdd;
  }

  get size(): number {
    return this._users.length;
  }

  get availableSize(): number {
    return this._availableUsers.length;
  }

  reset(): void {
    this._users = [];
    this._chained = [];
    this._usersToAdd = [];
    this._hasUsersToAdd = false;
  }

  switchMode(): void {
    this._addMode = ! this._addMode;
    this.update();
  }

  isAddMode(): boolean {
    return this._addMode;
  }

  isListMode(): boolean {
    return ! this.isAddMode();
  }

  delete(index: number): void {
    let deletedUser: User = this._users.splice(index, 1)[0];      // supprime l'user de la liste
    this._availableUsers.push(deletedUser);                       // cet user est denouveau disponible
    this._idToAvailableUserMap.set(deletedUser.id, deletedUser); // fait le mapping vers cet user supprimé à nouveau disponible
    this._chained.splice(index, 1);                               // on supprime également la priorité de cet user
    this.update();                                                // indique une mise à jour à la datatable
  }

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

  processUsersToAdd(): void {
    this.addUsers(this._usersToAdd);
    this.resetUsersToAdd();
  }

  chain(index: number, value: boolean): void {
    this._chained[index] = value;
  }

  isChained(index: number): boolean {
    return this._chained[index];
  }

  chainToggle(index: number): void {
    this._chained[index] = ! this._chained[index];
  }

  swap(indexA: number, indexB: number): void {
    let tmpUser: User = this._users[indexA];
    let tmpChained: boolean = this._chained[indexA];
    this._users[indexA] = this._users[indexB];
    this._chained[indexA] = this._chained[indexB];
    this._users[indexB] = tmpUser;
    this._chained[indexB] = tmpChained;
    this.update();
  }

  countOrderValue(index: number): number {
    if(index == 0) {
      this._order = 1;
    }
    else if(this) {
      this._order = this._chained[index] ? this._order + 1 : this._order; 
    }
    return this._order;
  }

  addAsChecksToVersion(version: Version): void {
    let checks: WorkflowCheck[] = [];
    for(let index: number = 0; index < this._users.length; ++index) {
      let check: WorkflowCheck = new WorkflowCheck();
      check.type = this._type;
      check.order_num = this.countOrderValue(index) - 1;
      check.user = this._users[index];
      version.workflowChecks.push(check);
    }
  }
}
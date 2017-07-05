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
  private _usersToAdd: number[] = []; // index des users à ajouter
  private _availableUsers: User[] = [];
  private _users: User[] = [];
  private _chained: boolean[] = [];

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
    project: Project, right: Right = 0,
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

  set right(right: Right) {
    this.reset();
    this._right = right;
    let sub: Subscription = this._restService.fetchUsersByRightOnProject(this._project, right).subscribe(
      (users: User[]) => {
        this._availableUsers = users;
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

  get right(): Right {
    return this._right;
  }

  get users(): Observable<User[]> {
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

  delete(i: number): void {
    this._availableUsers.push(this._users.splice(i, 1)[0]);
    this._chained.splice(i, 1);
    this.update();
  }

  addUsers(indexes: number[]): void {
    indexes.forEach((i: number) => {
      this._users.push(this._availableUsers[i]);
      this._chained.push(false);
      this._availableUsers[i] = undefined; // on marque les utilisateurs qu'on a ajouté
    });

    // on recrée le tableau des utilisateurs disponibles (Complexité temporelle: O(n), mémorielle: O(2n))
    // Je ne vois pas de façon plus rapide pour supprimer des éléments d'un tableau dont on a les indexes, mais pas forcément triés.
    // Le tri en lui même est de minimum O(n log(n)), ce qui est déjà plus long. Et il faut encore faire la suppression...
    let newAvailableUsers: User[] = [];
    this._availableUsers.forEach((user: User) => {
      if(user != undefined) {
        newAvailableUsers.push(user);
      }
    });
    this._availableUsers = newAvailableUsers;
  }

  processUsersToAdd(): void {
    this.addUsers(this._usersToAdd);
    this.resetUsersToAdd();
  }

  chain(i: number, value: boolean): void {
    this._chained[i] = value;
  }

  isChained(i: number): boolean {
    return this._chained[i];
  }

  chainToggle(i: number): void {
    this._chained[i] = ! this._chained[i];
  }

  swap(i: number, j: number): void {
    let tmpUser: User = this._users[i];
    let tmpChained: boolean = this._chained[i];
    this._users[i] = this._users[j];
    this._chained[i] = this._chained[j];
    this._users[j] = tmpUser;
    this._chained[j] = tmpChained;
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
    for(let i: number = 0; i < this._users.length; ++i) {
      let check: WorkflowCheck = new WorkflowCheck();
      check.type = this._type;
      check.order_num = this.countOrderValue(i) - 1;
      check.user = this._users[i];
      version.workflowChecks.push(check);
    }
  }
}
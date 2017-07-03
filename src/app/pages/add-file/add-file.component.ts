import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Project } from "app/entities/project";
import { File as FileEntity } from "app/entities/file";
import { Version } from "app/entities/version";
import { User } from "app/entities/user";
import { Date } from "app/entities/date";
import { FileUploadService } from "app/shared/file-upload.service";
import { SessionService } from "app/shared/session.service";
import { MdDialogRef, MdDialog } from "@angular/material";
import { ProgressComponent } from "app/shared/progress/progress.component";
import { Right } from "app/entities/project-right";
import { RestApiService } from "app/shared/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { DatatableSelection } from "app/shared/datatable/datatable-selection";

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

  // service rest
  private _restService: RestApiService;

  // divers
  private _addMode: boolean = false;
  private _hasUsersToAdd: boolean = false;

  // compteur d'ordre pour l'affichage
  private _order: number = 1;

  constructor(title: string, project: Project, right: Right = 0, restService: RestApiService) {
    this._restService = restService;
    this._title = title;
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
}

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent implements OnInit {
  private _form: FormGroup;
  private _uploadFile: File = undefined;
  private _paramsSub: Subscription;
  private _project: Project = new Project();
  private _file: FileEntity = new FileEntity();
  private _newVersionMode: boolean = false;
  private _progressModal: MdDialogRef<ProgressComponent> = undefined;
  private _uploadProgress: number = 0;
  private _aborted: boolean = false;

  private _userContainers: UserContainer[] = [];

  constructor(
    private _uploadService: FileUploadService,
    private _restService: RestApiService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _session: SessionService,
    private _dialog: MdDialog,
    private _cdr: ChangeDetectorRef) {
    this._form = this._buildForm();
  }

  ngOnInit() {
    if (!this._session.logged) {
      this._router.navigate(['/home']);
    }
    this._paramsSub = this._route.params.subscribe(params => {
      this._project.id = +params['projectId'] || undefined;
      this._file.id = +params['fileId'] || undefined;
      this._newVersionMode = (this._file.id != undefined);
      this._userContainers.push(new UserContainer('Contrôleurs', this._project, Right.CONTROLFILE, this._restService));
      this._userContainers.push(new UserContainer('Valideurs', this._project, Right.VALIDATEFILE, this._restService));
    });
  }

  ngOnDestroy() {
    this._paramsSub.unsubscribe();
  }

  get form(): FormGroup {
    return this._form;
  }

  get filename(): string {
    return this._file && this._uploadFile.name || '';
  }

  get newVersionMode(): boolean {
    return this._newVersionMode;
  }

  get userContainers(): UserContainer[] {
    return this._userContainers;
  }

  fileSelect(file: File): void {
    this._uploadFile = file;
    this._form.controls.filename.setValue(this._uploadFile.name);
  }

  // On vérifie le form à la main : le champ 'filename' est désactivé pour qu'on ne puisse pas l'éditer.
  // Malheureusement, un champ désactivé est considéré invalide par défaut... On doit donc vérifier les champs un par un
  // et faire un test particulier pour le cahmp 'filename'
  get isValidForm(): boolean {
    //TODO : ajouter un test pour chaque champ : this._form.controls.controlname.valid == true
    if(this._form.controls.filename.value == '') { return false; }
    if(! this._newVersionMode) {
      for(let container of this._userContainers) {
        if(container.size <= 0) { return false; }
      }
    }
    return true;
  }

  submit(): void {
    let entityType: string;
    let entity: any;
    let version: Version = new Version();
    version.filename = this.filename;
    if (this._newVersionMode) {
      version.file = this._file;
      entityType = 'version';
      entity = version;
    }
    else {
      this._file.version = version;
      this._file.project = this._project;
      entityType = 'file';
      entity = this._file;
    }
    this._aborted = false;
    this._uploadProgress = 0;
    this.openProgressModal();
    let uploadSub: Subscription = this._uploadService.upload([], this._uploadFile, entityType, entity).subscribe(
      (res: void) => {
      },
      (error: any) => {
        // gérer erreur ?
      },
      () => {
        uploadSub.unsubscribe();
        if (!this._aborted) {
          this.closeProgressModal();
          this._router.navigate(['/home']);
        }
      }
    );
  }

  cancel(): void {
    this._router.navigate(['/home']);
  }

  openProgressModal(): void {
    let uploadSub: Subscription = this._uploadService.progress.subscribe(
      (uploadProgress: number) => {
        this._uploadProgress = uploadProgress;
      },
      (error: any) => {
        // gérer erreur ?
      },
      () => {
        uploadSub.unsubscribe();
      }
    );
    this._progressModal = this._dialog.open(ProgressComponent, { data: this._uploadService.progress });
    let progressModalSub: Subscription = this._progressModal.afterClosed().subscribe(
      (totalProgress: number) => {
        if (totalProgress == undefined || totalProgress < 100) {
          this._aborted = true;
          this._uploadService.abort();
        }
      },
      (error: any) => {
        // gérer erreur ?
      },
      () => {
        progressModalSub.unsubscribe();
        this._progressModal = undefined;
      }
    );
  }

  closeProgressModal(): void {
    if (this._progressModal) {
      this._progressModal.close(this._uploadProgress);
    }
  }

  updateUsersToAdd(container: UserContainer, selections: DatatableSelection<User>[]) {
    let indexes: number[] = [];
    selections.forEach((selection: DatatableSelection<User>) => {
      indexes.push(selection.id);
    });
    container.usersToAdd = indexes;
  }

  switchContainerMode(container: UserContainer): void {
    container.switchMode();
    container.resetUsersToAdd();
  }

  addContainerUsers(container: UserContainer): void {
    container.processUsersToAdd();
    this.switchContainerMode(container);
  }

  /**
     * Function to build our form
     *
     * @returns {FormGroup}
     *
     * @private
     */
  private _buildForm(): FormGroup {
    return new FormGroup({
      filename: new FormControl({ value: '', disabled: true }, Validators.compose([
        Validators.required
      ]))
    });
  }
}

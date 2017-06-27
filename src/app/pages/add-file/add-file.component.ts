import { Component, OnInit } from '@angular/core';
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

export class UserContainer {
  private _title: string;
  private _availableUsers: User[] = []
  private _users: User[] = [];
  private _chained: boolean[] = [];
  private _right: Right = 0;
  private _project: Project = undefined;
  private _restService: RestApiService;

  constructor(title: string, project: Project, right: Right = 0, restService: RestApiService) {
    this._restService = restService;
    this._title = title;
    this._project = project;
    this.right = right;
  }

  set right(right: Right) {
    this.reset();
    this._right = right;
    let sub: Subscription = this._restService.fetchUsersByRightOnProject(this._project, right)
      .finally(() => {
        sub.unsubscribe();
      })
      .subscribe((users: User[]) => this._availableUsers = users);
  }

  get title(): string {
    return this._title;
  }

  get project(): Project {
    return this._project;
  }

  get right(): Right {
    return this._right;
  }

  get users(): User[] {
    return this._users;
  }

  get availableUsers(): User[] {
    return this._availableUsers;
  }

  reset(): void {
    this._users = [];
    this._chained = [];
  }

  addUser(i: number): void {
    this._users.push(this._availableUsers.splice(i, 1)[0]);
  }

  deleteUser(i: number): void {
    this._availableUsers.push(this._users.splice(i, 1)[0]);
  }

  addUsers(indexes: number[]): void {
    indexes.forEach((i: number) => {
      this.addUser(i);
    })
  }

  chain(i : number, value: boolean): void {
    this._chained[i] = value;
  }

  swap(i: number, j: number): void {
    let tmpUser: User = this._users[i];
    let tmpChained: boolean = this._chained[i];
    this._users[i] = this._users[j];
    this._chained[i] = this._chained[j];
    this._users[j] = tmpUser;
    this._chained[j] = tmpChained;
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
    private _dialog: MdDialog) {
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
      this._userContainers.push(new UserContainer('Validateurs', this._project, Right.VALIDATEFILE, this._restService));
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
    return this._form.controls.filename.value != '';
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
    let uploadSub: Subscription = this._uploadService.upload([], this._uploadFile, entityType, entity)
      .finally(() => {
        uploadSub.unsubscribe();
        if (!this._aborted) {
          this.closeProgressModal();
          this._router.navigate(['/home']);
        }
      })
      .subscribe(
      error => this.closeProgressModal()
      )
  }

  cancel(): void {
    this._router.navigate(['/home']);
  }

  openProgressModal(): void {
    let uploadSub: Subscription = this._uploadService.progress$
      .finally(() => uploadSub.unsubscribe())
      .subscribe((uploadProgress: number) => this._uploadProgress = uploadProgress)
    this._progressModal = this._dialog.open(ProgressComponent, { data: this._uploadService.progress$ });
    let progressModalSub: Subscription = this._progressModal.afterClosed()
      .finally(() => {
        progressModalSub.unsubscribe();
        this._progressModal = undefined;
      })
      .subscribe(totalProgress => {
        if (totalProgress == undefined || totalProgress < 100) {
          this._aborted = true;
          this._uploadService.abort();
        }
      });
  }

  closeProgressModal(): void {
    if (this._progressModal) {
      this._progressModal.close(this._uploadProgress);
    }
  }

  addTo(UserContainer): void {
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

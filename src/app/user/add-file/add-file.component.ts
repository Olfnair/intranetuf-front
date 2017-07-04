import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MdDialogRef, MdDialog } from "@angular/material";
import { Subscription } from "rxjs/Subscription";
import { FileUploadService } from "services/file-upload.service";
import { RestApiService } from "services/rest-api.service";
import { SessionService } from "services/session.service";
import { ProgressComponent } from "gui/progress";
import { DatatableSelection } from "gui/datatable";
import { UserContainer } from "app/user/add-file/user-container";
import { CheckType } from "entities/workflow-check";
import { File as FileEntity } from "entities/file";
import { Project } from "entities/project";
import { Right } from "entities/project-right";
import { User } from "entities/user";
import { Version } from "entities/version";

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
    private _dialog: MdDialog
  ) {
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
      this._userContainers.push(new UserContainer('Contrôleurs', CheckType.CONTROL, this._project, Right.CONTROLFILE, this._restService));
      this._userContainers.push(new UserContainer('Valideurs', CheckType.VALIDATION, this._project, Right.VALIDATEFILE, this._restService));
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
  // et faire un test particulier pour le champ 'filename'
  get isValidForm(): boolean {
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
    version.workflowChecks = [];
    this._userContainers.forEach((container: UserContainer) => {
      container.addAsChecksToVersion(version);
    });
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

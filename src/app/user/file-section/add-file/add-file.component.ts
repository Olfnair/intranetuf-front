import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MdDialogRef, MdDialog } from "@angular/material";
import { Subscription } from "rxjs/Subscription";
import { FileUploadService } from "app/services/file-upload.service";
import { RestApiService } from "app/services/rest-api.service";
import { GuiForm } from "app/gui/gui-form";
import { GuiProgressComponent } from "app/gui/gui-progress";
import { UserContainer } from "./user-container";
import { File as FileEntity } from "entities/file";
import { Project } from "entities/project";
import { Right } from "entities/project-right";
import { User } from "entities/user";
import { Version } from "entities/version";
import { WorkflowCheck, CheckType } from "entities/workflow-check";

class InputData {
  project: Project = undefined;
  file: FileEntity = undefined;

  constructor() { };
}

@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent extends GuiForm {
  private _uploadFile: File = undefined;
  private _project: Project = new Project();
  private _file: FileEntity = new FileEntity();
  private _newVersionMode: boolean = false;
  private _progressModal: MdDialogRef<GuiProgressComponent> = undefined;
  private _uploadProgress: number = 0;
  private _aborted: boolean = false;

  private _userContainers: UserContainer[] = [];

  private _close$: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private _uploadService: FileUploadService,
    private _restService: RestApiService,
    private _dialog: MdDialog
  ) {
    super();
  }

  init(): void {
    this._userContainers = [];
    this._userContainers.push(new UserContainer('Contrôleurs', CheckType.CONTROL, this._project, Right.CONTROLFILE, this._restService));
    this._userContainers.push(new UserContainer('Valideurs', CheckType.VALIDATION, this._project, Right.VALIDATEFILE, this._restService));
  }

  loadCurrentControllers(): void {
    let sub: Subscription = this._restService.getWorkflowChecksForFile(this._file.id).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        let old_order = 0;
        let new_order = 0;
        checks.forEach((check: WorkflowCheck) => { // on suppose triés ASC sur Type puis order
          new_order = check.order_num;
          this._userContainers.forEach((container: UserContainer) => {
            if(container.type == check.type) {
              container.users.push(check.user);
              container.chained.push(new_order > old_order ? true : false);
            }
          });
          old_order = new_order;
        });
        this._userContainers.forEach((container: UserContainer) => {
          container.update();
        });
      },
      (error: Response) => {
        // gestion d'erreur
      }
    );
  }

  @Input() set data(inputData: InputData) {
    this._project = inputData.project;
    this._file = inputData.file;
    this._newVersionMode = (this._file != undefined);
    this.init();
    if(this._newVersionMode) {
      this.loadCurrentControllers();
    }
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

  @Output('close') get close$(): EventEmitter<void> {
    return this._close$;
  }

  fileSelect(file: File): void {
    this._uploadFile = file;
    this.form.controls.filename.setValue(this._uploadFile.name);
  }

  // On vérifie le form à la main : le champ 'filename' est désactivé pour qu'on ne puisse pas l'éditer.
  // Malheureusement, un champ désactivé est considéré invalide par défaut... On doit donc vérifier les champs un par un
  // et faire un test particulier pour le champ 'filename'
  get isValidForm(): boolean {
    if(this.form.controls.filename.value == '') { return false; }
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
          this.close();
        }
      }
    );
  }

  close(): void {
    this._close$.emit();
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
    this._progressModal = this._dialog.open(GuiProgressComponent, { data: this._uploadService.progress });
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

  updateUsersToAdd(container: UserContainer, selections: Map<number, User>) {
    let identifiers: number[] = [];
    selections.forEach((user: User, id: number) => {
      identifiers.push(id);
    });
    container.usersToAdd = identifiers;
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
   * @override
   */
  protected _buildForm(): FormGroup {
    return new FormGroup({
      filename: new FormControl({ value: '', disabled: true }, Validators.compose([
        Validators.required
      ]))
    });
  }
}

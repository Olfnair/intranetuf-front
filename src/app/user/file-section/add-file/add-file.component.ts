/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MdDialogRef, MdDialog } from "@angular/material";
import { Subscription } from "rxjs/Subscription";
import { FileUploadService } from "app/services/file-upload.service";
import { ModalService } from 'app/gui/modal.service';
import { RestApiService } from "app/services/rest-api.service";
import { EXTENSIONS, MAXFILESIZE } from 'configuration/upload';
import { CustomValidators } from 'app/shared/custom-validators';
import { GuiForm } from "app/gui/gui-form";
import { GuiProgressComponent } from "app/gui/gui-progress";
import { UserContainer } from "./user-container";
import { File as FileEntity } from "entities/file";
import { Project } from "entities/project";
import { Right } from "entities/project-right";
import { User } from "entities/user";
import { Version } from "entities/version";
import { WorkflowCheck, CheckType } from "entities/workflow-check";

/**
 * Données d'input du composant d'ajout de fichier
 */
class InputData {
  
  /** le projet concerné par l'ajout */
  project: Project = undefined;
  
  /** le fichier concerné par l'ajout */
  file: FileEntity = undefined;

  /** @constructor */
  constructor() { };
}

/**
 * Composant d'ajout de fichier (ou nouvelle version)
 */
@Component({
  selector: 'app-add-file',
  templateUrl: './add-file.component.html',
  styleUrls: ['./add-file.component.css']
})
export class AddFileComponent extends GuiForm {

  /** Liste des extensions autorisées */
  private _allowedExtensions: string = EXTENSIONS;
  
  /** fichier à uploader */
  private _uploadFile: File = undefined;
  
  /** projet auquel on aoute un fichier (ou nouvelle version) */
  private _project: Project = new Project();
  
  /** fichier */
  private _file: FileEntity = new FileEntity();
  
  /** nouvelle version ? */
  private _newVersionMode: boolean = false;
  
  /** modale de progression de l'upload */
  private _progressModal: MdDialogRef<GuiProgressComponent> = undefined;
  
  /** progression de l'upload (en  %) */
  private _uploadProgress: number = 0;
  
  /** l'upload a été interrompu ? */
  private _aborted: boolean = false;

  /** conteneurs d'utilisateurs (un pour les contrôleurs, un autre pour les valideurs) */
  private _userContainers: UserContainer[] = [];

  /** @event - fermeture du composant */
  private _close$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @constructor
   * @param {FileUploadService} _uploadService - service d'upload utilisé
   * @param {RestApiService} _restService - service REST utilisé
   * @param {MdDialog} _dialog - service de gestion des modales
   */
  constructor(
    private _uploadService: FileUploadService,
    private _restService: RestApiService,
    private _modal: ModalService,
    private _dialog: MdDialog
  ) {
    super();
  }

  /**
   * Initialisation du composant
   */
  init(): void {
    this._userContainers = [];
    this._userContainers.push(new UserContainer('Contrôleurs', CheckType.CONTROL, this._project, Right.CONTROLFILE, this._restService));
    this._userContainers.push(new UserContainer('Valideurs', CheckType.VALIDATION, this._project, Right.VALIDATEFILE, this._restService));
  }

  /**
   * Chargement des contrôleurs actuels du fichier (pour le mode nouvelle version)
   */
  loadCurrentControllers(): void {
    let sub: Subscription = this._restService.fetchWorkflowChecksForFile(this._file.id).finally(() => {
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

  /** @property {inputData} data - données du composant */
  @Input()
  set data(inputData: InputData) {
    this._project = inputData.project;
    this._newVersionMode = (inputData.file != undefined);
    this.init();
    if(this._newVersionMode) {
      this._file = inputData.file;
      this.loadCurrentControllers();
    }
  }

  /** @property {string} filename - nom du fichier à uploader */
  get filename(): string {
    return this._file && this._uploadFile.name || '';
  }

  get fileTooBig(): boolean {
    return this._uploadFile && this._uploadFile.size > MAXFILESIZE;
  }

  /** @property {string} allowedExtensions - extensions de fichier autorisées pour le téléchargement */
  get allowedExtensions(): string {
    return this._allowedExtensions;
  }

  /**
   * @property {boolean} newVersionMode - indique si on est dans le mode d'ajout de fichier (false)
   *                                      ou de nouvelle version (true)
   */
  get newVersionMode(): boolean {
    return this._newVersionMode;
  }

  /** @property {UserContainer[]} userContainers - containers pour les contrôleurs/valideurs */
  get userContainers(): UserContainer[] {
    return this._userContainers;
  }

  /**
   * @event close - fermeture du composant
   * @returns {EventEmitter<void>}
   */
  @Output('close')
  get close$(): EventEmitter<void> {
    return this._close$;
  }

  /**
   * Sélection du fichier file
   * @param {File} file - le fichier sélectionné 
   */
  fileSelect(file: File): void {
    this._uploadFile = file;
    this.form.controls.filename.setValue(this._uploadFile.name);
    this.form.controls.filename.markAsTouched();
  }

  /** @property {boolean} isValidForm - indique si le formulaire est valide */
  get isValidForm(): boolean {
    /*// On vérifie le form à la main : le champ 'filename' est désactivé pour qu'on ne puisse pas l'éditer.
    // Malheureusement, un champ désactivé est considéré invalide par défaut...
    // On doit donc vérifier les champs un par un et faire un test particulier pour le champ 'filename'
    if(this.form.controls.filename.value == '') { return false; }*/
    if(! this.form.valid) { return false; }
    if(! this._newVersionMode) {
      for(let container of this._userContainers) {
        if(container.size < 1) { return false; }
      }
    }
    return true;
  }

  /**
   * Enregistre le fichier et les contrôleurs et valideurs spécifiés
   */
  submit(): void {
    // Prépare une nouvelle entité version :
    let entityType: string;
    let entity: any;
    let version: Version = new Version();
    version.filename = this.filename;
    version.workflowChecks = [];
    
    // Ajout des contrôleurs et valideurs de cette version :
    this._userContainers.forEach((container: UserContainer) => {
      container.addAsChecksToVersionAndProject(version, this._project);
    });

    if (this._newVersionMode) {   // Mode nouvelle version :
      version.file = this._file;
      entityType = 'version';
      entity = version;
    }
    else {                        // Mode nouveau fichier :
      this._file.version = version;
      this._file.project = this._project;
      entityType = 'file';
      entity = this._file;
    }

    // Début de l'upload :
    this._aborted = false;
    this._uploadProgress = 0;
    this.openProgressModal(); // modale de progression
    let uploadSub: Subscription = this._uploadService.upload(this._uploadFile, entityType, entity).subscribe(
      (res: void) => {    // OK :
      },
      (error: number) => {   // Erreur :
        if (! this._aborted) {
          this.closeProgressModal();
          switch(error) {
            case 406:
              this._modal.info('Erreur', 'Ce format de fichier n\'est pas pris en charge !', false);
              break;
            case 413:
              this._modal.info('Erreur', 'Fichier trop volumineux !', false);
              break;
            default:
              this._modal.info('Erreur', 'Erreur pendant l\'upload du fichier.', false);
              break;
          }
        }
      },
      () => {             // Finally :
        uploadSub.unsubscribe();
        if (! this._aborted) {
          this.closeProgressModal();
          this.close();
        }
      }
    );
  }

  /**
   * Fermeture du composant
   * @emits close - event de fermeture du composant
   */
  close(): void {
    this._close$.emit();
  }

  /**
   * Ouvre une fenêtre modale de progression du téléchargement
   */
  openProgressModal(): void {
    // souscription à la progression de l'upload :
    let uploadSub: Subscription = this._uploadService.progress.subscribe(
      (uploadProgress: number) => { // Data :
        this._uploadProgress = uploadProgress; // met à jour la progression
      },
      (error: any) => {             // Erreur :
        // gérer erreur ?
        uploadSub.unsubscribe();
      },
      () => {                       // finally
        uploadSub.unsubscribe(); // libère les ressources
      }
    );
    
    // modale de progression : on lui passe une reference sur la progression
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
        progressModalSub.unsubscribe();
      },
      () => {
        progressModalSub.unsubscribe();
        this._progressModal = undefined;
      }
    );
  }

  /**
   * Fermeture de la modale de progression
   */
  closeProgressModal(): void {
    if (this._progressModal) {
      this._progressModal.close(this._uploadProgress);
    }
  }

  /**
   * Met à jour la liste des utilisateurs qu'on va ajouter (choisir) au container
   * @param {UserContainer} container - container affecté
   * @param {Map<number, User>} selections - map des users sélectionnés dans la datatable
   */
  updateUsersToAdd(container: UserContainer, selections: Map<number, User>) {
    let identifiers: number[] = [];
    selections.forEach((user: User, id: number) => {
      identifiers.push(id);
    });
    container.usersToAdd = identifiers;
  }

  /**
   * Change le mode d'affichage du container (utilisateurs choisis/ajout)
   * @param container 
   */
  switchContainerMode(container: UserContainer): void {
    container.switchMode();
    container.resetUsersToAdd();
  }

  /**
   * Ajoute les utilisateurs qu'on a sélectionné dans la liste d'ajout
   * @param {UserContainer} container - container affecté 
   */
  addContainerUsers(container: UserContainer): void {
    container.processUsersToAdd();
    this.switchContainerMode(container);
  }

  /**
   * Construit le formulaire
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      filename: new FormControl(''/*{ value: '', disabled: true }*/, Validators.compose([
        Validators.required, CustomValidators.fileExtension
      ]))
    });
  }

}

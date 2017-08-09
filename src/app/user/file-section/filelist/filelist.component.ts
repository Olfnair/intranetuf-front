import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import 'rxjs/Rx';
import { environment } from "environments/environment";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { DatatableContentManager } from "app/gui/datatable";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { RightsChecker, DefaultRightsChecker } from "app/services/rights-checker";
import { RoleCheckerService, RoleChecker, DefaultRoleChecker } from "app/services/role-checker";
import { Base64 } from "app/shared/base64";
import { File } from "entities/file";
import { Project } from "entities/project";
import { WorkflowCheck, Status, CheckType } from "entities/workflow-check";
import { Status as VersionStatus, Version } from "entities/version";

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent extends DatatableContentManager<File, RestApiService> {
  private _startLoading: boolean = false;

  private _firstLoading: boolean = true; // tout premier chargement (pas encore eu de rechargement suite à recherche/tri...)

  private _project: Project = undefined;
  
  private _controls: Map<number, WorkflowCheck> = undefined;
  private _validations: Map<number, WorkflowCheck> = undefined;
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  private _rightsChecker: RightsChecker = new DefaultRightsChecker(this._restService);

  // charger les roles à chaque changement de projet et mettre à jour le service de check de role
  private _roleCheckerUpdater: RoleChecker = new DefaultRoleChecker(this._restService, this._roleCheckerService);

  private _addFile$: EventEmitter<File> = new EventEmitter<File>();
  private _versionDetails$: EventEmitter<File> = new EventEmitter<File>();
  private _checkVersion$: EventEmitter<WorkflowCheck> = new EventEmitter<WorkflowCheck>();
  
  constructor(
    restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _modal: ModalService
  ) {
    super(restService, 'fetchFilesByProject', true, () => {
      this.loadChecks();
      this.reload = false;
    });
  }

  private _resetFileList(): void {
    this.reset(true);
    // rechargement des droits du projet
    if(this._project) {
      this._roleCheckerUpdater.loadRole();
      this._rightsChecker.loadRights(this._project.id);
    }
  }

  private resetChecksMap(): void {
    this._controls = new Map<number, WorkflowCheck>();
    this._validations = new Map<number, WorkflowCheck>();
  }

  private getChecksMapFromType(type: CheckType): Map<number, WorkflowCheck> {
    if(type == CheckType.CONTROL) {
      return this._controls;
    }
    else if(type == CheckType.VALIDATION) {
      return this._validations;
    }
    return null;
  }

  private loadChecks(): void {
    if(! this.paginator.content || this.paginator.content.length <= 0) { return; }

    let sub: Subscription = this._restService.fetchWorkflowCheckByStatusUserVersions(
      Status.TO_CHECK, this._session.userId, this.paginator.content
    ).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        this.resetChecksMap();
        checks.forEach((check: WorkflowCheck) => { 
          let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(check.type);
          if(map) {
            map.set(check.version.id, check);
          }
        });
      },
      (error: Response) => {
        // gestion d'erreur
      }
    );
  }

  @Input() set startLoading(startLoading: boolean) {
    let old: boolean = this._startLoading;
    this._startLoading = startLoading;
    if(this._project != undefined && ! old && this._startLoading) {
      this.load([this._project]);
    }
  }

  @Input() set project(project: Project) {
    if(project) {
      this._project = project;
      this._resetFileList();
      if(this._project != undefined && this._startLoading) {
        this.load([this._project]);
      }
    }
  }

  get project(): Project {
    return this._project;
  }

  get userId(): number {
    return this._session.userId;
  }

  @Output('addFile') get addFile$(): EventEmitter<File> {
    return this._addFile$;
  }

  @Output('versionDetails') get versionDetails$(): EventEmitter<File> {
    return this._versionDetails$;
  }

  @Output('checkVersion') get checkVersion$(): EventEmitter<WorkflowCheck> {
    return this._checkVersion$;
  }

  userCanAddFile(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanAddFiles();
  }

  userCanDeleteFile(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanDeleteFiles();
  }

  userCanEditProject(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanEditProject();
  }

  userCanDeleteProject(): boolean {
    return this._project.active
        && (this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanDeleteProject());
  }

  userCanActivateProject(): boolean {
    return ! this._project.active && this._roleCheckerService.userIsAdmin();
  }

  canDownload(file: File): boolean {
    return file.version.status == VersionStatus.VALIDATED
        || file.author.id == this._session.userId
        || this.hasControl(file.version.id)
        || this.hasValidation(file.version.id)
        || this._roleCheckerService.userIsAdmin();
  }

  addFile(file: File): void {
    this._addFile$.emit(file);
  }

  versionDetails(file: File): void {
    this._versionDetails$.emit(file);
  }

  checkVersion(check: WorkflowCheck): void {
    return this._checkVersion$.emit(check);
  }

  downloadLink(versionId: number): string {
    return this._url + versionId;
  }

  getToken(): string {
    return this._session.base64AuthToken;
  }

  private getCheckAsParameter(type: CheckType, versionId: number): WorkflowCheck {
    let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(type);
    if(! map) { return null; }
    let check: WorkflowCheck = map.get(versionId);
    if(! check) { return null; }
    return check;
  }

  getControl(versionId: number): WorkflowCheck {
    return this.getCheckAsParameter(CheckType.CONTROL, versionId);
  }

  getValidation(versionId: number): WorkflowCheck {
    return this.getCheckAsParameter(CheckType.VALIDATION, versionId);
  }

  private hasCheck(type: CheckType, versionId: number): boolean {
    let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(type);
    if(! map) { return false; }
    return map.has(versionId);
  }

  hasControl(versionId: number): boolean {
    return this.hasCheck(CheckType.CONTROL, versionId);
  }

  hasValidation(versionId: number): boolean {
    return ! this.hasControl(versionId) && this.hasCheck(CheckType.VALIDATION, versionId);
  }

  deleteFile(file: File): void {
    let sub : Subscription = this._restService.deleteFile(file).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (status: number) => {
        this.load([this._project]);
      },
      (error: Response) => {
        this._modal.info('Erreur', 'Erreur lors de la tentative de suppression du fichier', false);
      }
    );
  }

  editProject(): void {
    let sub : Subscription = this._modal.popup(ChoseProjectNameComponent, {
      title: "Nom du projet",
      errorText: "Veuillez choisir un nom de projet",
      submitText: "Changer le nom",
      cancelText: "Annuler"
    }).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (projectName: string) => {
        if(! projectName) {
          return;
        }
        let project: Project = new Project();
        project.id = this._project.id;
        project.name = projectName;
        let restSub: Subscription = this._restService.editProject(project).finally(() => {
          restSub.unsubscribe();
        }).subscribe(
          (res: Response) => {
            this._session.updateProjectList = true;
            this._project.name = projectName;
          },
          (error: Response) => {
            this._modal.info('Erreur', 'Erreur lors du changement de nom du projet.', false);
          }
        );
      },
      (error: any) => {
        // gestion d'erreur
      }
    );
  }

  activateProject(activate: boolean): void {
    let obs: Observable<Response>;
    let project: Project = new Project();
    project.id = this._project.id;
    project.active = activate;
    obs = activate ? this._restService.editProject(project) : this._restService.deleteProject(project);
    let sub: Subscription = obs.finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: Response) => {
        this._session.updateProjectList = true;
        this._project.active = activate;
        if(! activate && ! this._roleCheckerService.userIsAdmin()) {
          this._project = undefined;
          this._session.selectedProject = undefined;
        }
        if(activate) {
          this._modal.info('Projet Restauré', 'Le projet a été restauré.', true);
        }
        else {
          this._modal.info('Projet Supprimé', 'Le projet a été supprimé.', true);
        }
      },
      (error: Response) => {
        if(activate) {
          this._modal.info('Erreur', 'Erreur lors de la tentative de restauration du projet.', false);
        }
        else {
          this._modal.info('Erreur', 'Erreur lors de la tentative de suppression du projet', false);
        }
      }
    );
  }
}

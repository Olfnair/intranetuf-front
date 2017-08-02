import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import 'rxjs/Rx';
import { environment } from "environments/environment";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { FlexQueryResult } from "objects/flex-query-result";
import { DatatableContentManager } from "app/gui/datatable";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { RightsChecker, DefaultRightsChecker } from "app/services/rights-checker";
import { BasicRoleChecker, RoleCheckerService, RoleChecker, DefaultRoleChecker } from "app/services/role-checker";
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
export class FilelistComponent extends DatatableContentManager<File> {
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

  // charge les roles à chaque changement de projet et met à jour le service de check de role
  private _roleCheckerUpdater: RoleChecker = new DefaultRoleChecker(this._restService, this._roleCheckerService);
  
  constructor(
    restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _router: Router,
    private _modal: ModalService
  ) {
    super(restService, 'fetchFilesByProject', true, () => {
      this._loadChecks();
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

  private _resetChecksMap(): void {
    this._controls = new Map<number, WorkflowCheck>();
    this._validations = new Map<number, WorkflowCheck>();
  }

  private _getChecksMapFromType(type: CheckType): Map<number, WorkflowCheck> {
    if(type == CheckType.CONTROL) {
      return this._controls;
    }
    else if(type == CheckType.VALIDATION) {
      return this._validations;
    }
    return null;
  }

  private _loadChecks(): void {
    if(! this.paginator.content || this.paginator.content.length <= 0) { return; }

    let sub: Subscription = this._restService.fetchWorkflowCheckByStatusUserVersions(
      Status.TO_CHECK, this._session.userId, this.paginator.content
    ).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        this._resetChecksMap();
        checks.forEach((check: WorkflowCheck) => { 
          let map: Map<number, WorkflowCheck> = this._getChecksMapFromType(check.type);
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

  add(): void {
    this._router.navigate(['/add_file', this._project.id]);
  }

  downloadLink(versionId: number): string {
    return this._url + versionId;
  }

  getToken(): string {
    return this._session.base64AuthToken;
  }

  base64UrlEncode(file: File): string {
    return Base64.urlEncode(JSON.stringify(file));
  }

  private _getCheckAsParameter(type: CheckType, versionId: number): string {
    let map: Map<number, WorkflowCheck> = this._getChecksMapFromType(type);
    if(! map) { return ''; }
    let check: WorkflowCheck = map.get(versionId);
    if(! check) { return ''; }
    return Base64.urlEncode(JSON.stringify(check));
  }

  getControlAsParameter(versionId: number): string {
    return this._getCheckAsParameter(CheckType.CONTROL, versionId);
  }

  getValidationAsParameter(versionId: number): string {
    return this._getCheckAsParameter(CheckType.VALIDATION, versionId);
  }

  private _hasCheck(type: CheckType, versionId: number): boolean {
    let map: Map<number, WorkflowCheck> = this._getChecksMapFromType(type);
    if(! map) { return false; }
    return map.has(versionId);
  }

  hasControl(versionId: number): boolean {
    return this._hasCheck(CheckType.CONTROL, versionId);
  }

  hasValidation(versionId: number): boolean {
    return ! this.hasControl(versionId) && this._hasCheck(CheckType.VALIDATION, versionId);
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
            this._modal.info('Erreur', 'Erreur lors du changment de nom du projet.', false);
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

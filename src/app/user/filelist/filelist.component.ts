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
import { DatatableQueryParams, DatatablePaginator } from "app/gui/datatable";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { RightsChecker } from "app/services/rights-checker";
import { RoleChecker, DefaultRoleChecker } from "app/services/role-checker";
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
export class FilelistComponent {
  private static readonly PAGE_SIZE = 2; // nombre d'éléments par page

  private _startLoading: boolean = false;

  private _firstLoading: boolean = true; // tout premier chargement (pas encore eu de rechargement suite à recherche/tri...)

  private _project: Project = undefined;
  private _filesPaginator: DatatablePaginator<File> = new DatatablePaginator<File>(FilelistComponent.PAGE_SIZE);
  private _filesObs: Observable<DatatablePaginator<File>> = undefined;
  
  private _controls: Map<number, WorkflowCheck> = undefined;
  private _validations: Map<number, WorkflowCheck> = undefined;
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  private _params: DatatableQueryParams = undefined;

  private _rightsChecker: RightsChecker = new RightsChecker(this._session);
  private _roleChecker: RoleChecker = new DefaultRoleChecker(this._session);
  
  constructor(
    private _session: SessionService,
    private _restService: RestApiService,
    private _router: Router,
    private _modal: ModalService
  ) {
    this._initFileList();
  }

  private _initFileList(): void {
    this._filesPaginator.goToIndex(0, [], 0);
    this._firstLoading = true;
    this._params = undefined;
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
    if(! this._filesPaginator.content || this._filesPaginator.content.length <= 0) { return; }

    let sub: Subscription = this._restService.fetchWorkflowCheckByStatusUserVersions(
      Status.TO_CHECK, this._session.userId, this._filesPaginator.content
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

  private _loadFiles(): void {
    console.log('_loadFiles()');
    // teste s'il faut vraiment charger quelque chose
    if(! this._project || ! this._startLoading) { return; }

    this._filesObs = this._filesPaginator.update(this._restService, 'fetchFilesByProject', this._params, [this._project], this._firstLoading, () => {
      this._loadChecks();
      this._firstLoading = false;
    });
  }

  @Input() set startLoading(startLoading: boolean) {
    let old: boolean = this._startLoading;
    this._startLoading = startLoading;
    if(! old && this._startLoading) {
      this._loadFiles();
    }
  }

  @Input() set project(project: Project) {
    if(project) {
      console.log('setproject');
      this._project = project;
      this._initFileList();
      this._loadFiles();
    }
  }

  get project(): Project {
    return this._project;
  }

  get filesObs(): Observable<DatatablePaginator<File>> {
    return this._filesObs;
  }

  get userId(): number {
    return this._session.userId;
  }

  userCanAddFile(): boolean {
    return this._roleChecker.userIsAdmin() || this._rightsChecker.userCanAddFiles();
  }

  userCanDeleteFile(): boolean {
    return this._roleChecker.userIsAdmin() || this._rightsChecker.userCanDeleteFiles();
  }

  userCanEditProject(): boolean {
    return this._roleChecker.userIsAdmin() || this._rightsChecker.userCanEditProject();
  }

  userCanDeleteProject(): boolean {
    return this._project.active && (this._roleChecker.userIsAdmin() || this._rightsChecker.userCanDeleteProject());
  }

  userCanActivateProject(): boolean {
    return ! this._project.active && this._roleChecker.userIsAdmin();
  }

  canDownload(file: File): boolean {
    return file.version.status == VersionStatus.VALIDATED
        || file.author.id == this._session.userId
        || this.hasControl(file.version.id)
        || this.hasValidation(file.version.id)
        || this._roleChecker.userIsAdmin();
  }

  add(): void {
    this._router.navigate(['/add_file', this._project.id]);
  }

  paramsChange(params: DatatableQueryParams): void {
    this._params = params;
    this._loadFiles();
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
        this._loadFiles();
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
        if(! activate && ! this._roleChecker.userIsAdmin()) {
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

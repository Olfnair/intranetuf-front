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
import { RightsChecker } from "app/shared/rights-checker";
import { DefaultRoleChecker } from "app/shared/role-checker";
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
  private _startLoading: boolean = true;

  private _project: Project = undefined;
  private _files : File[] = undefined;
  private _filesObs: Observable<File[]> = undefined;
  private _controls: Map<number, WorkflowCheck> = undefined;
  private _validations: Map<number, WorkflowCheck> = undefined;
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  private _rightsChecker: RightsChecker;
  private _roleChecker: DefaultRoleChecker; 

  constructor(
    private _session: SessionService,
    private _restService: RestApiService,
    private _router: Router
  ) {
    this._rightsChecker = new RightsChecker(this._session);
    this._roleChecker = new DefaultRoleChecker(this._session);
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
    if(! this._files) { return; }

    let sub: Subscription = this._restService.fetchWorkflowCheckByStatusUserVersions(
      Status.TO_CHECK, this._session.userId, this._files
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

  private _setFiles(files: File[], fileObs: Observable<File[]>): void {
    this._files = files;
    this._filesObs = fileObs;
  }

  private _loadFiles(): void {
    // teste s'il faut vraiment charger quelque chose
    if(! this._project || ! this._startLoading) { return; }

    this._setFiles(undefined, undefined);
    let sub: Subscription = this._restService.fetchFilesByProject(this._project).finally(() => {
      sub.unsubscribe(); // finally
    }).subscribe(
      (files: File[]) => { // data
        this._setFiles(files, Observable.create((observer: Observer<File[]>) => {
          observer.next(this._files);
          observer.complete();
        }));
        this._loadChecks();
      },
      (error: Response) => { // erreur
        this._setFiles(this._files, Observable.create((observer: Observer<File[]>) => {
          observer.error(error);
        }));
      },
    );
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
      this._project = project;
      this._loadFiles();
    }
  }

  get project(): Project {
    return this._project;
  }

  get filesObs(): Observable<File[]> {
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
    return this._roleChecker.userIsAdmin() || this._rightsChecker.userCanDeleteProject();
  }

  canDownload(file: File): boolean {
    return file.version.status == VersionStatus.VALIDATED || file.author.id == this._session.userId
           || this.hasControl(file.version.id) || this.hasValidation(file.version.id);
  }

  add(): void {
    this._router.navigate(['/add_file', this._project.id]);
  }

  downloadLink(versionId: number): string {
    return this._url + versionId + '?token="' + encodeURIComponent(JSON.stringify(this._session.authToken)) + '"';
  }

  encodeURIFile(file: File): string {
    return encodeURIComponent(JSON.stringify(file));
  }

  private _getCheckAsParameter(type: CheckType, versionId: number): string {
    let map: Map<number, WorkflowCheck> = this._getChecksMapFromType(type);
    if(! map) { return ''; }
    let check: WorkflowCheck = map.get(versionId);
    if(! check) { return ''; }
    return encodeURIComponent(JSON.stringify(check));
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

      }
    );
  }

}

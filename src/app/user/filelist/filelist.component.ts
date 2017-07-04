import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import 'rxjs/Rx';
import { environment } from "environments/environment";
import { RestApiService } from "app/shared/_services/rest-api.service";
import { SessionService } from "app/shared/_services/session.service";
import { File } from "app/entities/file";
import { Project } from "app/entities/project";

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit {
  private _startLoading: boolean = true;

  private _project: Project = undefined;
  private _files : File[] = undefined;
  private _filesObs: Observable<File[]> = undefined;
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  constructor(
    private _session: SessionService,
    private _restService: RestApiService,
    private _router: Router
  ) { }

  ngOnInit() {
  }

  private setFiles(files: File[], fileObs: Observable<File[]>): void {
    this._files = files;
    this._filesObs = fileObs;
  }

  private reloadFiles(): void {
    
    // teste s'il faut vraiment charger quelque chose
    if(! this._project || ! this._startLoading) { return; }

    this.setFiles(undefined, undefined);
    let sub = this._restService.fetchFilesByProject(this._project).finally(() => {
      sub.unsubscribe(); // finally
    }).subscribe(
      (files: File[]) => { // data
        this.setFiles(files, Observable.create((observer: Observer<File[]>) => {
          observer.next(this._files);
          observer.complete();
        }));
      },
      (error: Response) => { // erreur
        this.setFiles(this._files, Observable.create((observer: Observer<File[]>) => {
          observer.error(error);
        }));
      },
    );
  }

  @Input() set startLoading(startLoading: boolean) {
    let old: boolean = this._startLoading;
    this._startLoading = startLoading;
    if(! old && this._startLoading) {
      this.reloadFiles();
    }
  }

  @Input() set project(project: Project) {
    if(project) {
      this._project = project;
      this.reloadFiles();
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

  add(): void {
    this._router.navigate(['/add_file', this._project.id]);
  }

  downloadLink(versionId: number): string {
    return this._url + versionId + '?token="' + encodeURIComponent(JSON.stringify(this._session.authToken)) + '"';
  }

}

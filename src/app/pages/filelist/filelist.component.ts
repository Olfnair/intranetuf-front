import { Component, OnInit, Input } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { Project } from "app/entities/project";
import { File } from "app/entities/file";
import { Router } from "@angular/router";
import { TruncatePipe } from "app/shared/truncate.pipe";
import { NumberLenPipe } from "app/shared/number-len.pipe";
import { Response } from "@angular/http";
import { SessionService } from "app/shared/session.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit {
  private _fileSubscription: Subscription = undefined;
  private _project: Project = undefined;
  private _files: File[] = [];
  private _url = environment.backend.protocol + "://"
              + environment.backend.host + ":"
              + environment.backend.port
              + environment.backend.endpoints.download;

  constructor(private _session: SessionService, private _restService: RestApiService, private _router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if(this._fileSubscription) {
      this._fileSubscription.unsubscribe();
    }
  }

  @Input() set project(project: Project) {
    this._project = project;
    if(this._fileSubscription) {
      this._fileSubscription.unsubscribe();
    }
    if (this._project) {
      this._fileSubscription = this._restService.fetchFilesByProject(this._project).subscribe((files: any[]) => this._files = files);
    }
  }

  get project(): Project {
    return this._project;
  }

  get files(): File[] {
    return this._files;
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

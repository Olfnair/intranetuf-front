import { Component, OnInit, NgZone, Input, EventEmitter, Output } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { RequestOptions, Http, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { FileUploadService } from "app/shared/file-upload.service";
import { AddProjectComponent } from "app/pages/projectlist/add-project/add-project.component";
import { MdDialog, MdDialogRef } from "@angular/material";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Project } from "app/entities/project";

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent implements OnInit {

  private _projects: Project[];
  private _progress: number = -1;
  private _select$: EventEmitter<Project>;
  private _opened: boolean = false;
  private _dialogRef: MdDialogRef<AddProjectComponent> = undefined;
  
  // ref sur le projet sélectionné
  private _selectedProject: Project = undefined;
  
  constructor(private _restService: RestApiService,
      private _http: Http,
      private _dialog: MdDialog,
      private _uploadService: FileUploadService,
      private _zone: NgZone) {
    this._select$ = new EventEmitter();
    this._projects = [];
    /*this._uploadService.progress$.subscribe(data => {
      this._zone.run(() => {
          console.log('progress = '+data);
          this._progress = data;
        });
      });*/
  }

  ngOnInit() {
    this._restService.fetchProjects().subscribe((projects: any[]) => this._projects = projects);
  }

  get projects(): Project[] {
    return this._projects;
  }

  get progress(): number {
    return this._progress;
  }

  @Input() set selected(project: Project) {
    this._selectedProject = project;
  }

  get selected(): Project {
    return this._selectedProject;
  }

  get opened(): boolean {
    return this._opened;
  }

  isSelected(project: Project): boolean {
    return this._selectedProject && this._selectedProject.id == project.id;
  }

  toggle(): void {
    this._opened = ! this._opened;
  }

  add(): void {
    this._dialogRef = this._dialog.open(AddProjectComponent, {data: this});
    this._dialogRef.afterClosed().subscribe(projectName => {
      if(projectName) {
        this._restService.createProject(projectName).subscribe(
          (project: Project) => {
            this._restService.fetchProjects().subscribe((projects: Project[]) => this._projects = projects);
            this.select(project);
          },
          err => console.log(err)
        );
      }
      this._dialogRef = undefined;
    });
  }

  closeAddDlg(projectName: string): void {
    if(this._dialogRef) {
      this._dialogRef.close(projectName);
    }
  }

  @Output ('select') get select$(): EventEmitter<Project> {
    return this._select$;
  }

  select(project: Project): void {
    this._selectedProject = project;
    this._select$.emit(this._selectedProject);
  }

  /*fileChange(event): void {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
      let file: File = fileList[0];
      let formData:FormData = new FormData();
      formData.append('file', file, file.name);
      let headers = new Headers();
      //headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({headers: headers});
      this._http.post('https://localhost:8443/IUF/rest/upload', formData, options)
          .map(res => res.json())
          .catch(error => Observable.throw(error))
          .subscribe(
            data => console.log('success'),
            error => console.log(error)
          )
    }
  }*/

  /*onChange(event): void {
    console.log('onChange');
    let fileList: FileList = event.target.files;
    if(fileList.length <= 0) {
      return;
    }
    this._progress = 0;
    let file: File = fileList[0];
    console.log(file);
    this._uploadService.upload([], file)
                       .finally(() => console.log('sent'))
                       .subscribe(
                         //() => console.log('sent ok'), // marche pas ???
                         error => console.log(error)
                       )
  }*/
}

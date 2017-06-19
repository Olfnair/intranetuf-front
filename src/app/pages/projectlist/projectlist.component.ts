import { Component, OnInit, NgZone, Input, EventEmitter, Output } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { RequestOptions, Http, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { FileUploadService } from "app/shared/file-upload.service";
import { AddProjectComponent } from "app/pages/projectlist/add-project/add-project.component";
import { MdDialog, MdDialogRef } from "@angular/material";
import { Project } from "app/entities/project";
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent implements OnInit {

  private _projectSubsciption: Subscription;
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
  }

  ngOnInit() {
    this._projectSubsciption = this._restService.fetchProjects().subscribe((projects: any[]) => this._projects = projects);
  }

  ngOnDestroy() {
    this._projectSubsciption.unsubscribe();
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
    this._opened = !this._opened;
  }

  add(): void {
    this._dialogRef = this._dialog.open(AddProjectComponent, { data: this });
    let addProjectDlgSub: Subscription = this._dialogRef.afterClosed()
      .finally(() => {
        addProjectDlgSub.unsubscribe();
        this._dialogRef = undefined;
      })
      .subscribe(projectName => {
        if (projectName) {
          let createProjectSub: Subscription = this._restService.createProject(projectName)
            .finally(() => createProjectSub.unsubscribe())
            .subscribe(
            (project: Project) => {
              if(this._projectSubsciption) {
                this._projectSubsciption.unsubscribe();
              }
              this._projectSubsciption = this._restService.fetchProjects().subscribe((projects: Project[]) => this._projects = projects);
              this.select(project);
            },
            err => console.log(err)
            );
        }
      });
  }

  closeAddDlg(projectName: string): void {
    if (this._dialogRef) {
      this._dialogRef.close(projectName);
    }
  }

  @Output('select') get select$(): EventEmitter<Project> {
    return this._select$;
  }

  select(project: Project): void {
    this._selectedProject = project;
    this._select$.emit(this._selectedProject);
  }
  
}

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { AddProjectComponent } from "app/pages/projectlist/add-project/add-project.component";
import { MdDialog, MdDialogRef } from "@angular/material";
import { Project } from "app/entities/project";
import { Subscription } from "rxjs/Subscription";
import { NavListSelection, NavList } from "app/shared/nav-list/nav-list.component";
import { SessionService } from "app/shared/session.service";

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends NavList implements OnInit {

  private _projectSubsciption: Subscription;
  private _projects: Project[] = [];
  private _progress: number = -1;
  private _dialogRef: MdDialogRef<AddProjectComponent> = undefined;

  // ref sur le projet sélectionné
  private _selectedProject: Project = undefined;

  constructor(private _restService: RestApiService, private _session: SessionService, private _dialog: MdDialog) {
    super();
  }

  ngOnInit() {
    this._loadProjects();
  }

  private _loadProjects(): void {
    let sub: Subscription = this._projectSubsciption = this._restService.fetchProjects().subscribe(
      (projects: Project[]) => {
        this._projects = projects;
        for(let i = 0; i < this._projects.length; ++i) {
          this.selectables.push(new NavListSelection(i, this._projects[i].name));
        }
        this.selectedProject = this._selectedProject; // tordu mais nécessaire (on appelle la propriété qui fait des trucs en plus)
      },
      (error: Response) => {
        // gestion erreur ?
      },
      () => {
        sub.unsubscribe();
      }
    );
  }

  get projects(): Project[] {
    return this._projects;
  }

  get progress(): number {
    return this._progress;
  }

  @Input() set selectedProject(project: Project) {
    this._selectedProject = project;
    let i: number;
    let found: boolean = false;
    for(i = 0; project && i < this._projects.length && ! found; ++i) {
      found = (this._projects[i].id === project.id);
    }
    this.selected = found ? this.selectables[i] : undefined;
  }

  get selectedProject(): Project {
    return this._selectedProject;
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
              this._selectedProject = project;
              this._loadProjects();
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

  select(selection: NavListSelection) {
    this._selectedProject = this._projects[selection.id];
    this._session.selectedProject = this._selectedProject;
  }
  
}

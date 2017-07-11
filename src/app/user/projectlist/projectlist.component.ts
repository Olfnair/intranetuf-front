import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { AddProjectComponent } from "app/user/projectlist/add-project/add-project.component";
import { NavList, NavListSelection } from "app/gui/nav-list";
import { DefaultRoleChecker } from "app/shared/role-checker";
import { Project } from "entities/project";

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends NavList implements OnInit {

  private _projects: Project[] = [];
  private _progress: number = -1;

  // ref sur le projet sélectionné
  private _selectedProject: Project = undefined;

  private _roleChecker: DefaultRoleChecker;

  constructor(
    private _restService: RestApiService,
    private _session: SessionService,
    private _modal: ModalService
  ) {
    super();
    this._roleChecker = new DefaultRoleChecker(this._session);
  }

  ngOnInit() {
    this._loadProjects();
  }

  get roleChecker(): DefaultRoleChecker {
    return this._roleChecker;
  }

  private _loadProjects(): void {
    let sub: Subscription = this._restService.fetchProjects().finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (projects: Project[]) => {
        this.selectables = [];
        this._projects = projects;
        for(let i = 0; i < this._projects.length; ++i) {
          this.selectables.push(new NavListSelection(i, this._projects[i].name));
        }
        this.selectedProject = this._selectedProject; // tordu mais nécessaire (on appelle la propriété qui fait des trucs en plus)
      },
      (error: Response) => {
        this.error = "Une erreur s'est produite pendant le chargement de la liste des projets.";
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
    this.selected = found ? this.selectables[i - 1] : undefined;
    this._session.selectedProject = this._selectedProject;
  }

  get selectedProject(): Project {
    return this._selectedProject;
  }

  @Input() set update(update: boolean) {
    if(update) {
      this._loadProjects();
      this._session.updateProjectList = false;
    }
  }

  add(): void {
    let sub : Subscription = this._modal.popup(AddProjectComponent).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (projectName: string) => {
        if(projectName) {
          let createProjectSub: Subscription = this._restService.createProject(projectName).finally(() => {
            createProjectSub.unsubscribe();
          }).subscribe(
            (project: Project) => {
              this._selectedProject = project;
              this._loadProjects();
            },
            (error: Response) => {
              // gestion d'erreur
            }
          );
        }
      },
      (error: any) => {
        // gestion d'erreur
      }
    );
  }

  select(selection: NavListSelection) {
    this.selectedProject = this._projects[selection.id];
  }
  
}

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { RoleChecker, DefaultRoleChecker } from "app/services/role-checker";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { NavList, NavListSelection } from "app/gui/nav-list";
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

  private _roleChecker: RoleChecker;

  private _searchParam: string = 'default';

  constructor(
    sanitizer: DomSanitizer,
    private _restService: RestApiService,
    private _session: SessionService,
    private _modal: ModalService
  ) {
    super(sanitizer);
    this._roleChecker = new DefaultRoleChecker(this._session);
    console.log('constructor projectlist');
  }

  ngOnInit() {
    this._loadProjects();
  }

  set searchParam(searchParam: string) {
    if(searchParam == undefined || searchParam == '') {
      this._searchParam = 'default';
    }
    else {
      this._searchParam = "[{col: 'name', param: '" + searchParam + "'}]";
    }
  }

  toSearchParams(searchValue: string = undefined): string {
    if(searchValue == undefined || searchValue == '') {
      return 'default';
    }
    return "[{col: 'name', param: '" + searchValue + "'}]";
  }

  get roleChecker(): RoleChecker {
    return this._roleChecker;
  }

  private _loadProjects(): void {
    let sub: Subscription = this._restService.fetchProjects(this._searchParam).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (projects: Project[]) => {
        this.selectables = [];
        this._projects = projects;
        for(let i = 0; i < this._projects.length; ++i) {
          this.selectables.push(
            new NavListSelection(
              i,
              this._projects[i].name,
              this._projects[i].active ? '#000000' : '#ff0000',
              this._projects[i].active ? '#ffffff' : '#ff0000'
            )
          );
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
      this.startReload();
      this._loadProjects();
      this._session.updateProjectList = false;
    }
  }

  add(): void {
    let sub : Subscription = this._modal.popup(ChoseProjectNameComponent, {
      title: "Nouveau Projet",
      errorText: "Veuillez choisir un nom de projet",
      submitText: "Créer le projet",
      cancelText: "Annuler"
    }).finally(() => {
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

  select(selection: NavListSelection): void {
    this.selectedProject = this._projects[selection.id];
  }

  projectSearch(searchValue: string): void {
    this.searchParam = searchValue;
    this._loadProjects();
  }
  
}

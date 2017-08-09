import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { RestApiService } from "app/services/rest-api.service";
import { ModalService } from "app/gui/modal.service";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { DatatableContentManager } from "app/gui/datatable";
import { Project } from "entities/project";

@Component({
  selector: 'admin-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends DatatableContentManager<Project, RestApiService> implements OnInit {
  private _add$: EventEmitter<void> = new EventEmitter<void>();
  private _rights$: EventEmitter<Project> = new EventEmitter<Project>();
  private _filelist$: EventEmitter<Project> = new EventEmitter<Project>();

  private _selectedProjects: Map<number, Project> = new Map<number, Project>();
  private _emptySelection: boolean = true;
  
  constructor(private _modal: ModalService, restService: RestApiService) {
    super(restService, 'fetchProjects');
  }

  ngOnInit() {
    this.load();
  }

  @Output('add') get add$(): EventEmitter<void> {
    return this._add$;
  }

  @Output('rights') get rights$(): EventEmitter<Project> {
    return this._rights$;
  }

  @Output('filelist') get filelist$(): EventEmitter<Project> {
    return this._filelist$;
  }

  set selectedProjects(selectedProjects: Map<number, Project>) {
    this._selectedProjects = selectedProjects;
    this.emptySelection = this._selectedProjects.size <= 0; 
  }

  set emptySelection(emptySelection: boolean) {
    setTimeout(() => {
      this._emptySelection = emptySelection;
    }, 0);
  }

  get emptySelection(): boolean {
    return this._emptySelection;
  }

  isSelectedProjectsEmpty(): boolean {
    return this._selectedProjects.size <= 0;
  }

  add(): void {
    this._add$.emit();
  }

  rights(project: Project): void {
    this._rights$.emit(project);
  }

  filelist(project: Project): void {
    this._filelist$.emit(project);
  }

  edit(project: Project): void {
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
        project.name = projectName;
        let restSub: Subscription = this._restService.editProject(project).finally(() => {
          restSub.unsubscribe();
        }).subscribe(
          (res: Response) => {
            this.load();
          },
          (error: Response) => {
            this._modal.info('Erreur', 'Erreur lors du changement de nom du projet.', false);
          }
        );
      },
      (error: any) => {
        this._modal.info('Erreur', 'Impossible de récupérer le nom entré.', false);
      }
    );
  }

  activate(project: Project, activate: boolean): void {
    let obs: Observable<Response>;
    project.active = activate;
    obs = activate ? this._restService.editProject(project) : this._restService.deleteProject(project);
    let sub: Subscription = obs.finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: Response) => {
        this.load();
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

  activateSelection(activate: boolean): void {
    let projects: Project[] = [];
    this._selectedProjects.forEach((project: Project, id: number) => {
      if(project.active != activate) {
        project.active = activate;
        projects.push(project);
      }
    });
    if(projects.length <= 0) {
      // aucun projet ne sera affecté par la mise à jour
      return;
    }
    this._restService.activateManyProjects(projects, activate).subscribe(
      (res: Response) => {
        this.load();
      },
      (error: Response) => {
        if(activate) {
          this._modal.info('Erreur', 'Erreur lors de la tentative de restauration des projets.', false);
        }
        else {
          this._modal.info('Erreur', 'Erreur lors de la tentative de suppression des projets', false);
        }
      }
    );
  }
}

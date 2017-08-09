/**
 * Auteur: Florian
 * License:
 */

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { RestApiService } from "app/services/rest-api.service";
import { ModalService } from "app/gui/modal.service";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { DatatableContentManager } from "app/gui/datatable";
import { Project } from "entities/project";

/**
 * Datatable de la liste des projets du panneau d'admin
 */
@Component({
  selector: 'admin-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends DatatableContentManager<Project, RestApiService> implements OnInit {
  
  // Events :
  /** @event - Ajout d'un projet*/
  private _add$: EventEmitter<void> = new EventEmitter<void>();
  /** @event - afficher les droits */
  private _rights$: EventEmitter<Project> = new EventEmitter<Project>();
  /** @event - afficher la liste des fichiers */
  private _filelist$: EventEmitter<Project> = new EventEmitter<Project>();

  // Sélection :
  /** Projets sélectionnés dans la datatable */
  private _selectedProjects: Map<number, Project> = new Map<number, Project>();
  /** Indique si la sélection est vide */
  private _emptySelection: boolean = true;
  
  /**
   * @constructor
   * @param {ModalService} _modal - service de modal : sert à afficher des popups
   * @param {RestApiService} restService - service REST
   */
  constructor(private _modal: ModalService, restService: RestApiService) {
    super(
      restService,    // service REST à utiliser
      'fetchProjects' // méthode à appeler pour récupérer les projets
    );
  }

  /**
   * Après initialisation...
   */
  ngOnInit() {
    this.load(); // chargement des projets
  }

  /**
   * @event add - l'utilisateur a cliqué sur le bouton 'ajouter'
   * @returns {EventEmitter<void>}
   */
  @Output('add')
  get add$(): EventEmitter<void> {
    return this._add$;
  }

  /**
   * @event rights - l'utilisateur a demandé à voir les droits d'un projet
   * @returns {EventEmitter<Project>} - le projet concerné
   */
  @Output('rights')
  get rights$(): EventEmitter<Project> {
    return this._rights$;
  }

  /**
   * @event filelist - l'utilisateur a demandé à voir les fichiers d'un projet
   * @returns {EventEmitter<Project>} - le projet concerné
   */
  @Output('filelist')
  get filelist$(): EventEmitter<Project> {
    return this._filelist$;
  }

  /** @property {Map<number, Project>} selectedProjects - projets sélectionnés dans la datatable */
  set selectedProjects(selectedProjects: Map<number, Project>) {
    this._selectedProjects = selectedProjects;
    this.emptySelection = this._selectedProjects.size <= 0; 
  }

  /** @property {boolean} emptySelection - indique si la liste des projets sélectionnés est vide ou non */
  get emptySelection(): boolean {
    return this._emptySelection;
  }

  set emptySelection(emptySelection: boolean) {
    setTimeout(() => {
      this._emptySelection = emptySelection;
    }, 0);
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur le bouton ajouter
   * @emits add
   */
  add(): void {
    this._add$.emit();
  }

  /**
   * Méthode appelée quand l'utilisateur demande à voir les droits d'un projet
   * @emits rights - demande de voir les droits de projet
   */
  rights(project: Project): void {
    this._rights$.emit(project);
  }

  /**
   * Méthode appelée quand l'utilisateur demande à voir les fichiers d'un projet
   * @emits rights - demande de voir les fichiers de projet
   */
  filelist(project: Project): void {
    this._filelist$.emit(project);
  }

  /**
   * @private Mets à jour le nom de project avec projectName
   * @param {Project} project - Le projet dont on veut changer le nom
   * @param {string} projectName - Le nouveau nom du projet
   */
  private updateProjectName(project: Project, projectName: string) : void {
    if(! projectName) {
      // garde : il faut un nom de projet
      return;
    }
    project.name = projectName;
    let restSub: Subscription = this._restService.editProject(project).finally(() => {
      restSub.unsubscribe(); // Finally, quand tout est terminé : on s'assure que les ressources soient libérées
    }).subscribe(
      (res: Response) => {   // OK : projet édité correctement
        this.load(); // rechargement des projets de la datatable
      },
      (error: Response) => { // Erreur :
        this._modal.info('Erreur', 'Erreur lors du changement de nom du projet.', false);
      }
    );
  }

  /**
   * Edite le nom du projet
   * @param {Project} project - projet à éditer
   */
  edit(project: Project): void {
    let sub : Subscription = this._modal.popup(ChoseProjectNameComponent, {
      // params de la modale :
      title: "Nom du projet",
      errorText: "Veuillez choisir un nom de projet",
      submitText: "Changer le nom",
      cancelText: "Annuler"
    }).finally(() => {
      sub.unsubscribe();          // s'assure de la libération des ressources
    }).subscribe(
      (projectName: string) => {  // OK : on récupère le nouveau nom
        this.updateProjectName(project, projectName);
      },
      (error: any) => {           // Erreur avec la modale :
        this._modal.info('Erreur', 'Impossible de récupérer le nom entré.', false);
      }
    );
  }

  /**
   * Active/désactive le projet en fonction de activate
   * @param {project} project - le projet à activer/désactiver
   * @param {boolean} activate - true => activer le projet, false => désactiver le projet
   */
  activate(project: Project, activate: boolean): void {
    let obs: Observable<Response>;
    project.active = activate;
    obs = activate ? this._restService.editProject(project) : this._restService.deleteProject(project);
    let sub: Subscription = obs.finally(() => {
      sub.unsubscribe();      // Finally, quand tout est terminé : on s'assure que les ressources soient libérées
    }).subscribe(
      (res: Response) => {    // Projet activé/désactivé avec succès :
        this.load(); // recharge la datatable
      },
      (error: Response) => {  // Erreur lors de l'activation/désactivation :
        if(activate) {
          this._modal.info('Erreur', 'Erreur lors de la tentative de restauration du projet.', false);
        }
        else {
          this._modal.info('Erreur', 'Erreur lors de la tentative de suppression du projet', false);
        }
      }
    );
  }

  /**
   * @private Active/désactive tous les projects en fonction de activate
   * @param {Project[]} projects - liste des projets à activer/désactiver
   * @param {boolean} activate - true => activer les projets, false => désactiver les projets
   */
  private activateProjects(projects: Project[], activate: boolean) {
    if(projects.length <= 0) {
      // garde : rien à faire si aucun projet n'est affecté
      return;
    }
    let sub: Subscription = this._restService.activateManyProjects(projects, activate).finally(() => {
      sub.unsubscribe();     // Finally, quand tout est terminé : on s'assure que les ressources soient libérées
    }).subscribe(
      (res: Response) => {   // Projets mis à jour correctement :
        this.load(); // recharge la datatable
      },
      (error: Response) => { // Erreur lors de la mise à jour :
        if(activate) {
          this._modal.info('Erreur', 'Erreur lors de la tentative de restauration des projets.', false);
        }
        else {
          this._modal.info('Erreur', 'Erreur lors de la tentative de suppression des projets', false);
        }
      }
    );
  }

  /**
   * Active/désactive tous les projets de la sélection en fonction de activate
   * @param {boolean} activate 
   */
  activateSelection(activate: boolean): void {
    // liste les projets de la sélection à modifier (dont project.active != activate) :
    let projects: Project[] = [];
    this._selectedProjects.forEach((project: Project, id: number) => {
      if(project.active != activate) {
        project.active = activate;
        projects.push(project);
      }
    });

    // activation/désactivation des projets :
    this.activateProjects(projects, activate);
  }
}

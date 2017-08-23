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
import { DatatableContentManager, DatatableSelectionManager } from "app/gui/datatable";
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

  /** permet d'activer/désactiver la sélection */
  private _selectionManager: DatatableSelectionManager<Project, RestApiService, ModalService>;
  
  /**
   * @constructor
   * @param {ModalService} _modal - service de modales : sert à afficher des popups
   * @param {RestApiService} restService - service REST
   */
  constructor(private _modal: ModalService, restService: RestApiService) {
    super(
      restService,     // service REST à utiliser
      'fetchProjects', // méthode à appeler pour récupérer les projets
      false,           // ne pas afficher le spinner de chargement lors des chargements suivants
      () => {          // mettre à jour les projets sélectionnés après chaque chargement
        this._selectionManager.updateSelectedEntities(this._selectionManager.selectedEntities);
      }
    );

    this._selectionManager = new DatatableSelectionManager<Project, RestApiService, ModalService>(
      restService,              // service REST utilisé
      'activateManyProjects',   // méthode pour activer ou désactiver les projets sélectionnés
      this,                     // content manager
      this._modal               // modale pour les messages d'erreur
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

  /**
   * @property {DatatableSelectionManager<Project, RestApiService, ModalService>} selectionManager -
   * manager des sélections
   */
  get selectionManager(): DatatableSelectionManager<Project, RestApiService, ModalService> {
    return this._selectionManager;
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
    let projectCopy: any = {};
    Object.keys(project).forEach((k: string) => { projectCopy[k] = project[k] });
    projectCopy.name = projectName;
    let restSub: Subscription = this._restService.editProject(projectCopy).finally(() => {
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
    let projectCopy: any = {};
    Object.keys(project).forEach((k: string) => { projectCopy[k] = project[k] });
    projectCopy.active = activate;
    obs = activate ? this._restService.editProject(projectCopy) : this._restService.deleteProject(projectCopy);
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

}

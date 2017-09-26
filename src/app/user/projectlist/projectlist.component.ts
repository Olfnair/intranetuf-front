/**
 * Auteur : Florian
 * License : 
 */

import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { MdTabChangeEvent } from "@angular/material";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { ModalService } from "app/gui/modal.service";
import { BasicRoleChecker, RoleCheckerService } from "app/services/role-checker";
import { AddProjectComponent } from "app/user/add-project/add-project.component";
import { NavList, NavListSelectable } from "app/gui/nav-list";
import { Project } from "entities/project";
import { FlexQueryResult } from "objects/flex-query-result";

/**
 * Menu de navigation des projets
 */
@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends NavList implements OnInit {

  /** liste des projets */
  private _projects: Project[] = [];

  /** projet sélectionné dans la liste */
  private _selectedProject: Project = undefined;

  /** valeur du champ de recherche */
  private _searchName: string = '';

  /**
   * @constructor
   * @param {DomSanitizer} sanitizer - sanitizer pour les styles
   * @param {RestApiService} _restService - service REST utilisé 
   * @param {SessionService} _session - données globales de session 
   * @param {RoleCheckerService} _roleCheckerService - service globale de check de rôle 
   * @param {ModalService} _modal - service d'affichage des modales
   */
  constructor(
    sanitizer: DomSanitizer,
    private _restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _modal: ModalService
  ) { super(sanitizer); }

  /**
   * Charge les projets après l'initialisation du composant
   */
  ngOnInit() {
    this.loadProjects();
  }

  /** @property {boolean} fetchActive - indique s'il faut lister les projets actifs (true) ou inactifs (false) */
  get fetchActive(): boolean {
    return this._session.fetchActiveProjects;
  }

  /**
   * Construit les paramètres pour la requête des projets en fonction du contexte
   * @returns {string} - les paramètres de requête formattés
   */
  buildSearchParams(): string {
    let params: string = '';
    if(this._searchName && this._searchName.length > 0) { // paramètres de recherche
      params = params.concat("col:'name'param:'" + this._searchName + "'");
    }
    if(this._roleCheckerService.userIsAdmin) {            // actif ou inactif si admin
      params = params.concat("col:'active'param:'" + this.fetchActive + "'");
    }
    if(params.length <= 0) {                              // params par défaut si on ne demande rien
      params = 'default';
    }
    return params;
  }

  /** @property {BasicRoleChecker} roleChecker - RoleChecker global */
  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
  }

  /**
   * Charge les projets
   */
  private loadProjects(): void {
    // chargement des projets :
    this._session.readyForContent = false; // on empêche le chargmeent de la page tant que ce n'est pas fait.
    this.error = undefined; // aucune erreur pour l'instant...
    let sub: Subscription = this._restService.fetchProjects(this.buildSearchParams(), "default", 0, 0).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (result: FlexQueryResult<Project>) => { // Projects récupéres :
        this._projects = []; // on vide la liste actuelle
        
        // Récupération de la liste des projets :
        if(result.list && result.list instanceof Array) {
          this._projects = result.list;
        }
        else if(result.list) {
          let projects: any[] = [result.list]; // cast
          this._projects = projects;
        }

        // si la liste est vide :
        if(this._projects.length <= 0) {
          this.emptyMessage = this._searchName && this._searchName != '' ?
          "Aucun projet ne correspond à votre recherche." :
          "Aucun projet";
        }

        // Conversion des projets chargés en éléments sélectionnables dans la nav-list :
        this.selectables = [];
        for(let i = 0; i < this._projects.length; ++i) {
          this.selectables.push(
            new NavListSelectable(
              i,
              this._projects[i].name,
              this._projects[i].active ? '#000000' : '#ff0000',
              this._projects[i].active ? '#ffffff' : '#ff0000'
            )
          );
        }

        if(! this._session.selectedProject) {
          this._selectedProject = this.projects.length > 0 ? this.projects[0] : this._session.selectedProject;
        }
        // tordu mais nécessaire (on appelle la propriété qui fait des traitements en plus)
        this.selectedProject = this._selectedProject;
      },
      (error: Response) => {                  // Erreur de chargement :
        this.error = "Une erreur s'est produite pendant le chargement de la liste des projets.";
      }
    );
  }

  /** @property {Project[]} projects - liste des projets affichés dans la nav-list */
  get projects(): Project[] {
    return this._projects;
  }

  /** @property {project} selectedProject - projet sélectionné dans la nav-list */
  get selectedProject(): Project {
    return this._selectedProject;
  }

  @Input()
  set selectedProject(project: Project) {
    this._selectedProject = project;
    
    // on cherche si le projet sélectionné fait partie de la liste :
    let i: number;
    this.selected = undefined;
    for(i = 0; project && i < this._projects.length; ++i) {
      if(this._projects[i].id === project.id) {
        this._selectedProject = this._projects[i];
        this.selected = this.selectables[i];
        break;
      }
    }

    // mise à jour des données de session :
    this._session.selectedProject = this._selectedProject;
  }

  /** @property {string} searchName - valeur du champ de recherche */
  get searchName(): string {
    return this._searchName;
  }

  /** @property {boolean} update - recharger la liste des projets ? */
  @Input()
  set update(update: boolean) {
    if(update) {
      this.startReload();
      this.loadProjects();
      this._session.updateProjectList = false;
    }
  }

  /**
   * Ouvre une fenêtre modale qui permet de créer un projet
   */
  add(): void {
    let sub : Subscription = this._modal.popup(AddProjectComponent, {isModal: true}).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (project: Project) => {
        if(project != undefined) {
          this._selectedProject = project; // on sélectionne le projet créé
          this.loadProjects();             // on recharge la liste des projets
        }
      },
      (error: any) => {
        // gestion d'erreur
      }
    );
  }

  /**
   * Sélectionne l'élément de la nav-list donné en paramètre
   * @param {NavListSelectable} selection - élément à sélectionner
   */
  select(selection: NavListSelectable): void {
    this.selectedProject = this._projects[selection.id];
  }

  /**
   * Effectue une recherche sur la liste des projets (recharge les projets)
   * @param {string} searchValue - la chaine à chercher dans le nom des projets
   */
  projectSearch(searchValue: string): void {
    this._searchName = searchValue;
    this.loadProjects();
  }

  /**
   * Sélectionne l'onglet actif (entre actifs et supprimés)
   * @param {MdTabChangeEvent} event - évènement de changement d'onglet
   */
  setSelectedTab(event: MdTabChangeEvent): void {
    this._session.fetchActiveProjects = event.index === 0 ? true : false;
    this.loadProjects(); // rechargement des projets correspondants à l'onglet
  }

  /**
   * Renvoie l'id de l'onglet sélectionné
   * @returns {number} id de l'onglet sélectionné : 0 pour actifs, 1 pour supprimés
   */
  getSelectedTab(): number {
    return this.fetchActive ? 0 : 1;
  }
  
}

/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import { environment } from "environments/environment";
import { RestApiService } from "app/services/rest-api.service";
import { ModalService } from "app/gui/modal.service";
import { SessionService } from 'app/services/session.service';
import { DatatableContentManager } from "app/gui/datatable";
import { ChoseProjectNameComponent } from "app/user/modals/chose-project-name/chose-project-name.component";
import { RightsChecker, DefaultRightsChecker } from "app/services/rights-checker";
import { RoleCheckerService, RoleChecker, DefaultRoleChecker } from "app/services/role-checker";
import { File } from "entities/file";
import { Project } from "entities/project";
import { WorkflowCheck, Status, CheckType } from "entities/workflow-check";
import { Status as VersionStatus } from "entities/version";

/**
 * Datatable pour gérer les fichiers d'un projet
 */
@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent extends DatatableContentManager<File, RestApiService> {
  
  /** Indique un début de chargement */
  private _startLoading: boolean = false;

  /** Tout premier chargement (pas encore eu de rechargement suite à recherche/tri...) */
  private _firstLoading: boolean = true;

  /** Projet duquel on liste les fichiers */
  private _project: Project = undefined;
  
  /** contrôles */
  private _controls: Map<number, WorkflowCheck> = undefined;
  /** validations */
  private _validations: Map<number, WorkflowCheck> = undefined;
  /** url de téléchargement des fichiers */
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  /** Vérificateur de droits */
  private _rightsChecker: RightsChecker = new DefaultRightsChecker(this._restService);

  /** charger les roles à chaque changement de projet et mettre à jour le service de check de role */
  private _roleCheckerUpdater: RoleChecker = new DefaultRoleChecker(this._restService, this._roleCheckerService);

  // Events :
  /** @event - ajout d'un fichier */
  private _addFile$: EventEmitter<File> = new EventEmitter<File>();
  /** @event - l'utilisateur a demandé à voir les détails d'un des fichiers listés */
  private _versionDetails$: EventEmitter<File> = new EventEmitter<File>();
  /** @event - l'utilisateur a demandé à contrôler ou valider un fichier */
  private _checkVersion$: EventEmitter<WorkflowCheck> = new EventEmitter<WorkflowCheck>();
  
  /**
   * @constructor
   * @param {RestApiService} restService - service REST utlisé 
   * @param {SessionService} _session - données globales de session
   * @param {RoleCheckerService} _roleCheckerService - service global de check de rôle
   * @param {ModalService} _modal - service pour afficher les modales
   */
  constructor(
    restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _modal: ModalService
  ) {
    super(
      restService,            // service REST
      'fetchFilesByProject',  // méthode appelée sur le service REST pour charger la liste des fichiers
      true,                   // afficher le spinner de chargement
      () => {                 // Actions après le chargement des données :
        this.loadChecks();    // chargement des checks (contrôles/validations) correspondants aux fichiers
        this.reload = false;  // plus de spinner de chargement pour les chargements suivants
      }
    );
  }

  /**
   * Réinitialisation de la datatable
   * @private
   */
  private resetFileList(): void {
    this.reset(true);
    // rechargement des droits du projet
    if(this._project) {
      this._roleCheckerUpdater.loadRole();
      this._rightsChecker.loadRights(this._project.id);
    }
  }

  /**
   * Efface les contrôles et validations
   * @private
   */
  private resetChecksMap(): void {
    this._controls = new Map<number, WorkflowCheck>();
    this._validations = new Map<number, WorkflowCheck>();
  }

  /**
   * Renvoie le map contenant soit les contrôles soit les validations en fonction du paramètre
   * @private
   * @param {CheckType} type - type de checks voulus (contrôles ou validations)
   * @returns {Map<number, WorkflowCheck>} - le map contenant soit les contrôles soit les validations
   */
  private getChecksMapFromType(type: CheckType): Map<number, WorkflowCheck> {
    if(type == CheckType.CONTROL) {
      return this._controls;
    }
    else if(type == CheckType.VALIDATION) {
      return this._validations;
    }
    return null;
  }

  /**
   * Charge les contrôles et validations
   * @private
   */
  private loadChecks(): void {
    if(! this.paginator.content || this.paginator.content.length <= 0) {
      // garde : on ne charge rien s'il n'y a pas de contenu
      return;
    }

    // chargement des checks :
    let sub: Subscription = this._restService.fetchWorkflowCheckByStatusUserVersions(
      Status.TO_CHECK, this._session.userId, this.paginator.content
    ).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        this.resetChecksMap();
        checks.forEach((check: WorkflowCheck) => { 
          let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(check.type);
          if(map) {
            map.set(check.version.id, check);
          }
        });
      },
      (error: Response) => {
        // gestion d'erreur
      }
    );
  }

  /** @property {boolean} startLoading - commencer le chargement */
  @Input()
  set startLoading(startLoading: boolean) {
    let old: boolean = this._startLoading;
    this._startLoading = startLoading;
    if(this._project != undefined && ! old && this._startLoading) {
      this.load([this._project]);
    }
  }

  /** @property {Project} project - projet dont la liste des fichiers est affichée */
  get project(): Project {
    return this._project;
  }
  
  @Input()
  set project(project: Project) {
    if(project) {
      this._project = project;
      this.resetFileList();
      if(this._project != undefined && this._startLoading) {
        this.load([this._project]);
      }
    }
  }

  /** @property {number} userId - id de l'utilisateur courant */
  get userId(): number {
    return this._session.userId;
  }

  /**
   * @event addFile - demande d'ajout d'un fichier / nouvelle version
   * @returns {EventEmitter<File>} - le fichier auquel ajouter une version (undefined si nouveau fichier)
   */
  @Output('addFile')
  get addFile$(): EventEmitter<File> {
    return this._addFile$;
  }

  /**
   * @event versionDetails - l'utilisateur a demandé à voir les détails d'un fichier
   * @returns {EventEmitter<File>} - le fichier que l'utilisateur a demandé à voir
   */
  @Output('versionDetails')
  get versionDetails$(): EventEmitter<File> {
    return this._versionDetails$;
  }

  /**
   * @event checkVersion - l'utilisateur a demandé à contrôler ou valider un fichier
   * @returns {EventEmitter<WorkflowCheck>} - le fichier concerné
   */
  @Output('checkVersion')
  get checkVersion$(): EventEmitter<WorkflowCheck> {
    return this._checkVersion$;
  }

  /**
   * Indique si l'utilisateur a le droit d'ajouter un fichier à ce projet
   * @returns {boolean} - true si l'utilisateur peut ajouter un fichier au projet, sinon false
   */
  userCanAddFile(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanAddFiles();
  }

  /**
   * Indique si l'utilisateur courant peut supprimer un fichier du projet
   * @returns {boolean} - true si l'utilisateur peut supprimer un fichier de ce projet, sinon false
   */
  userCanDeleteFile(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanDeleteFiles();
  }

  /**
   * Indique si l'utilisateur courant peut éditer le projet
   * @returns {boolean} - true si l'utilisateur peut supprimer le projet, sinon false
   */
  userCanEditProject(): boolean {
    return this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanEditProject();
  }

  /**
   * Indique si l'utilisateur courant peut supprimer le projet
   * @returns {boolean} - true si l'utilisateur peut supprimer le projet, sinon false
   */
  userCanDeleteProject(): boolean {
    return this._project.active
        && (this._roleCheckerService.userIsAdmin() || this._rightsChecker.userCanDeleteProject());
  }

  /**
   * Indique si l'utilisateur courant peut restaurer le projet ou non
   * @returns {boolean} - true si l'utilisateur peut restaurer le projet, sinon false
   */
  userCanActivateProject(): boolean {
    return ! this._project.active && this._roleCheckerService.userIsAdmin();
  }

  /**
   * Indique si l'utilisateur courant peut télécharger le fichier
   * @param {File} file - le fichier à télécharger
   * @returns {boolean} - true si l'utilisateur peut télécharger le fichier, sinon false
   */
  canDownload(file: File): boolean {
    return file.version.status == VersionStatus.VALIDATED // fichier validé
        || file.author.id == this._session.userId         // l'utilisateur courant est l'auteur
        || this.hasControl(file.version.id)               // l'utilisateur courant peut contrôler
        || this.hasValidation(file.version.id)            // l'utilisateur courant peut valider
        || this._roleCheckerService.userIsAdmin();        // l'utilisateur courant est admin
  }

  /**
   * @param {File} file - fichier auquel on doit ajouter une version (undefined si nouveau fichier)
   * @emits addFile - demande d'ajout de fichier / nouvelle version
   */
  addFile(file: File): void {
    this._addFile$.emit(file);
  }

  /**
   * @param {File} file - fichier dont on veut les détails
   * @emits versionDetails - demande pour voir les détails d'un fichier
   */
  versionDetails(file: File): void {
    this._versionDetails$.emit(file);
  }

  /**
   * @param {WorkflowCheck} check - le check à faire
   * @emits checkVersion - demande de contrôle ou validation
   */
  checkVersion(check: WorkflowCheck): void {
    return this._checkVersion$.emit(check);
  }

  /**
   * Renvoie le check sur un fichier de type type et dont l'id de version est versionId (pour l'utilisateur courant)
   * @private
   * @param {CheckType} type - type de check voulu
   * @param {number} versionId - id de version dont on veut le check
   * @returns {WorkflowCheck} - le check demandé
   */
  private getCheckAsParameter(type: CheckType, versionId: number): WorkflowCheck {
    let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(type);
    if(! map) { return null; }
    let check: WorkflowCheck = map.get(versionId);
    if(! check) { return null; }
    return check;
  }

  /**
   * Récupère le contrôle à effectuer par l'utilisateur courant sur la version (de fichier) spécifiée
   * @param versionId
   * @returns {WorkflowCheck} - le contrôle demandé ou null s'il n'existe pas
   */
  getControl(versionId: number): WorkflowCheck {
    return this.getCheckAsParameter(CheckType.CONTROL, versionId);
  }

  /**
   * Récupère la validation à effectuer par l'utilisateur courant sur la version (de fichier) spécifiée
   * @param versionId
   * @returns {WorkflowCheck} - lavalidation demandée ou null si elle n'existe pas
   */
  getValidation(versionId: number): WorkflowCheck {
    return this.getCheckAsParameter(CheckType.VALIDATION, versionId);
  }

  /**
   * Indique si le check correspondant aux paramètres existe dans les maps ou non (pour l'utilisateur courant)
   * @private
   * @param {CheckType} type - type de check demandé
   * @param {number} versionId - id de version dont on veut récupérer le check
   * @returns {boolean} - true si le check existe, sinon false
   */
  private hasCheck(type: CheckType, versionId: number): boolean {
    let map: Map<number, WorkflowCheck> = this.getChecksMapFromType(type);
    if(! map) { return false; }
    return map.has(versionId);
  }

  /**
   * Indique si l'utilisateur courant a un contrôle à effectuer sur cette version (du fichier) ou non
   * @param {number} versionId - id de version du fichier
   * @returns {boolean} - true si l'utilisateur a un contrôle à effectuer sur ce fichier, sinon false
   */
  hasControl(versionId: number): boolean {
    return this.hasCheck(CheckType.CONTROL, versionId);
  }

  /**
   * Indique si l'utilisateur courant a une validation à effectuer sur cette version (du fichier) ou non
   * @param {number} versionId - id de version du fichier
   * @returns {boolean} - true si l'utilisateur a une validation à effectuer sur ce fichier, sinon false
   */
  hasValidation(versionId: number): boolean {
    return ! this.hasControl(versionId) && this.hasCheck(CheckType.VALIDATION, versionId);
  }

  getTooltipText(file: File): string {
    if(file.version == undefined) {
      return '';
    }
    let check: WorkflowCheck = file.version.lastCheck;
    if(check == undefined) {
      return 'Aucun contrôle effectué';
    }
    else if(check.type == CheckType.CONTROL) {
      return 'Dernier Contrôle ' + ((check.status == Status.CHECK_OK) ? 'validé' : 'refusé') + ' par '
        + check.user.firstname + ' ' + check.user.name + ' :\n\n'
        + check.comment;
    }
    else if(check.type == CheckType.VALIDATION) {
      return 'Dernière Validation ' + ((check.status == Status.CHECK_OK) ? 'validée' : 'refusée') + ' par '
        + check.user.firstname + ' ' + check.user.name + ' :\n\n'
        + check.comment;
    }
  }

  /**
   * Supprime le fichier passé en paramètre (Suppression logique)
   * @param {File} file - fichier à supprimer 
   */
  deleteFile(file: File): void {
    let sub : Subscription = this._restService.deleteFile(file).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (status: number) => {
        this.load([this._project]);
      },
      (error: Response) => {
        this._modal.info('Erreur', 'Erreur lors de la tentative de suppression du fichier', false);
      }
    );
  }

  /**
   * Enregistre le nouveau passé en paramètre pour ce projet
   * @private
   * @param {string} projectName - le nouveau nom du projet
   */
  private saveProjectName(projectName: string): void {
    if(! projectName) {
      // garde : il faut un nom
      return;
    }
    // Enregistrement du nouveau nom :
    let project: Project = new Project();
    project.id = this._project.id;
    project.name = projectName;
    let restSub: Subscription = this._restService.editProject(project).finally(() => {
      restSub.unsubscribe();  // libération des ressources
    }).subscribe(
      (res: Response) => {    // OK : nom changé
        this._session.updateProjectList = true;
        this._project.name = projectName;
      },
      (error: Response) => {  // Erreur :
        this._modal.info('Erreur', 'Erreur lors du changement de nom du projet.', false);
      }
    );
  }

  /**
   * Ouvre une modale qui permet de changer le nom du projet
   */
  editProject(): void {
    // Ouverture de la modale
    let sub : Subscription = this._modal.popup(ChoseProjectNameComponent, {
      // params de la modale :
      title: "Nom du projet",
      errorText: "Veuillez choisir un nom de projet",
      submitText: "Changer le nom",
      cancelText: "Annuler"
    }).finally(() => {
      sub.unsubscribe();          // Finally : on libère les ressources
    }).subscribe(
      (projectName: string) => {  // OK : on récupère le nouveau nom
        this.saveProjectName(projectName);
      },
      (error: any) => {           // Erreur :
        // gestion d'erreur
      }
    );
  }

  /**
   * Supprime/restaure ce projet
   * @param {boolean} activate - true => restaurer, false => supprimer
   */
  activateProject(activate: boolean): void {
    let obs: Observable<Response>;
    let project: Project = new Project();
    project.id = this._project.id;
    project.active = activate;
    obs = activate ? this._restService.editProject(project) : this._restService.deleteProject(project);
    let sub: Subscription = obs.finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: Response) => {
        this._session.updateProjectList = true;
        this._project.active = activate;
        if(! activate && ! this._roleCheckerService.userIsAdmin()) {
          this._project = undefined;
          this._session.selectedProject = undefined;
        }
        if(activate) {
          this._modal.info('Projet Restauré', 'Le projet a été restauré.', true);
        }
        else {
          this._modal.info('Projet Supprimé', 'Le projet a été supprimé.', true);
        }
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
  
}

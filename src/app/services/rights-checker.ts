/**
 * Auteur : Florian
 * License : 
 */

import { RestApiService } from "app/services/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { ProjectRight, Right } from "entities/project-right";
import { Subscription } from "rxjs/Subscription";

/**
 * Vérificateur de droits
 */
export abstract class RightsChecker implements AuthorizationChecker {
  
  /** droits */
  private _rights: number = 0;
  /** chargement des droits en cours ou non */
  private _loading: boolean = true;

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé pour charger les droits 
   * @param {number} _projectId - id du projet concerné
   */
  constructor(
    private _restService: RestApiService,
    private _projectId: number = undefined
  ) { }

  /**
   * Indique si les droits sont vériffiés ou pas pour l'utilisateur courant
   * @returns {boolean} - true si les droits sont vérifiés, sinon false
   */
  public abstract check(): boolean;

  /**
   * Chargement des droits
   * @returns {Observable<boolean>} Observable qui indique si les droits sont chargés ou non
   */
  public load(): Observable<boolean> {
    if(this._projectId == undefined) {
      // garde : on a besoin de connaitre le projet sur lequel on veut vérifier des droits
      return Observable.create((observer: Observer<boolean>) => {
        observer.next(false); // Erreur : droits non chargés
        observer.complete();
      });
    }
    this._loading = true;
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this._restService.fetchRightsForUserByProject(this._projectId).finally(() => {
        sub.unsubscribe();                    // liberation ressources
        observer.complete();
      }).subscribe(
        (projectRights: ProjectRight[]) => {  // OK :
          projectRights.length > 0 ? this._rights = projectRights[0].rights : this._rights = 0;
          this._loading = false;
          observer.next(true); // droits chargés correctement
        },
        (error: Response) => {                // Erreur pdt le chargement :
          this._rights = 0;
          observer.next(false); // erreur lors du chargement des droits
        }
      );
    });
  }

  /**
   * charge les droits du l'utilisateur pour le projet spécifié
   * @param projectId - id du projet pour lequel il faut charger les droits
   */
  public loadRights(projectId: number): void {
    this._projectId = projectId;
    let sub: Subscription = this.load().finally(() => sub.unsubscribe()).subscribe();
  }

  /** @property {number} projectId - id du projet dont il faut charger les droits */
  public set projectId(projectId: number) {
    this._projectId = projectId;
  }

  /**
   * Indique si les droits sont rn cours de chargement ou non
   * @returns {boolean} true si ça charge, false sinon
   */
  public loading(): boolean {
    return this._loading;
  }

  /**
   * Indique si l'utilisateur actuel peut voir ce projet
   * @returns {boolean} true si l'utilisateur peut voir le projet, sinon false
   */
  public userCanView(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.VIEWPROJECT);
  }

  /**
   * Indique si l'utilisateur actuel peut ajouter des fichiers au projet
   * @returns {boolean} - true si l'utilisateur peut ajouter des fichiers au projet, sinon false
   */
  public userCanAddFiles(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.ADDFILES);
  }

  /**
   * Indique si l'utilisateur actuel peut supprimer des fichiers du projet
   * @returns {boolean} - true si l'utilisateur peut supprimer des fichiers dans ce projet, sinon false
   */
  public userCanDeleteFiles(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.DELETEFILES);
  }

  /**
   * Indique si l'utilisateur actuel peut éditer (changer le nom) du projet
   * @returns {boolean} - true si l'utilisateur peut éditer le projet, sinon false
   */
  public userCanEditProject(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.EDITPROJECT);
  }

  /**
   * Indique si l'utilisateur actuel peut supprimer l'intégralité du projet
   * @returns {boolean} - true si l'utilisateur peut supprimer l'intégralité du projet, sinon false
   */
  public userCanDeleteProject(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.DELETEPROJECT);
  }

  /**
   * Indique si l'utilisateur actuel est contrôleur sur ce projet
   * @returns {boolean} - true si l'utilisateur est contrôleur, sinon false
   */
  public userIsController(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.CONTROLFILE);
  }

  /**
   * Indique si l'utilisateur actuel est valideur sur ce projet
   * @returns {boolean} - true si l'utilisateur est valideur, sinon false
   */
  public userIsValidator(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.VALIDATEFILE);
  }
}

/**
 * Implémentation par défaut de RightsChecker
 */
export class DefaultRightsChecker extends RightsChecker {
  
  /**
   * Toujours faux par défaut
   * @returns {boolean} - false
   */
  public check(): boolean {
    return false;
  }

}

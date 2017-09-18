/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { RoleCheckerService } from "app/services/role-checker";
import { ModalService } from "app/gui/modal.service";
import { environment } from "environments/environment";
import { DatatableContentManager, DatatableQueryParams } from 'app/gui/datatable';
import { File } from "entities/file";
import { Status as VersionStatus, Version } from "entities/version";
import { WorkflowCheck, CheckType, Status as CheckStatus } from "entities/workflow-check";

/**
 * Contient les contrôles ou validations sur la version
 */
class CheckContainer {
  /** tableau des cheks du conteneneur */
  private _checks: WorkflowCheck[] = [];

  /** Observable sur les checks de ce conteneur */
  private _checksObs: Observable<WorkflowCheck[]> = undefined;

  /**
   * @constructor
   * @param {CheckType} type - type de checks dans le conteneur (contrôles ou validations)
   * @param {string} title - titre du conteneur
   */
  constructor(private _type: CheckType, private _title: string = '') { }

  /**
   * Mets à jour l'observable avec les données actuellement contenues dans le conteneur
   */
  update(): void {
    this._checksObs = Observable.create((observer: Observer<WorkflowCheck[]>) => {
      observer.next(this._checks);
      observer.complete();
    });
  }

  /** @property {string} title - titre du conteneur */
  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  /** @property {WorkflowCheck[]} checks - les checks contenus dans le conteneur */
  get checks(): WorkflowCheck[] {
    return this._checks;
  }

  /** @property {CheckType} type - type de cheks contenus dans le conteneur (contrôles ou validations) */
  get type(): CheckType {
    return this._type;
  }

  /** @property {Observable<WorkflowCheck[]>} checksObs - observable sur les checks contenus dans le conteneur */
  get checksObs(): Observable<WorkflowCheck[]> {
    return this._checksObs;
  }
}

class VersionList extends DatatableContentManager<Version, RestApiService> { 
  
  /**
   * @constructor
   * @param restService - service REST utilisé
   * @param _fileId - id du fichier
   * @param _versionId - id de la version actuelle
   */
  constructor(restService: RestApiService) {
    super(
      restService,
      'fetchOtherVersions'
    )
  }
}

/**
 * Composant qui permet d'afficher les détails de la version courante d'un fichier
 */
@Component({
  selector: 'app-version-details',
  templateUrl: './version-details.component.html',
  styleUrls: ['./version-details.component.css']
})
export class VersionDetailsComponent {
  
  /** fichier dont on affiche les détails */
  private _file: File = undefined;
  /** conteneurs pour les contrôles et validations */
  private _checkContainers: CheckContainer[] = [];

  private _otherVersions: VersionList = undefined;

  /** @event - fermeture du composant */
  private _close$: EventEmitter<void> = new EventEmitter<void>();

  /** url de téléchargement des fichiers */
  private _url = environment.backend.protocol + "://"
               + environment.backend.host + ":"
               + environment.backend.port
               + environment.backend.endpoints.download;

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST 
   * @param {SessionService} _session - données globales de session
   * @param {RoleCheckerService} _roleCheckerService - service global de vérification des rôles de l'utilisateur
   * @param {MdoalService} _modal - service pour l'affichage des modales
   */
  constructor(
    private _restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _modal: ModalService
  ) {
    // initialisation des conteneurs :
    this._checkContainers.push(new CheckContainer(CheckType.CONTROL, 'Contrôles'));
    this._checkContainers.push(new CheckContainer(CheckType.VALIDATION, 'Validations'));

    this._otherVersions = new VersionList(this._restService);
  }

  /** @property {File} file - le fichier dont on veut voir les détails de version */
  get file(): File {
    return this._file;
  }
  
  @Input()
  set file(file: File) {
    this._file = file;
    if(this._roleCheckerService.userIsAdmin()) {
      this._otherVersions.load([this._file.id, this._file.version.id]);
    }
    // chargement des contrôles et validations pour la version actuelle de ce fichier :
    let sub: Subscription = this._restService.fetchWorkflowChecksForVersion(this._file.version.id).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        checks.forEach((check: WorkflowCheck) => {
          this._checkContainers.forEach((checkContainer: CheckContainer) => {
            if (checkContainer.type == check.type) {
              checkContainer.checks.push(check);
            }
          });
        });
        this._checkContainers.forEach((checkContainer: CheckContainer) => {
          checkContainer.update();
        });
      },
      (error: Response) => {
        // gestion erreur
      }
    );
  }

  /** @property {CheckContainer[]} checkContainers - conteneurs de contrôles et validations */
  get checkContainers(): CheckContainer[] {
    return this._checkContainers;
  }

  /** @property {VersionList} - liste des autres versions du fichier */
  get otherVersions(): VersionList {
    return this._otherVersions;
  }

  /**
   * @event close - fermeture du composant
   * @returns {EventEmitter<void>}
   */
  @Output('close')
  get close$() : EventEmitter<void> {
    return this._close$;
  }

  /**
   * Indique si oui ou non l'utilisateur courant est admin (ou superadmin)
   * @returns {boolean} - true si l'utilisateur est admin, sinon false
   */
  userIsAdmin(): boolean {
    return this._roleCheckerService.userIsAdmin();
  }

  /**
   * Indique si oui ou non le statut donné en paramètre est le statut "à effectuer" ou non
   * @param {CheckStatus} status - le statut à tester
   * @returns {boolean} - true si le statu donné en paramètre correspond à "à effectuer", false sinon
   */
  statusIsToCheck(status: CheckStatus): boolean {
    return status == CheckStatus.TO_CHECK;
  }

  /**
   * Envoie un rappel à l'utilisateur qui doit effectuer le check passé en paramètre
   * @param {WorkflowCheck} check - le check dont l'utilisateur responsable doit recevoir un rappel
   */
  remind(check: WorkflowCheck): void {
    let sub: Subscription = this._restService.workflowCheckSendReminder(check).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (res: number) => {      // OK :
        this._modal.info('Mail envoyé', 'Mail de rappel envoyé.', true);
      },
      (error: Response) => {  // Erreur :
        this._modal.info('Erreur', 'Erreur lors de la tentative d\'envoi du mail de rappel', false);
      }
    );
  }

  /**
   * Renvoie le conteneur contenant les checks du type demandé
   * @private
   * @param {CheckType} type - type de check dont on veut le conteneur (contrôles ou validations)
   */
  private getCheckContainerFromType(type: CheckType): CheckContainer {
    return (type === CheckType.CONTROL ? this._checkContainers[0] : this._checkContainers[1]);
  }

  /**
   * Indique si le check correspondant aux paramètres existe dans les conteneurs
   * @private
   * @param {CheckType} type - type de check demandé
   * @returns {boolean} - true si le check existe, sinon false
   */
  private hasCheck(type: CheckType): boolean {
    let container: CheckContainer = this.getCheckContainerFromType(type);
    if (! container) { return false; }
    for (let check of container.checks) {
      if (check.user.id == this._session.userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Indique si l'utilisateur courant peut télécharger le fichier
   * @returns {boolean} - true si l'utilisateur peut télécharger le fichier, sinon false
   */
  canDownload(): boolean {
    return this._file.version.status == VersionStatus.VALIDATED // fichier validé
        || this._file.author.id == this._session.userId         // l'utilisateur courant est l'auteur
        || this.hasCheck(CheckType.CONTROL)                     // l'utilisateur courant peut contrôler
        || this.hasCheck(CheckType.VALIDATION)                  // l'utilisateur courant peut valider
        || this._roleCheckerService.userIsAdmin();              // l'utilisateur courant est admin
  }

  /**
   * Renvoie le statut du fichier pour pouvoir afficher l'icône qui y correspond
   * @returns {string} - le statut du fichier qui permettra d'afficher une icône qui y correspond
   */
  fileIconStatus(): string {
    if (this._file.version.status == VersionStatus.VALIDATED) {
      return 'check';
    }
    else if (this._file.version.status == VersionStatus.REFUSED) {
      return 'error';
    }
    return 'warning';
  }

  /**
   * Renvoie le statut du container passé en paramètre
   * @param {CheckContainer} container - le container dont on veut connaitre le statut
   * @returns {string} le statut du container passé en paramètre
   */
  checksStatus(container: CheckContainer): string {
    for (let check of container.checks) {
      if (check.status == CheckStatus.CHECK_KO) {
        return 'error';
      }
      else if (
        check.status == CheckStatus.WAITING ||
        check.status == CheckStatus.TO_CHECK ||
        check.status == CheckStatus.CANCELLED
      ) {
        return 'warning';
      }
    }
    return 'check';
  }

  /**
   * @emits close - event de fermeture du composant
   */
  close() {
    this._close$.emit();
  }

}

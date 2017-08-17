/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { File } from "entities/file";
import { Status as VersionStatus } from "entities/version";
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

  /** @event - fermeture du composant */
  private _close$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST 
   */
  constructor(private _restService: RestApiService) {
    // initialisation des conteneurs :
    this._checkContainers.push(new CheckContainer(CheckType.CONTROL, 'Contrôles'));
    this._checkContainers.push(new CheckContainer(CheckType.VALIDATION, 'Validations'));
  }

  /** @property {File} file - le fichier dont on veut voir les détails de version */
  get file(): File {
    return this._file;
  }
  
  @Input()
  set file(file: File) {
    this._file = file;
    // chargement des contrôles et validations pour ce fichier :
    let sub: Subscription = this._restService.fetchWorkflowChecksForVersion(this._file.version.id).finally(() => {
      sub.unsubscribe();
    }).subscribe(
      (checks: WorkflowCheck[]) => {
        checks.forEach((check: WorkflowCheck) => {
          this._checkContainers.forEach((checkContainer: CheckContainer) => {
            if(checkContainer.type == check.type) {
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

  /**
   * @event close - fermeture du composant
   * @returns {EventEmitter<void>}
   */
  @Output('close')
  get close$() : EventEmitter<void> {
    return this._close$;
  }

  /**
   * Renvoie le statut du fichier pour pouvoir afficher l'icône qui y correspond
   * @returns {string} - le statut du fichier qui permettra d'afficher une icône qui y correspond
   */
  fileIconStatus(): string {
    if(this._file.version.status == VersionStatus.VALIDATED) {
      return 'check';
    }
    else if(this._file.version.status == VersionStatus.REFUSED) {
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
    let ret: string = 'check';
    container.checks.forEach((check: WorkflowCheck) => {
      if(check.status == CheckStatus.CHECK_KO) {
        ret = 'error';
      }
      else if(check.status == CheckStatus.WAITING || check.status == CheckStatus.TO_CHECK) {
        ret = 'warning';
      }
    });
    return ret;
  }

  /**
   * @emits close - event de fermeture du composant
   */
  close() {
    this._close$.emit();
  }

}

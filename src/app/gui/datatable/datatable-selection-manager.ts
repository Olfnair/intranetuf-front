/**
 * Auteur : Florian
 * License : 
 */

import { Subscription } from "rxjs/Subscription";
import { DatatableContentManager } from "./datatable-content-manager";

/**
 * Manager de la sélection des datatables : permet d'activer ou désactiver les
 */
export class DatatableSelectionManager<T, RestService, ModalService> {
  /** Entités sélectionnées dans la datatable */
  private _selectedEntities: Map<number, T> = new Map<number, T>();
  /** Indique si au moins une des entités sélectionnées peut être supprimée */
  private _canDesactivateAnySelectedItem: boolean = false;
  /** Indique si au moins une des entités sélectionnées peut être activée ou non*/
  private _canActivateAnySelectedItem: boolean = false;

  /**
   * @constructor
   * @param {RestService} _restService - service REST utilisé
   * @param {string} _activationMethodName - nom de la méthode à utiliser pour activer/désactiver les entités
   * @param {DatatableContentManager<T, RestService>} _datatableContentManager - content manager de la datatable
   * @param {ModalService} _modal - modale pour afficher les messages d'erreur
   */
  constructor(
    private _restService: RestService,
    private _activationMethodName: string = undefined,
    private _datatableContentManager: DatatableContentManager<T, RestService>,
    private _modal: ModalService
  ) { }

  /** @property {Map<number, T>} selectedEntities - entités sélectionnées dans la datatable */
  public get selectedEntities(): Map<number, T> {
    return this._selectedEntities;
  }

  /**
   * @property {boolean} canActivateAnySelectedItem - indique si au moins une des entités de la sélection
   *                                                  peut être activée
   */
  public get canActivateAnySelectedItem(): boolean {
    return this._canActivateAnySelectedItem;
  }

  /**
   * @property {boolean} canDesactivateAnySelectedItem - indique si au moins une des entités de la sélection
   *                                                     peut être désactivée
   */
  public get canDesactivateAnySelectedItem(): boolean {
    return this._canDesactivateAnySelectedItem;
  }

  /**
   * @property {string} activationMethodName - Nom de la méthode à appeler sur le service REST pour
   *                                           activer/désactiver une entité T
   */
  public set activationMethodName(activationMethodName: string) {
    this._activationMethodName = activationMethodName;
  }

  /**
   * Met à jour la liste des entités sélectionnées et les parcourt pour savoir si elles peuvent
   * être activées ou désactivées.
   * @param {Map<number, Project>} selectedEntities - map des entités sélectionnées
   */
  updateSelectedEntities(selectedEntities: Map<number, T>): void {
    setTimeout(() => {
      this._selectedEntities = selectedEntities;
      this._canActivateAnySelectedItem = false;
      this._canDesactivateAnySelectedItem = false;
      this._selectedEntities.forEach((entity: T) => {
        if(entity['active'] === true) {
          this._canDesactivateAnySelectedItem = true;
        }
        else {
          this._canActivateAnySelectedItem = true;
        }
      });
    }, 0);
  }

  /**
   * @private Active/désactive toutes les entités en fonction de activate
   * @param {Project[]} projects - liste des projets à activer/désactiver
   * @param {boolean} activate - true => activer les projets, false => désactiver les projets
   */
  private activateEntities(entities: T[], activate: boolean): void {
    if(entities.length <= 0) {
      // garde : rien à faire si aucune entité n'est affectée
      return;
    }
    let sub: Subscription = this._restService[this._activationMethodName](entities, activate).finally(() => {
      sub.unsubscribe();     // Finally, quand tout est terminé : on s'assure que les ressources soient libérées
    }).subscribe(
      (res: Response) => {   // Projets mis à jour correctement :
        this._datatableContentManager.load(); // recharge la datatable
      },
      (error: Response) => { // Erreur lors de la mise à jour :
        if(activate) {
          this._modal['info']('Erreur', 'Erreur lors de la tentative d\'activation des éléments sélectionnés.', false);
        }
        else {
          this._modal['info']('Erreur', 'Erreur lors de la tentative de suppression des éléments sélectionnés', false);
        }
      }
    );
  }

  /**
   * Active/désactive toutes les entités de la sélection en fonction de activate
   * @param {boolean} activate 
   */
  activateSelection(activate: boolean): void {
    // liste les entités de la sélection à modifier (dont entity.active != activate) :
    let entities: T[] = [];
    this._selectedEntities.forEach((entity: T, id: number) => {
      if(entity['active'] != activate) {
        entity['active'] = activate;
        entities.push(entity);
      }
    });

    // activation/désactivation des projets :
    this.activateEntities(entities, activate);
  }

}
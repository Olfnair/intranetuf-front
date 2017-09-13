/**
 * Auteur : Florian
 * License : 
 */

import { DatatableContentManager } from "./datatable-content-manager";
import { BitBoxGridRules, BitsContainer } from "../bit-box-grid-rules";

/**
 * Gestionnaire de contenu générique d'une liste d'entiers dont on peut assigner les bits individuellement
 * @param T - Classe des entités contenant les entiers
 * @param RestService - Le service REST utilisé pour charger / sauver les données
 */
export class DatatableBitBoxContentManager<T, RestService> extends DatatableContentManager<T, RestService> {
  
  /** règles qui permettent de savoir si un bit est assigné ou pas */
  private _gridRules: BitBoxGridRules<T>;

  /**
   * @constructor
   * @param {RestService} restService - le service REST à utiliser 
   * @param {string} methodName - le nom de la méthode à appeler sur le service REST pour charger/sauver
   * @param _ContainerType - Le type de containers utilisés, implémentant l'interface BitsContainer
   */
  constructor(
    readonly restService: RestService,
    readonly methodName: string,
    private readonly _ContainerType
  ) {
    super(restService, methodName, undefined, () => {
      // Callback appelé après chaque chargement des données

      // pour chaque entité T 'originalBits' :
      this.paginator.content.forEach((originalBits: T) => {
        
        // on crée un container
        let originalBitsContainer: BitsContainer = new this._ContainerType(originalBits);
        
        // si l'entité qu'on vient de charger correspond à une entité modifiée dans l'application,
        // on la remplace par la version modifiée
        if(this._gridRules.modifiedBits.has(originalBitsContainer.getId())) {
          originalBitsContainer.setBits(this._gridRules.modifiedBits.get(originalBitsContainer.getId()).getBits());
        }

        // Copie de l'état original de l'entité si elle n'est pas encore dans la liste des originaux :
        if(this._gridRules.originalBits.has(originalBitsContainer.getId())) {
          // garde : on connait déjà l'état original de cette entité
          return;
        }
        let copy: any = {}; // variable de copie
        Object.keys(originalBits).forEach((k: string) => copy[k] = originalBits[k]); // copie
        // conservation en tant qu'original :
        let copyBitsContainer: BitsContainer = new this._ContainerType(copy);
        this._gridRules.originalBits.set(copyBitsContainer.getId(), copyBitsContainer);
      });
    });

    // retour au constructeur :
    this._gridRules = new BitBoxGridRules<any>(this._ContainerType);
  }

  /** @property {BitBoxGridRules<T>} grid - règles qui permettent de savoir si un bit est assigné ou pas */
  get grid(): BitBoxGridRules<T> {
    return this._gridRules;
  }
}
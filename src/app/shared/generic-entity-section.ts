/**
 * Auteur : Florian
 * License :
 */

import { AppSection } from "app/shared/app-section";

/**
 * Classe générique d'une section pour manipuler un certain type T d'entités
 */
export class GenericEntitySection<T> extends AppSection {
  
  /** l'entité manipulée par la section */
  private _entity: T = undefined;
  
  /**
   * @constructor
   * @param {any} states - Enumération des états possibles pour la section
   */
  constructor(states: any) {
    super(states);
  }

  /** @property {T} entity - l'entité manipulée par la section  */
  get entity(): T {
    return this._entity;
  }

  set entity(entity: T) {
    this._entity = entity;
  }

  /**
   * Mets à jour l'état de la section (state) et l'entité (entity) qu'elle manipule
   * @param {number} state - le nouvel état de la section
   * @param {T} entity - la nouvelle entité
   */
  setStateAndEntity(state: number, entity: T) {
    this.state = state;
    this._entity = entity;
  }
  
}
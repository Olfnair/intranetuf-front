/***
 * Auteur : Florian
 * License : 
 */

import { Entity } from "entities/entity";

/**
 * Entité Projet
 */
export class Project extends Entity {
  
  /** nom du projet */
  public name: string = undefined;
  
  /** projet actif ou non */
  public active: boolean = undefined;

  /**
   * @constructor
   * @param {number} id - id du projet
   */
  constructor(id: number = undefined) {
    super(id);
  }
}

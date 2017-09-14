/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "./entity";
import { User } from "./user";
import { Version } from "./version";
import { Project } from "entities/project";

/**
 * Enumération des types possibles pour un check
 * @enum
 */
export enum CheckType {
  CONTROL = 0,
  VALIDATION = 1
}

/**
 * Enumération des statuts possibles pour un check
 * @enum
 */
export enum Status {
  CANCELLED = -1,
  WAITING = 0,
  TO_CHECK = 1,
  CHECK_OK = 2,
  CHECK_KO = 3
}

/**
 * Entité Check de workflow
 */
export class WorkflowCheck extends Entity {
  
  /** statut */
  status: number = undefined;
  
  /** date à partir de laquelle le check a pu être effectué par l'utilisateur responsable de le faire */
  date_init: number = undefined;
  
  /** date à laquelle le check a été effectué */
  date_checked: number = undefined;
  
  /** commentaire sur la version évaluée lors du check */
  comment: string = undefined;
  
  /** ordre de priorité de ce check */
  order_num: number = undefined;
  
  /** type de check */
  type: CheckType = undefined;
  
  /** version sur laquelle le check doit être effectué ou a été effectué */
  version: Version = undefined;
  
  /** utilisateur responsable du check */
  user: User = undefined;

  /** projet relatif à ce check */
  project: Project = undefined;

  /**
   * @constructor
   * @param {number} id - id du check 
   */
  constructor(id: number = undefined) {
    super(id);
  }

}
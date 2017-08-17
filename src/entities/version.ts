/**
 * Auteur : Florian
 * License : 
 */

import { File } from "entities/file";
import { WorkflowCheck } from "entities/workflow-check";

/**
 * Enumération des statuts possibles pour une version
 * @enum
 */
export enum Status { 
  CREATED = 0,
  CONTROLLED = 1,
  VALIDATED = 2,
  REFUSED = 3
}

/**
 * Entité Version
 */
export class Version {
  
  /** id de la version */
  public id: number = undefined;
  
  /** nom du fichier */
  public filename: string = undefined;
  
  /** numéro de version */
  public num: number = undefined;
  
  /** statut */
  public status: number = undefined;
  
  /** fichier relatif à cette version */
  public file: File = undefined;
  
  /** date d'upload de cette version */
  public date_upload: number = undefined;
  
  /** liste des checks (contrôles ou validations) de cette version */
  public workflowChecks: WorkflowCheck[] = undefined;

  /** @constructor */
  constructor() { }

}

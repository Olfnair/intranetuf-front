/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "./entity";
import { File } from "./file";
import { User } from "./user";

/**
 * Entité Log
 */
export class Log extends Entity {
  
  /** type d'infos logguées */
  public type: string = undefined;
  
  /** message du log */
  public message: string = undefined;
  
  /** date de création du log */
  public logdate: number = undefined;
  
  /** utilisateur relatif à cette entrée de log */
  public user: User = undefined;
  
  /** fichier relatif à cette entrée de log */
  public file: File = undefined;

  /**
   * @constructor
   * @param {number} id - id du log
   */
  constructor(id: number = undefined) {
    super(id);
  }

}
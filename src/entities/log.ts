/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "./entity";
import { File } from "./file";
import { Project } from "entities/project";
import { User } from "./user";
import { Version } from "entities/version";

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

  /** utilisateur auteur de l'action relative à cette entrée de log */
  public author: User = undefined;
  
  /** utilisateur relatif à cette entrée de log */
  public user: User = undefined;
  
  /** projet relatif à cette entrée de log */
  public project: Project = undefined;

  /** version relative à cette entrée de log */
  public version: Version = undefined;

  /**
   * @constructor
   * @param {number} id - id du log
   */
  constructor(id: number = undefined) {
    super(id);
  }

}
/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "./entity";
import { Project } from "./project";
import { User } from "./user";
import { Version } from "./version";

/**
 * Entité Fichier
 */
export class File extends Entity {
  
  /** fichier actif ou non */
  public active: boolean = undefined;
  
  /** auteur du fichier */
  public author: User = undefined;
  
  /** version actuelle du fichier */
  public version: Version = undefined;

  /** projet dont le fichier fait partie */
  public project: Project = undefined;

  /**
   * @constructor
   * @param {number} id - id du fichier
   */
  constructor(id: number = undefined) {
    super(id);
  }

}

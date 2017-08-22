/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "entities/entity";
import { Project } from "entities/project";
import { User } from "entities/user";
import { Version } from "entities/version";

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

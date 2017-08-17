/**
 * Auteur : Florian
 * License : 
 */

import { Project } from "entities/project";
import { User } from "entities/user";
import { Version } from "entities/version";

/**
 * Entité Fichier
 */
export class File {
  
  /** id du fichier */
  public id: number = undefined;
  
  /** fichier actif ou non */
  public active: boolean = undefined;
  
  /** auteur du fichier */
  public author: User = undefined;
  
  /** version actuelle du fichier */
  public version: Version = undefined;

  /** projet dont le fichier fait partie */
  public project: Project = undefined;

  /** @constructor */
  constructor() { }
  
}

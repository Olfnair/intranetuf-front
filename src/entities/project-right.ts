/**
 * Auteur : Florian
 * License : 
 */

import { Entity } from "entities/entity";
import { Project } from "entities/project";
import { User } from "entities/user";

/**
 * Enumération des droits qu'un utilisateur peut avoir sur un projet
 * @enum
 */
export enum Right {
  // droits sur le projet :
  VIEWPROJECT     = 1, // voir le projet et ses fichiers
  EDITPROJECT     = 2, // editer le projet (changer le nom)
  DELETEPROJECT   = 4, // supprimer le projet
  ADDFILES        = 8, // ajouter des fichiers au projet
  DELETEFILES     = 16, // supprimer des fichiers du projet
  CONTROLFILE     = 32, // controler des fichiers du projet
  VALIDATEFILE    = 64 // valider les fichiers du projet
  // admin = tous les droits sur tous les projets
  // combiner les droits : 1 + 8 = 9 => voir projet et ajouter fichiers
  // Autrement dit, chaque bit de 'rights' correspond à un droit qui est actif ou pas (0 ou 1)
  // il reste des bits inutilisés pour ajouter des droits si nécessaire
}

/**
 * Entité Droits d'un utilisateur sur un projet
 */
export class ProjectRight extends Entity {

  /**
   * @constructor
   * @param {number} id - id des droits
   * @param {number} rights - valeur des droits 
   * @param {Project} project - projet relatif aux droits
   * @param {User} user - utilisateur relatif aux droits
   */
  constructor(
    id: number = undefined,
    public rights: number = undefined,
    public project: Project = undefined,
    public user: User = undefined
  ) {
    super(id);
  }

  /**
   * Indique si les droits projectRights contiennnent le droit rightToCheck
   * @static
   * @param {number} projectRights - les droits à tester
   * @param {RightrightToCheck} - le(s) droit(s) à vérifier
   * @returns {boolean} - true si projectRights contient rightToCheck
   */
  public static hasRight(projectRights: number, rightToCheck: Right): boolean {
    return (projectRights & rightToCheck) === rightToCheck;
  }

}

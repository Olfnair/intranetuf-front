import { Project } from "app/entities/project";
import { User } from "app/entities/user";

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

export class ProjectRight {
  public id: number = undefined;
  public rights: number = undefined;
  public project: Project = undefined;
  public user: User = undefined;

  constructor(id: number = undefined, rights: number = undefined, project: Project = undefined, user: User = undefined) {
    this.id = id;
    this.rights = rights;
    this.project = project;
    this.user = user;
  }

  hasRight(right: Right): boolean {
    return (this.rights & right) > 0;
  }
}

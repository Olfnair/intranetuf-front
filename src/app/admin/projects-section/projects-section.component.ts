import { Component } from '@angular/core';
import { GenericEntitySection } from "app/shared/generic-entity-section";
import { Project } from "entities/project";

/**
 * Section 'Projets' du panneau d'admin
 */
@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.css']
})
export class ProjectsSectionComponent extends GenericEntitySection<Project> {
  
  /**
   * @constructor
   */
  constructor() {
    super({
      // Etats possibles (this.state) :
      List:     0, // Lister les projets
      Add:      1, // Ajouter un projet
      Rights:   2, // Gérer les droits relatifs à un projet
      Filelist: 3, // Lister les fichiers d'un projet
    });
  }

}

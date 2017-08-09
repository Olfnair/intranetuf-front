/**
 * Auteur: Florian
 * License:
 */

import { Component } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { RightsGridContentManager, ProjectRightsBitsContainer } from "app/admin/rights-grid-content-manager";
import { Project } from "entities/project";

/**
 * Grille/Datatable de gestion des droits sur les projets par projet
 */
@Component({
  selector: 'app-project-rightslist',
  templateUrl: './project-rightslist.component.html',
  styleUrls: ['./project-rightslist.component.css']
})
export class ProjectRightslistComponent extends RightsGridContentManager<Project> {
  
  /**
   * @constructor
   * @param {RestApiService} restService - Service REST à appeler pour les requêtes
   */
  constructor(restService: RestApiService) {
    super(
      restService,                // service REST à utiliser
      'getRightsForProject',      // méthode à appeler pour récupérer les droits
      ProjectRightsBitsContainer  // Classe de représentation des droits
    );
  }

}

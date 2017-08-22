/**
 * Auteur: Florian
 * License:
 */

import { Component } from "@angular/core";
import { BitsGridContentManager, ProjectRightsBitsContainer } from "app/admin/bits-grid-content-manager";
import { RestApiService } from "app/services/rest-api.service";
import { Project } from "entities/project";
import { ProjectRight } from "entities/project-right";

/**
 * Grille/Datatable de gestion des droits sur les projets par projet
 */
@Component({
  selector: 'app-project-rightslist',
  templateUrl: './project-rightslist.component.html',
  styleUrls: ['./project-rightslist.component.css']
})
export class ProjectRightslistComponent extends BitsGridContentManager<Project, ProjectRight> {
  
  /**
   * @constructor
   * @param {RestApiService} restService - Service REST à appeler pour les requêtes
   */
  constructor(restService: RestApiService) {
    super(
      restService,                // service REST à utiliser
      'fetchRightsForProject',    // méthode à appeler pour récupérer les droits
      'createOrEditRights',       // méthode à appeler pour sauver les droits
      ProjectRightsBitsContainer  // Classe de représentation des droits
    );
  }

}

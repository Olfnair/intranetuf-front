/**
 * Auteur : Florian
 * License :
 */

import { Component } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { User } from "entities/user";
import { BitsGridContentManager, UserRightsBitsContainer } from "app/admin/bits-grid-content-manager";
import { ProjectRight } from "entities/project-right";

/**
 * Grid/Datatable de gestion des droits sur les projets par utilisateur
 */
@Component({
  selector: 'app-user-rightslist',
  templateUrl: './user-rightslist.component.html',
  styleUrls: ['./user-rightslist.component.css']
})
export class UserRightslistComponent extends BitsGridContentManager<User, ProjectRight> {
  
  /**
   * @constructor
   * @param {RestApiService} restService - service REST à utiliser pour charger/enregistrer les droits
   */
  constructor(restService: RestApiService) {
    super(
      restService,            // service REST à utiliser
      'fetchRightsForUser',   // nom de la méthode à appeler sur le service pour charger
      'createOrEditRights',   // nom de la méthode pour sauvegarder
      UserRightsBitsContainer // Classe de représentation des droits
    );
  }

}

/**
 * Auteur : Florian
 * License :
 */

import { Component } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { RightsGridContentManager, UserRightsBitsContainer } from "app/admin/rights-grid-content-manager";
import { User } from "entities/user";

/**
 * Grid/Datatable de gestion des droits sur les projets par utilisateur
 */
@Component({
  selector: 'app-user-rightslist',
  templateUrl: './user-rightslist.component.html',
  styleUrls: ['./user-rightslist.component.css']
})
export class UserRightslistComponent extends RightsGridContentManager<User> {
  
  /**
   * @constructor
   * @param {RestApiService} restService - service REST à utiliser pour charger/enregistrer les droits
   */
  constructor(restService: RestApiService) {
    super(
      restService,            // service REST à utiliser
      'fetchRightsForUser',   // nom de la méthode à appeler sur le service
      UserRightsBitsContainer // Classe de représentation des droits
    );
  }

}

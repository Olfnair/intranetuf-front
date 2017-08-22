import { Component } from '@angular/core';
import { BitsGridContentManager, UserRolesBitsContainer } from "app/admin/bits-grid-content-manager";
import { RestApiService } from "app/services/rest-api.service";
import { User } from "entities/user";

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent extends BitsGridContentManager<User, User>  {

  /**
   * @constructor
   * @param {RestApiService} restService - service REST à utiliser pour charger/enregistrer les rôles
   */
  constructor(restService: RestApiService) {
    super(
      restService,            // service REST à utiliser
      'fetchUsers',           // nom de la méthode à appeler sur le service pour charger
      'editUsers',            // nom de la méthode pour sauvegarder
      UserRolesBitsContainer  // Classe de représentation des droits
    );
  }

}

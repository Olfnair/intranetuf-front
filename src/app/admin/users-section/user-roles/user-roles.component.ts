import { Component } from '@angular/core';
import { BitsGridContentManager, UserRolesBitsContainer } from "app/admin/bits-grid-content-manager";
import { RestApiService } from "app/services/rest-api.service";
import { RoleCheckerService, BasicRoleChecker } from "app/services/role-checker";
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
  constructor(restService: RestApiService, private _roleCheckerService: RoleCheckerService) {
    super(
      restService,            // service REST à utiliser
      'fetchUsers',           // nom de la méthode à appeler sur le service pour charger
      'editUsers',            // nom de la méthode pour sauvegarder
      UserRolesBitsContainer  // Classe de représentation des droits
    );
  }

  /** @property {BasicRoleChecker} roleChecker - roleChecker permettant de vérifier le role de l'utiliseur courant */
  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
  }

}

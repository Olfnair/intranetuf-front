import { Component } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { RightsGridContentManager, UserRightsBitsContainer } from "app/admin/rights-grid-content-manager";
import { User } from "entities/user";

@Component({
  selector: 'app-user-rightslist',
  templateUrl: './user-rightslist.component.html',
  styleUrls: ['./user-rightslist.component.css']
})
export class UserRightslistComponent extends RightsGridContentManager<User> {
  constructor(restService: RestApiService) {
    super(restService, 'getRightsForUser', UserRightsBitsContainer);
  }
}

import { Component } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { RightsGridContentManager, ProjectRightsBitsContainer } from "app/admin/rights-grid-content-manager";
import { Project } from "entities/project";

@Component({
  selector: 'app-project-rightslist',
  templateUrl: './project-rightslist.component.html',
  styleUrls: ['./project-rightslist.component.css']
})
export class ProjectRightslistComponent extends RightsGridContentManager<Project> {
  constructor(restService: RestApiService) {
    super(restService, 'getRightsForProject', ProjectRightsBitsContainer);
  }
}

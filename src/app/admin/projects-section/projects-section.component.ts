import { Component } from '@angular/core';
import { GenericAdminSection } from "app/admin/admin-section";
import { Project } from "entities/project";

@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.css']
})
export class ProjectsSectionComponent extends GenericAdminSection<Project> {
  constructor() {
    super({
      List:   0,
      Add:    1,
      Edit:   2,
      Rights: 3
    });
  }
}

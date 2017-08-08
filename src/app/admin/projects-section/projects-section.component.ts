import { Component } from '@angular/core';
import { GenericEntitySection } from "../generic-admin-section";
import { Project } from "entities/project";

@Component({
  selector: 'app-projects-section',
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.css']
})
export class ProjectsSectionComponent extends GenericEntitySection<Project> {
  constructor() {
    super({
      List:     0,
      Add:      1,
      Rights:   2,
      Filelist: 3,
    });
  }
}

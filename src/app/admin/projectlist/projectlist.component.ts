import { Component, OnInit } from '@angular/core';
import { RestApiService } from "app/services/rest-api.service";
import { DatatableContentManager } from "app/gui/datatable";
import { Project } from "entities/project";

@Component({
  selector: 'admin-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends DatatableContentManager<Project> implements OnInit {
  constructor(
    restService: RestApiService,
  ) {
    super(restService, 'fetchProjects');
  }

  ngOnInit() {
    this.load();
  }

  add(): void {

  }

  rights(project: Project): void {

  }
}

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { RestApiService } from "app/services/rest-api.service";
import { DatatableContentManager } from "app/gui/datatable";
import { Project } from "entities/project";

@Component({
  selector: 'admin-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent extends DatatableContentManager<Project> implements OnInit {
  private _add$: EventEmitter<void> = new EventEmitter<void>();
  private _rights$: EventEmitter<Project> = new EventEmitter<Project>();
  private _edit$: EventEmitter<Project> = new EventEmitter<Project>();
  
  constructor(restService: RestApiService) {
    super(restService, 'fetchProjects');
  }

  ngOnInit() {
    this.load();
  }

  @Output('add') get add$(): EventEmitter<void> {
    return this._add$;
  }

  @Output('rights') get rights$(): EventEmitter<Project> {
    return this._rights$;
  }

  @Output('edit') get edit$(): EventEmitter<Project> {
    return this._edit$;
  }

  add(): void {
    this._add$.emit();
  }

  rights(project: Project): void {
    this._rights$.emit(project);
  }

  edit(project: Project): void {
    this._edit$.emit(project);
  }

  delete(project: Project): void {

  }
}

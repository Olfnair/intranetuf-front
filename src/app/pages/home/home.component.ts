import { Component, OnInit } from '@angular/core';
import { SessionService } from "app/shared/session.service";
import { Project } from "app/entities/project";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private _selectedProject: Project = undefined;

  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  get logged(): boolean {
    return this._session.logged;
  }

  get selectedProject(): Project {
    return this._selectedProject;
  }

  selectProject(project: Project): void {
    this._selectedProject = project;
  }
}

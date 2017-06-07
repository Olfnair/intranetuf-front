import { Component, OnInit } from '@angular/core';
import { SessionService } from "app/shared/session.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private _selectedProject: number = -1;

  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  get logged(): boolean {
    return this._session.logged;
  }

  get selectedProject(): number {
    return this._selectedProject;
  }

  selectProject(id: number): void {
    this._selectedProject = id;
  }
}

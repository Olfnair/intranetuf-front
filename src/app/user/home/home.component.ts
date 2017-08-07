import { Component, OnInit } from '@angular/core';
import { SessionService } from "app/services/session.service";
import { Project } from "entities/project";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private _session: SessionService) { }

  ngOnInit() {
  }

  get logged(): boolean {
    return this._session.logged;
  }
}

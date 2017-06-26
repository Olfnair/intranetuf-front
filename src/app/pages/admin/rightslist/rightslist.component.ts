import { Component, OnInit, Input } from '@angular/core';
import { User } from "app/entities/user";
import { ProjectRight } from "app/entities/project-right";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/shared/rest-api.service";
import { MdCheckboxChange } from "@angular/material";
import { Project } from "app/entities/project";

@Component({
  selector: 'app-rightslist',
  templateUrl: './rightslist.component.html',
  styleUrls: ['./rightslist.component.css']
})
export class RightslistComponent implements OnInit {

  private _user: User = undefined;
  private _rights: ProjectRight[] = [];
  private _rightsSub: Subscription = undefined;

  private _projectsList: Project[];

  constructor(private _restService: RestApiService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._unsub();
  }

  private _initRights() {
    this._rights = [];
    this._projectsList.forEach((project: Project) => {
      let right = new ProjectRight();
      right.user = this._user;
      right.project = project;
      right.right = 0;
      this._rights.push(right);
    });
  }

  private _unsub(): void {
    if(this._rightsSub) {
      this._rightsSub.unsubscribe
    }
  }

  @Input() set user(user: User) {
    this._user = user;
    this._unsub();
    this._rightsSub = this._restService.getRights(this._user)
      .finally(() => {
        this._unsub();
      })
      .subscribe(
        (rights: ProjectRight[]) => this._rights = rights
      )
  }

  get user(): User {
    return this._user;
  }

  get rights(): ProjectRight[] {
    return this._rights;
  }

  switchRight(event: MdCheckboxChange, projectRight: ProjectRight, right: number): void {
  }

}

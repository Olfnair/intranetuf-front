import { Component, OnInit, Input } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { User } from "app/entities/user";
import { RestApiService } from "app/shared/rest-api.service";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";

export enum ComponentState {
  LIST = 0,
  ADD = 1,
  EDIT = 2
}

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent implements OnInit {

  private _userSubscription: Subscription = undefined;
  private _users: User[] = [];
  private _state: number = ComponentState.LIST;
  private _checkedUsers: User[] = [];

  constructor(private _restService: RestApiService, private _router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
  }

  @Input() set selected(selected: boolean) {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
    if (selected) {
      this._userSubscription = this._restService.fetchUsers().subscribe((users: User[]) => this._users = users);
    }
  }

  get users(): User[] {
    return this._users;
  }

  add(): void {
    this._state = ComponentState.ADD;
  }

  get isListMode(): boolean {
    return this._state == ComponentState.LIST;
  }

  get isAddMode(): boolean {
    return this._state == ComponentState.ADD;
  }

  get isEditMode(): boolean {
    return this._state == ComponentState.EDIT;
  }

  activateListMode(submited: boolean) {
    if (submited) {
    }
    this._state = ComponentState.LIST;
  }

}

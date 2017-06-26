import { Component, OnInit, Input } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { User } from "app/entities/user";
import { RestApiService } from "app/shared/rest-api.service";
import { Subscription } from "rxjs/Subscription";
import { Router } from "@angular/router";

export enum ComponentState {
  LIST = 0,
  ADD = 1,
  EDIT = 2,
  RIGHTS = 3
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

  private _selectedUser: User = undefined;

  constructor(private _restService: RestApiService, private _router: Router) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
  }

  @Input() set selected(selected: boolean) {
    if (selected) {
      this._subscribeToUserList();
    }
  }

  private _subscribeToUserList(): void {
    if (this._userSubscription) {
      this._userSubscription.unsubscribe();
    }
    this._userSubscription = this._restService.fetchUsers().subscribe((users: User[]) => this._users = users);
  }

  get users(): User[] {
    return this._users;
  }


  private _setState(state: number) {
    this._state = state;
  }

  add(): void {
    this._setState(ComponentState.ADD);
  }

  rights(user: User): void {
    this._selectedUser = user;
    this._setState(ComponentState.RIGHTS);
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

  get isRightsMode(): boolean {
    return this._state == ComponentState.RIGHTS;
  }

  get selectedUser(): User {
    return this._selectedUser;
  }

  activateListMode(submited: boolean) {
    if (submited) {
      this._subscribeToUserList();
    }
    this._state = ComponentState.LIST;
  }

}

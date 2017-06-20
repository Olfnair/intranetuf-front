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
  /*private _checkAllTrue: boolean = false;
  private _checkAllFalse: boolean = false;*/

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

  /*get checkAllTrue(): boolean {
    return this._checkAllTrue;
  }

  get checkAllState(): boolean {
    if (this._checkAllTrue) { return true; }
    if (this._checkAllFalse) { return false; }
    return undefined;
  }

  setCheckAllState(event: MdCheckboxChange): void {
    this._checkAllTrue = event.checked;
    this._checkAllFalse = !event.checked;
  }

  check(event: MdCheckboxChange, user: User): void {
    let index: number = this._checkedUsers.indexOf(user);
    if (!event.checked && index !== -1) {
      this._checkedUsers.splice(index, 1);
      this._checkAllTrue = false;
    }
    else if (event.checked && index === -1) {
      this._checkedUsers.push(user);
    }
    console.log(JSON.stringify(this._checkedUsers));
  }*/

}

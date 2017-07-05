import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { User } from "entities/user";

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
  
  private _users: Observable<User[]> = undefined;
  private _state: number = ComponentState.LIST;
  private _checkedUsers: User[] = [];

  private _selectedUser: User = undefined;

  constructor(
    private _session: SessionService,
    private _restService: RestApiService,
    private _router: Router
  ) { }

  ngOnInit() {
  }

  updateUsers(): void {
    this._users = this._restService.fetchUsers();
  }

  @Input() set selected(selected: boolean) {
    if (selected) {
      this.updateUsers();
    }
  }

  get users(): Observable<User[]> {
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
      this.updateUsers();
    }
    this._state = ComponentState.LIST;
  }

  adminLoginAs(login: string): void {
    let sub: Subscription = this._session.adminLoginAs(login).finally(() => {
      sub.unsubscribe();
    }).subscribe((success: boolean) => {
      if(success) {
        this._router.navigate(['/home']);
      }
    });
  }

}

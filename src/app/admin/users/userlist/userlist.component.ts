import { Component, Input, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { BasicRoleChecker, RoleCheckerService } from "app/services/role-checker";
import { DatatablePaginator, DatatableQueryParams } from "app/gui/datatable";
import { User } from "entities/user";
import { FlexQueryResult } from "objects/flex-query-result";

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
  private _usersPaginator: DatatablePaginator<User> = new DatatablePaginator<User>(2);
  private _usersPaginatorObs: Observable<DatatablePaginator<User>> = undefined;
  private _state: number = ComponentState.LIST;
  private _checkedUsers: User[] = [];

  private _selectedUser: User = undefined;

  private _params: DatatableQueryParams = undefined;

  constructor(
    private _session: SessionService,
    private _restService: RestApiService,
    private _roleCheckerService: RoleCheckerService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.updateUsers();
  }

  updateUsers(): void {
    this._usersPaginatorObs = this._usersPaginator.update(this._restService, 'fetchUsers', this._params);
  }

  paramsChange(params: DatatableQueryParams): void {
    this._params = params;
    this.updateUsers();
  }

  get users(): Observable<DatatablePaginator<User>> {
    return this._usersPaginatorObs;
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

  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
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
    }).subscribe(
      (success: Response) => {
        this._router.navigate(['/home']);
      },
      (error: Response) => {
        // TODO : afficher un beau message d'erreur (hints : utiliser le composant InfoModal)
      }
    );
  }
}
import { Component, Input } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { DefaultRoleChecker } from "app/shared/role-checker";
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
export class UserlistComponent extends DefaultRoleChecker {
  private _usersPaginator: DatatablePaginator<User> = new DatatablePaginator<User>(2);
  private _usersPaginatorObs: Observable<DatatablePaginator<User>> = undefined;
  private _state: number = ComponentState.LIST;
  private _checkedUsers: User[] = [];

  private _selectedUser: User = undefined;

  private _params: DatatableQueryParams = undefined;

  constructor(
    session: SessionService,
    private _restService: RestApiService,
    private _router: Router
  ) { super(session); }

  updateUsers(): void {
    let searchParams: string = this._params ? this._params.searchParams.toString() : 'default';
    let orderparams: string = this._params ? this._params.orderParams.toString() : 'default';
    let index: number = this._params ? this._params.index : 0;
    let limit: number = this._params ? this._params.limit : this._usersPaginator.pagesSize;

    this._usersPaginator.reloadBetweenPages = false;

    this._usersPaginatorObs = Observable.create((observer: Observer<DatatablePaginator<User>>) => {
      let sub = this._restService.fetchUsers(
        searchParams, orderparams, index, limit
      ).finally(() => {
        observer.complete();
        sub.unsubscribe();
      }).subscribe(
        (result: FlexQueryResult) => {
          this._usersPaginator.goToIndex(index, result.list ? result.list : [], result.totalCount);
          observer.next(this._usersPaginator);
        },
        (error: Response) => {
          observer.error(error);
        }
      );
    });
  }

  paramsChange(params: DatatableQueryParams): void {
    this._params = params;
    this.updateUsers();
  }

  @Input() set selected(selected: boolean) {
    if (selected) {
      this.updateUsers();
    }
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

  activateListMode(submited: boolean) {
    if (submited) {
      this.updateUsers();
    }
    this._state = ComponentState.LIST;
  }

  adminLoginAs(login: string): void {
    let sub: Subscription = this.session.adminLoginAs(login).finally(() => {
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

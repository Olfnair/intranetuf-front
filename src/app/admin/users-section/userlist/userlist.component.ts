import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { Response } from "@angular/http";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { BasicRoleChecker, RoleCheckerService } from "app/services/role-checker";
import { DatatableContentManager } from "app/gui/datatable";
import { User, Roles } from "entities/user";
import { FlexQueryResult } from "objects/flex-query-result";

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent extends DatatableContentManager<User, RestApiService> implements OnInit {
  private _add$: EventEmitter<void> = new EventEmitter<void>();
  private _edit$: EventEmitter<User> = new EventEmitter<User>();
  private _rights$: EventEmitter<User> = new EventEmitter<User>();

  constructor(
    restService: RestApiService,
    private _session: SessionService,
    private _roleCheckerService: RoleCheckerService,
    private _router: Router
  ) {
    super(restService, 'fetchUsers');
  }

  ngOnInit() {
    this.load();
  }

  @Output('add') get add$(): EventEmitter<void> {
    return this._add$;
  }

  @Output('edit') get edit$(): EventEmitter<User> {
    return this._edit$;
  }

  @Output('rights') get rights$(): EventEmitter<User> {
    return this._rights$;
  }

  add(): void {
    this._add$.emit();
  }

  edit(user: User) {
    this._edit$.emit(user);
  }

  rights(user: User): void {
    this._rights$.emit(user);
  }

  delete(user: User): void {
    
  }

  get roleChecker(): BasicRoleChecker {
    return this._roleCheckerService;
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

  isSuperAdmin(user: User): boolean {
    return User.hasRole(user.role, Roles.SUPERADMIN);
  }
}

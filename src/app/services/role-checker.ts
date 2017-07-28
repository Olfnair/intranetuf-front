import { Injectable } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RestLong } from "objects/rest-long";
import { User, Roles } from "entities/user";

export class BasicRoleChecker {
  protected _role: number = 0;
  protected _loading: boolean = true;

  constructor() { }

  public directLoad(role: number) {
    this._role = role;
    this._loading = false;
  }

  public reset(): void {
    this._role = 0;
    this._loading = true;
  }

  public loading(): boolean {
    return this._loading;
  }

  public userIsAdmin(): boolean {
    return ! this.loading() && (User.hasRole(this._role, Roles.ADMIN) || User.hasRole(this._role, Roles.SUPERADMIN));
  }

  public userIsSuperAdmin(): boolean {
    return ! this.loading() && User.hasRole(this._role, Roles.SUPERADMIN);
  }
}

@Injectable()
export class RoleCheckerService extends BasicRoleChecker {
  constructor() { super(); }
}

export abstract class RoleChecker extends BasicRoleChecker implements AuthorizationChecker {
  constructor(
    private _restService: RestApiService,
    private _dependingRoleChecker: BasicRoleChecker = undefined
  ) { super(); }

  public abstract check(): boolean;
  
  public load(): Observable<boolean> {
    this._loading = true;
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this._restService.getUserRole().finally(() => {
        sub.unsubscribe();
        observer.complete();
      }).subscribe(
        (role: RestLong) => {
          this._role = role.value;
          this._loading = false;
          this.directLoad(role.value);
          if(this._dependingRoleChecker) { this._dependingRoleChecker.directLoad(role.value); }
          observer.next(true);
        },
        (error: Response) => {
          this.directLoad(0);
          if(this._dependingRoleChecker) { this._dependingRoleChecker.directLoad(0); }
          observer.next(false);
        },
      );
    });
  }

  public loadRole(): void {
    let sub: Subscription = this.load().finally(() => sub.unsubscribe()).subscribe();
  }
}

export class DefaultRoleChecker extends RoleChecker {
  public check(): boolean {
    // par defaut, on bloque tout
    return false;
  }
}

export class EmptyRoleChecker extends RoleChecker {
  public check(): boolean {
    // on ne vérifie rien
    return true;
  }
}

export class AdminRoleChecker extends RoleChecker {
  constructor(restService: RestApiService, dependingRoleChecker: BasicRoleChecker = undefined) {
    super(restService, dependingRoleChecker);
  }

  public check(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }
}
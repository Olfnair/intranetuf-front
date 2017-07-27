import { RestApiService } from "app/services/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RestLong } from "objects/rest-long";
import { User, Roles } from "entities/user";

export abstract class RoleChecker implements AuthorizationChecker {
  private _role: number = 0;
  private _loading: boolean = true;

  constructor(private _restService: RestApiService) { }

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
          observer.next(true);
        },
        (error: Response) => {
          this._role = 0;
          observer.next(false);
        },
      );
    });
  }

  public loadRole(): void {
    let sub: Subscription = this.load().finally(() => sub.unsubscribe()).subscribe();
  }

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

export class DefaultRoleChecker extends RoleChecker {
  constructor(restService : RestApiService) {
    super(restService);
  }

  public check(): boolean {
    return false;
  }
}

export class AdminRoleChecker extends RoleChecker {
  constructor(restService : RestApiService) {
    super(restService);
  }

  public check(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }
}
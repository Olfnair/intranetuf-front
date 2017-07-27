import { SessionService } from "app/services/session.service";
import { Observable } from "rxjs/Observable";

export abstract class RoleChecker {
  constructor(private _session: SessionService) { }

  public loadRole(): Observable<boolean> {
    return this._session.loadRole();
  }

  public get session(): SessionService {
    return this._session;
  }

  public userIsAdmin(): boolean {
    return ! this.roleLoading() && this._session.userIsAdmin;
  }

  public userIsSuperAdmin(): boolean {
    return ! this.roleLoading() && this._session.userIsSuperAdmin;
  }

  public roleLoading(): boolean {
    return this._session.roleLoading;
  }
  
  public abstract roleCheck(): boolean;
}

export class DefaultRoleChecker extends RoleChecker {
  constructor(session : SessionService) {
    super(session);
  }

  public roleCheck(): boolean {
    return false;
  }
}

export class AdminRoleChecker extends RoleChecker { 
  public roleCheck(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }
}
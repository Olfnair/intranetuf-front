import { SessionService } from "app/services/session.service";

export abstract class RoleChecker {
  constructor(private _session: SessionService) { }

  public get session(): SessionService {
    return this._session;
  }

  public userIsAdmin(): boolean {
    return this._session.userIsAdmin;
  }

  public userIsSuperAdmin(): boolean {
    return this._session.userIsSuperAdmin;
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
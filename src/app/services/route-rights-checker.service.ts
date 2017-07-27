import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { SessionService } from "app/services/session.service";
import { RoleChecker, AdminRoleChecker } from "app/services/role-checker";
import { RightsChecker } from "app/services/rights-checker";

@Injectable()
export abstract class RouteRightsCheckerService implements CanActivate {

  private _roleChecker: RoleChecker = new AdminRoleChecker(this._session);
  private _rightsChecker: RightsChecker = new RightsChecker(this._session);

  constructor(private _session: SessionService, private _router: Router) { }

  public abstract getProjectId(): number;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {   
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this._session.loadRole().finally(() => {
        observer.complete();
        sub.unsubscribe();
      }).subscribe((loaded: boolean) => {
        if(loaded) {
          let userIsAuthorized: boolean = this._roleChecker.roleCheck();
          if(! userIsAuthorized) {
            this._router.navigate(['/']);
          }
          observer.next(userIsAuthorized);
        }
        else {
          observer.next(false);
        }
      })
    });
  }
}

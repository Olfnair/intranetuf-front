import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RoleChecker, AdminRoleChecker } from "app/services/role-checker";
import { RightsChecker } from "app/services/rights-checker";

export class RouteAccessChecker {

  private _authorizationCheckers: AuthorizationChecker[] = [];

  constructor(
    private _router: Router,
    private _roleChecker: RoleChecker = undefined,
    private _rightsChecker: RightsChecker = undefined
  ) {
    if(this._roleChecker)     this._authorizationCheckers.push(this._roleChecker);
    if(this._rightsChecker)   this._authorizationCheckers.push(this._rightsChecker);
  }

  private static check(authorizationChecker: AuthorizationChecker): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = authorizationChecker.load().finally(() => {
        observer.complete();
        sub.unsubscribe();
      }).subscribe((loaded: boolean) => {
        console.log('result check: ' + (loaded ? authorizationChecker.check() : false));
        console.log('loaded: ' + loaded);
        console.log('authorizationChecker.check(): ' + authorizationChecker.check());
        loaded ? observer.next(authorizationChecker.check()) : observer.next(false);
      })
    });
  }

  private checkAuthorizationsOver(isEnd: boolean, conjunction: boolean, observer: Observer<boolean>): void {
    // conjonction : vrai si on est au bout, faux sinon
    // disjonction : faux si on est au bout, vrai sinon
    console.log('checkAuthorizationsOver: ' + (conjunction ? isEnd : ! isEnd));
    console.log('cunjunction: ' + conjunction);
    console.log('isEnd: ' + isEnd);
    observer.next(conjunction ? isEnd : ! isEnd);
    observer.complete();
    if(conjunction && ! isEnd || ! conjunction && isEnd) {
      this._router.navigate(['/']); // si faux, on va à l'accueil
    }
  }

  // méthode récursive :
  // conjonction des authorizations (ET logique) (conjunction = true)
  // ou par defaut
  // disjonction des authorizations (OU logique) (conjunction = false)
  private checkAuthorizations(startIndex: number, observer: Observer<boolean>, conjunction: boolean = false): void {
    
    // fin de la récursion, on a parcouru tous les éléments :
    if(startIndex >= this._authorizationCheckers.length) {
      // conjonction => vrai : toutes les clauses sont vraies
      // disjonction => faux : aucune clause n'était vraie jusqu'à présent, or on est arrivé au bout...
      this.checkAuthorizationsOver(true, conjunction, observer);
      return;
    }
    
    let sub: Subscription = RouteAccessChecker.check(this._authorizationCheckers[startIndex]).finally(() => {
      sub.unsubscribe();
    }).subscribe((hasAccess: boolean) => {
      // récursion :
      if(conjunction ? hasAccess : ! hasAccess) {
        // conjonction : la clause courante est vraie => on continue
        // disjonction : la clause courante est fausse => on continue
        this.checkAuthorizations(startIndex + 1, observer, conjunction);
      }
      // fin de récursion anticipée :
      else {
        // conjonction => faux : la clause courante est fausse => fin
        // disjonction => vrai : la clause courante est vraie => fin
        this.checkAuthorizationsOver(false, conjunction, observer);
      }
    });
  }

  public isAuhthorized(conjonction: boolean = false): Observable<boolean> {   
    return Observable.create((observer: Observer<boolean>) => {
      this.checkAuthorizations(0, observer);
    });
  }

  public addAuthorizationChecker(authorizationChecker: AuthorizationChecker): void {
    this._authorizationCheckers.push(authorizationChecker);
  }
}

@Injectable()
export class AdminRouteAccessChecker extends RouteAccessChecker implements CanActivate {
  constructor(restService: RestApiService, router: Router) {
    super(router, new AdminRoleChecker(restService));
  }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isAuhthorized();
  }
}
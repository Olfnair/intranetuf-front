import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RoleChecker, AdminRoleChecker, RoleCheckerService, EmptyRoleChecker } from "app/services/role-checker";
import { RightsChecker } from "app/services/rights-checker";
import { RestLong } from "objects/rest-long";

class UserIsAuthorChecker implements AuthorizationChecker {
  private _fileId = undefined;
  private _loading = true;
  private _check = false;

  constructor(private _restService: RestApiService, fileId: number = undefined) {
    this._fileId = fileId;
  }
  
  check(): boolean {
    return ! this._loading && this._check;
  }

  load(): Observable<boolean> {
    if(this._fileId == undefined) {
      return Observable.create((observer: Observer<boolean>) => {
        observer.next(false);
        observer.complete();
      });
    }
    return Observable.create((observer: Observer<boolean>) => {
      this._loading = true;
      let sub: Subscription = this._restService.userIsFileAuthor(this._fileId).finally(() => {
        sub.unsubscribe();
        observer.complete();
      }).subscribe(
        (userIsAuthor: RestLong) => {
          (userIsAuthor.value > 0) ? this._check = true : this._check = false;
          this._loading = false;
          observer.next(this._check);
        },
        (error: Response) => {
          this._loading = false;
          observer.next(false);
        }
      );
    });
  }

}

class AddFileRightsChecker extends RightsChecker {
  public check(): boolean {
    return this.userCanAddFiles();
  }
}

class RouteAccessChecker {
  private _authorizationCheckers: AuthorizationChecker[] = [];

  constructor(
    private _router: Router,
    private _roleChecker: RoleChecker = undefined,
    private _rightsChecker: RightsChecker = undefined
  ) {
    if(this._roleChecker)     this._authorizationCheckers.push(this._roleChecker);
    if(this._rightsChecker)   this._authorizationCheckers.push(this._rightsChecker);
  }

  get router(): Router {
    return this._router;
  }

  get rightsChecker(): RightsChecker {
    return this._rightsChecker;
  }

  get roleChecker(): RoleChecker {
    return this._roleChecker;
  }

  private static check(authorizationChecker: AuthorizationChecker): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = authorizationChecker.load().finally(() => {
        observer.complete();
        sub.unsubscribe();
      }).subscribe((loaded: boolean) => {
        loaded ? observer.next(authorizationChecker.check()) : observer.next(false);
      })
    });
  }

  private checkAuthorizationsOver(isEnd: boolean, observer: Observer<boolean>, conjunction: boolean): void {
    // conjonction : vrai si on est au bout, faux sinon
    // disjonction : faux si on est au bout, vrai sinon
    observer.next(conjunction ? isEnd : ! isEnd);
    observer.complete();
    if(conjunction && ! isEnd || ! conjunction && isEnd) {
      this._router.navigate(['/']); // faux, on va à l'accueil
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
      this.checkAuthorizationsOver(true, observer, conjunction);
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
        this.checkAuthorizationsOver(false, observer, conjunction);
      }
    });
  }

  public isAuhthorized(conjunction: boolean = false): Observable<boolean> {   
    return Observable.create((observer: Observer<boolean>) => {
      this.checkAuthorizations(0, observer, conjunction);
    });
  }

  public clearAuthorizationCheckers(): void {
    this._authorizationCheckers = [];
  }

  public addAuthorizationChecker(authorizationChecker: AuthorizationChecker): void {
    this._authorizationCheckers.push(authorizationChecker);
  }

  public setAuthorizationsCheckers(authorizationCheckers: AuthorizationChecker[] = []): void {
    this._authorizationCheckers = authorizationCheckers;
  }
}

class ConjunctiveRouteAccessChecker extends RouteAccessChecker implements CanActivate {   
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isAuhthorized(true); // conjonction (ET logique) des clauses (role et rights checker)
  }
}

class DisjunctiveRouteAccessChecker extends RouteAccessChecker implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isAuhthorized(false); // disjonction (OU logique) des clauses (role et rights checker)
  }
}

abstract class AbstractConjunctiveRouteAccessChecker extends ConjunctiveRouteAccessChecker {
  constructor(
    router: Router,
    protected _restService: RestApiService,
    protected _roleCheckerService: RoleCheckerService
  ) { super(router); }

  public abstract setCheckers(route: ActivatedRouteSnapshot): void;

  /* 
   * @override
   */ 
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.setCheckers(route);
    return super.canActivate(route, state);
  }
}

abstract class AbstractDisjunctiveRouteAccessChecker extends DisjunctiveRouteAccessChecker {
  constructor(
    router: Router,
    protected _restService: RestApiService,
    protected _roleCheckerService: RoleCheckerService
  ) { super(router); }

  public abstract setCheckers(route: ActivatedRouteSnapshot): void;

  /* 
   * @override
   */ 
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this.setCheckers(route);
    return super.canActivate(route, state);
  }
}

@Injectable()
export class EmptyRouteAccessChecker extends RouteAccessChecker implements CanActivate {
  constructor(restService: RestApiService, router: Router, roleCheckerService: RoleCheckerService) {
    super(router, new EmptyRoleChecker(restService, roleCheckerService));
  }

  /*
   * force le retour à true, juste pour éviter une boucle infinie en cas de redirection si le back end a planté
   * 
   * @override
   */ 
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.isAuhthorized(false); // disjonction (OU logique) des clauses (role et rights checker)
      observer.next(true);
      observer.complete();
    });
  }
}

@Injectable()
export class AdminRouteAccessChecker extends ConjunctiveRouteAccessChecker {
  constructor(router: Router, restService: RestApiService, roleCheckerService: RoleCheckerService) {
    super(router, new AdminRoleChecker(restService, roleCheckerService));
  }
}

@Injectable()
export class AddFileRouteAccessChecker extends AbstractDisjunctiveRouteAccessChecker {   
  constructor(
    router: Router,
    restService: RestApiService,
    roleCheckerService: RoleCheckerService
  ) {
    super(router, restService, roleCheckerService);
  }

  setCheckers(route: ActivatedRouteSnapshot): void {
    this.setAuthorizationsCheckers([
      new AdminRoleChecker(this._restService, this._roleCheckerService),
      new AddFileRightsChecker(this._restService, parseInt(route.params.projectId))
    ]);
  }
}

class AdminOrAddFileRightChecker extends AbstractDisjunctiveRouteAccessChecker implements AuthorizationChecker {
  private _loading = true;
  private _check = false;

  constructor(
    router: Router,
    restService: RestApiService,
    roleCheckerService: RoleCheckerService,
    private _route: ActivatedRouteSnapshot
  ) {
    super(router, restService, roleCheckerService);
  }

  setCheckers(route: ActivatedRouteSnapshot): void {
    this.setAuthorizationsCheckers([
      new AdminRoleChecker(this._restService, this._roleCheckerService),
      new AddFileRightsChecker(this._restService, parseInt(route.params.projectId))
    ]);
  }
  
  check(): boolean {
    return ! this._loading && this._check;
  }

  load(): Observable<boolean> {
    this._loading = true;
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this.canActivate(this._route, null).finally(() => {
        sub.unsubscribe();
        observer.complete();
      }).subscribe(
        (canActivate: boolean) => {
          this._check = canActivate;
          this._loading = false;
          observer.next(true);
        },
        (error: any) => {
          this._loading = false;
          observer.next(false);
        }
      );
    });
  }
}

@Injectable()
export class UpdateFileVersionRouteAccessChecker extends AbstractConjunctiveRouteAccessChecker {
  constructor(
    router: Router,
    restService: RestApiService,
    roleCheckerService: RoleCheckerService
  ) {
    super(router, restService, roleCheckerService);
  }

  public setCheckers(route: ActivatedRouteSnapshot): void {
    this.setAuthorizationsCheckers([
      new AdminOrAddFileRightChecker(this.router, this._restService, this._roleCheckerService, route),
      new UserIsAuthorChecker(this._restService, parseInt(route.params.fileId))
    ]);
  }
}

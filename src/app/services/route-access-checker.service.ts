/**
 * Auteur : Florian
 * License : 
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RoleChecker, AdminRoleChecker, RoleCheckerService, EmptyRoleChecker } from "app/services/role-checker";
import { RightsChecker } from "app/services/rights-checker";

/**
 * Vérifie l'accès à une route pour un utilisateur
 */
class RouteAccessChecker {
  
  /** autorisations à vérifier */
  private _authorizationCheckers: AuthorizationChecker[] = [];

  /**
   * @constructor
   * @param {Router} _router - routeur
   * @param {RoleChecker} _roleChecker - vérificateur de rôles
   * @param {RightsChecker} _rightsChecker - vérificateur de droits
   */
  constructor(
    private _router: Router,
    private _roleChecker: RoleChecker = undefined,
    private _rightsChecker: RightsChecker = undefined
  ) {
    if(this._roleChecker)     this._authorizationCheckers.push(this._roleChecker);
    if(this._rightsChecker)   this._authorizationCheckers.push(this._rightsChecker);
  }

  /** @property {Router} router - routeur */
  get router(): Router {
    return this._router;
  }

  /** @property {RightsChecker} rightsChecker - vérifcateur de droits */
  get rightsChecker(): RightsChecker {
    return this._rightsChecker;
  }

  /** @property {RoleChecker} roleChecker - vérificateur de rôles */
  get roleChecker(): RoleChecker {
    return this._roleChecker;
  }

  /**
   * Charge et vérifie l'autorisation
   * @param {AuthorizationChecker} authorizationChecker - autorisation à vérifier
   * @returns {Observable<boolean>} - Observable qui indique la fin du check : true si ok, sinon false 
   */
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

  /**
   * Mets fin à la récursion de checkAuthorizations et renvoie le résultat
   * @private
   * @param {boolean} isEnd - true indique qu'on est arrivé au bout de la récursion, false que non
   * @param {Observer} observer - observer sur lequel envoyer le résultat (true ou false)
   * @param {boolean} conjunction - true indique une conjonction de clauses, false une disjonction
   */
  private checkAuthorizationsOver(isEnd: boolean, observer: Observer<boolean>, conjunction: boolean): void {
    // conjonction : vrai si on est au bout, faux sinon
    // disjonction : faux si on est au bout, vrai sinon
    observer.next(conjunction ? isEnd : ! isEnd);
    observer.complete();
    if(conjunction && ! isEnd || ! conjunction && isEnd) {
      this._router.navigate(['/']); // faux, on va à l'accueil
    }
  }

  /**
   * Vérification des autorisations sous forme de clauses conjonctives ou disjonctives par récursion
   * - Conjonction : OU logique
   * - Disjonction : ET logique
   * @private
   * @param {number} startIndex - index à partir duquel on commence dans le tableau des autorisations
   * @param {Observer} observer - Observer sur lequel envoyer le résultat de la disjonction/conjonction
   * @param {boolean} conjunction - true indique une conjonction de clauses, false une disjonction
   */
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

  
  /**
   * Indique si l'utilisateur courant peut accéder à la route ou non en fonction des autorisations à vérifier
   * @param {boolean} conjunction - true indique qu'il faut vérifier les autorisations par conjonction,
   *                                false par disjonction
   * @returns {Observable<boolean>} indique la fin de la vérification : true => accès, false => pas accès
   */
  public isAuthorized(conjunction: boolean = false): Observable<boolean> {   
    return Observable.create((observer: Observer<boolean>) => {
      this.checkAuthorizations(0, observer, conjunction);
    });
  }

  /**
   * Vide la liste des autorisations à vérifier
   */
  public clearAuthorizationCheckers(): void {
    this._authorizationCheckers = [];
  }

  /**
   * Ajoute une autorisation à vérifier
   * @param {AuthorizationChecker} authorizationChecker - l'autorisation à vérifier qu'on veut ajouter
   */
  public addAuthorizationChecker(authorizationChecker: AuthorizationChecker): void {
    this._authorizationCheckers.push(authorizationChecker);
  }

  /**
   * Remplace les autorisations à vérifier actuelles par celles passées en paramètre
   * @param {AuthorizationChecker[]} authorizationCheckers - les autorisations à vérifier
   */
  public setAuthorizationsCheckers(authorizationCheckers: AuthorizationChecker[] = []): void {
    this._authorizationCheckers = authorizationCheckers;
  }
}

/**
 * Vérifie l'accès à la route par conjonction des clauses
 */
class ConjunctiveRouteAccessChecker extends RouteAccessChecker implements CanActivate {   
  /**
   * Indique si la route peut-être activée ou non par l'utilisateur
   * @param {ActivatedRouteSnapshot} route - la route qu'on veut activer
   * @param {RouterStateSnapshot} state 
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isAuthorized(true); // conjonction (ET logique) des clauses (role et rights checker)
  }
}

/**
 * Vérifie l'accès à la route par disjonction des clauses
 */
class DisjunctiveRouteAccessChecker extends RouteAccessChecker implements CanActivate {
  /**
   * Indique si la route peut-être activée ou non par l'utilisateur
   * @param {ActivatedRouteSnapshot} route - la route qu'on veut activer
   * @param {RouterStateSnapshot} state 
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isAuthorized(false); // disjonction (OU logique) des clauses (role et rights checker)
  }
}

/**
 * Service qui ne vérifie rien : utilisé pour garder les rôles de l'utilisateur à jour lors de l'activation de routes
 */
@Injectable()
export class EmptyRouteAccessChecker extends RouteAccessChecker implements CanActivate {
  constructor(restService: RestApiService, router: Router, roleCheckerService: RoleCheckerService) {
    super(router, new EmptyRoleChecker(restService, roleCheckerService));
  }

  /**
   * Force le retour à true, juste pour éviter une boucle infinie en cas de redirection si le back end a planté
   * @override
   */ 
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      this.isAuthorized(false); // disjonction (OU logique) des clauses (role et rights checker)
      observer.next(true);
      observer.complete();
    });
  }
}

/**
 * Service qui vérifie que l'utilisateur est bien un admin ou superadmin avant d'activer la route
 */
@Injectable()
export class AdminRouteAccessChecker extends ConjunctiveRouteAccessChecker {
  constructor(router: Router, restService: RestApiService, roleCheckerService: RoleCheckerService) {
    super(router, new AdminRoleChecker(restService, roleCheckerService));
  }
}

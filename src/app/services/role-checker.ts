/**
 * Auteur : Florian
 * License : 
 */

import { Injectable } from "@angular/core";
import { RestApiService } from "app/services/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { Subscription } from "rxjs/Subscription";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { RestLong } from "objects/rest-long";
import { User, Roles } from "entities/user";

/**
 * Vérificateur de rôle
 */
export class BasicRoleChecker {
  
  /** rôle(s) */
  protected _role: number = 0;
  /** chargement en cours ou non */
  protected _loading: boolean = true;

  /** @constructor */
  constructor() { }

  /**
   * Affecte le rôle directement sans chargement
   * @param {number} role - valeur à affecter au rôle
   */
  public directLoad(role: number): void {
    this._role = role;
    this._loading = false;
  }

  /**
   * Réinitialise le RoleChecker
   */
  public reset(): void {
    this._role = 0;
    this._loading = true;
  }

  /**
   * Indique si un chargement est en cours ou non
   * @returns {boolean} true si chargement en cours, sinon false
   */
  public loading(): boolean {
    return this._loading;
  }

  /**
   * Indique si l'utilisateur actuel est admin (ou superadmin)
   * @returns {boolean} - true si l'utilisateur est admin, sinon false
   */
  public userIsAdmin(): boolean {
    return ! this.loading() && (User.hasRole(this._role, Roles.ADMIN) || User.hasRole(this._role, Roles.SUPERADMIN));
  }

  /**
   * Indique si l'utilisateur est superadmin
   * @returns {boolean} - true si l'utilisateur est superadmin, sinon false
   */
  public userIsSuperAdmin(): boolean {
    return ! this.loading() && User.hasRole(this._role, Roles.SUPERADMIN);
  }
}

/**
 * Service de vérification de rôles
 */
@Injectable()
export class RoleCheckerService extends BasicRoleChecker {
  /** @constructor */
  constructor() { super(); }
}

/**
 * Vérificateur de rôles abstrait
 */
export abstract class RoleChecker extends BasicRoleChecker implements AuthorizationChecker {
  
  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé pour charger les rôles 
   * @param {BasicRoleChecker} _dependingRoleChecker - RoleChecker à mettre à jour en même temps que celui-ci 
   */
  constructor(
    private _restService: RestApiService,
    private _dependingRoleChecker: BasicRoleChecker = undefined
  ) { super(); }

  /**
   * Indique si l'utilisateur actuel a le rôle qu'on veut ou non
   * @returns {boolean} true si l'utilisateur a le(s) rôle(s) voulu(s), sinon false
   */
  public abstract check(): boolean;
  
  /**
   * Chargement des rôles depuis le backend
   * @returns {Observable<boolean>} - Observable qui indique la fin du chargement : true si chargé, false sinon
   */
  public load(): Observable<boolean> {
    this._loading = true;
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this._restService.getUserRole().finally(() => {
        sub.unsubscribe();      // libère les ressources
        observer.complete();
      }).subscribe(
        (role: RestLong) => {   // OK, chargement réussi :
          this._role = role.value;
          this._loading = false;
          this.directLoad(role.value);
          if(this._dependingRoleChecker) {
            // mise à jour directe du RoleChecker dépendant
            this._dependingRoleChecker.directLoad(role.value);
          }
          observer.next(true);
        },
        (error: Response) => {   // Erreur pdt le chargement :
          this.directLoad(0);
          if(this._dependingRoleChecker) {
            // mise à jour directe du RoleChecker dépendant
            this._dependingRoleChecker.directLoad(0);
          }
          observer.next(false);
        },
      );
    });
  }

  /**
   * Chargement du/des rôle(s)
   */
  public loadRole(): void {
    let sub: Subscription = this.load().finally(() => sub.unsubscribe()).subscribe();
  }
}

/**
 * Implémentation par defaut de RoleChecker
 */
export class DefaultRoleChecker extends RoleChecker {
  
  /**
   * Implémentation par défaut : tjrs faux
   * @returns {boolean} - false
   */
  public check(): boolean {
    // par defaut, on bloque tout
    return false;
  }

}

/**
 * RoleChecker qui ne vérifie rien
 */
export class EmptyRoleChecker extends RoleChecker {
  
  /**
   * Vérification vide : tjrs vrai
   * @returns {boolean} - true
   */
  public check(): boolean {
    // on ne vérifie rien
    return true;
  }

}

/**
 * RoleChecker qui vérifie si l'utilisateur est admin ou superadmin
 */
export class AdminRoleChecker extends RoleChecker {

  /**
   * Indique si l'utilisateur est admin (ou superadmin)
   * @returns {boolean} - true si l'utilisateur est admin, sinon false
   */
  public check(): boolean {
    return this.userIsAdmin() || this.userIsSuperAdmin();
  }

}
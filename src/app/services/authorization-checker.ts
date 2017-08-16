/**
 * Auteur : Florian
 * License : 
 */

import { Observable } from "rxjs/Observable";

/**
 * Interface pour gérer les autorisations/accès
 */
export interface AuthorizationChecker {
  check(): boolean;
  load(): Observable<boolean>;
}
import { Observable } from "rxjs/Observable";

export interface AuthorizationChecker {
  check(): boolean;
  load(): Observable<boolean>;
}
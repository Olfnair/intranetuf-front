import { RestApiService } from "app/services/rest-api.service";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { AuthorizationChecker } from "app/services/authorization-checker";
import { ProjectRight, Right } from "entities/project-right";
import { Subscription } from "rxjs/Subscription";

export abstract class RightsChecker implements AuthorizationChecker {
  private _projectId: number = undefined;
  private _loading: boolean = true;
  private _rights: number = 0;

  constructor(private _restService: RestApiService, projectId: number = undefined) {
    this._projectId = projectId;
  }

  public abstract check(): boolean;

  public load(): Observable<boolean> {
    if(this._projectId == undefined) {
      return Observable.create((observer: Observer<boolean>) => {
        observer.next(false);
        observer.complete();
      });
    }
    this._loading = true;
    return Observable.create((observer: Observer<boolean>) => {
      let sub: Subscription = this._restService.getRightsForUserByProject(this._projectId).finally(() => {
        sub.unsubscribe();
        observer.complete();
      }).subscribe(
        (projectRights: ProjectRight[]) => {
          projectRights.length > 0 ? this._rights = projectRights[0].rights : this._rights = 0;
          this._loading = false;
          observer.next(true);
        },
        (error: Response) => {
          this._rights = 0;
          observer.next(false);
        }
      );
    });
  }

  public loadRights(projectId: number): void {
    this._projectId = projectId;
    let sub: Subscription = this.load().finally(() => sub.unsubscribe()).subscribe();
  }

  public set projectId(projectId: number) {
    this._projectId = projectId;
  }

  public loading(): boolean {
    return this._loading;
  }

  public userCanView(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.VIEWPROJECT);
  }

  public userCanAddFiles(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.ADDFILES);
  }

  public userCanDeleteFiles(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.DELETEFILES);
  }

  public userCanEditProject(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.EDITPROJECT);
  }

  public userCanDeleteProject(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.DELETEPROJECT);
  }

  public userIsController(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.CONTROLFILE);
  }

  public userIsValidator(): boolean {
    return ! this.loading() && ProjectRight.hasRight(this._rights, Right.VALIDATEFILE);
  }
}

export class DefaultRightsChecker extends RightsChecker {
  public check(): boolean {
    return false;
  }
}

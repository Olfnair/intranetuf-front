import { SessionService } from "app/services/session.service";
import { Observable } from "rxjs/Observable";
import { ProjectRight, Right } from "entities/project-right";

export class RightsChecker {
  constructor(private _session: SessionService) { }

  public loadRights(projectId: number): Observable<boolean> {
    return this._session.loadRightsForProject(projectId);
  }

  public get session(): SessionService {
    return this._session;
  }

  public get userRights(): number {
    return this._session.userRights;
  }

  public rightsLoading(): boolean {
    return this._session.rightsLoading;
  }

  public userCanView(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.VIEWPROJECT);
  }

  public userCanAddFiles(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.ADDFILES);
  }

  public userCanDeleteFiles(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.DELETEFILES);
  }

  public userCanEditProject(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.EDITPROJECT);
  }

  public userCanDeleteProject(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.DELETEPROJECT);
  }

  public userIsController(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.CONTROLFILE);
  }

  public userIsValidator(): boolean {
    return ! this.rightsLoading() && ProjectRight.hasRight(this.userRights, Right.VALIDATEFILE);
  }
}
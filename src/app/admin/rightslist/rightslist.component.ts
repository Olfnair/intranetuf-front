import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";
import { User } from "entities/user";
import { ProjectRight, Right } from "entities/project-right";
import { RestApiService } from "services/rest-api.service";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

@Component({
  selector: 'app-rightslist',
  templateUrl: './rightslist.component.html',
  styleUrls: ['./rightslist.component.css']
})
export class RightslistComponent implements OnInit {

  private _user: User = undefined;
  private _rights: ProjectRight[] = [];
  private _rightsObs: Observable<ProjectRight[]> = undefined;
  private _rightsSub: Subscription = undefined;

  private _mapModifiedRights: Map<number, ProjectRight>;
  private _mapOriginalRights: Map<number, ProjectRight>;

  private _done$: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _restService: RestApiService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._unsub();
  }

  private _unsub(): void {
    if(this._rightsSub) {
      this._rightsSub.unsubscribe
    }
  }

  updateRightsObs(): void {
    this._rightsObs = Observable.create((observer: Observer<ProjectRight[]>) => {
      observer.next(this._rights);
      observer.complete();
    });
  }

  @Output('done') get done(): EventEmitter<void> {
    return this._done$;
  }

  @Input() set user(user: User) {
    this._mapModifiedRights = new Map();
    this._mapOriginalRights = new Map();
    this._user = user;
    this._unsub();
    this._rightsSub = this._restService.getRights(this._user)
      .finally(() => {
        this._unsub();
        this.updateRightsObs();
      })
      .subscribe(
        (rights: ProjectRight[]) => {
          this._rights = rights;
          this._rights.forEach((originalRight: ProjectRight) => {
            let copyRight: ProjectRight = new ProjectRight(originalRight.id, originalRight.rights, originalRight.project, originalRight.user);
            this._mapOriginalRights.set(copyRight.project.id, copyRight);
          });
        }
      )
  }

  get user(): User {
    return this._user;
  }

  get rightsObs(): Observable<ProjectRight[]> {
    return this._rightsObs;
  }

  get modified(): boolean {
    return this._mapModifiedRights.size > 0;
  }

  hasRight(projectRight: ProjectRight, right: Right): boolean {
    return (projectRight.rights & right) > 0;
  }

  isSameAsOriginal(projectRight: ProjectRight): boolean {
    return this._mapOriginalRights.has(projectRight.project.id) &&
      this._mapOriginalRights.get(projectRight.project.id).rights === projectRight.rights;
  }

  switchRight(event: MdCheckboxChange, projectRight: ProjectRight, right: number): void {
    if(event.checked) { // droit positif
      projectRight.rights = projectRight.rights | right;
    }
    else { // droit negatif
      projectRight.rights = projectRight.rights & (0xffffffff - right);
    }
    // un droit a été modifié et n'est pas contenu dans la liste des modifications
    if(! this.isSameAsOriginal(projectRight) && ! this._mapModifiedRights.has(projectRight.project.id)) {
      this._mapModifiedRights.set(projectRight.project.id, projectRight);
    }
    // une modification sur un droit a été annulée et il faut le supprimer de la liste des modifications
    else if(this.isSameAsOriginal(projectRight) && this._mapModifiedRights.has(projectRight.project.id)) {
      this._mapModifiedRights.delete(projectRight.project.id);
    }
  }

  submit(): void {
    let update: ProjectRight[] = [];
    this._mapModifiedRights.forEach((right: ProjectRight) => {
      update.push(right);
    });
    let updateSub: Subscription = this._restService.setRights(update)
      .finally(() => updateSub.unsubscribe())
      .subscribe((res: number) => this._done$.emit());
  }

  cancel(): void {
    this._done$.emit()
  }

}

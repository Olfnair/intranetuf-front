import { Component, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";
import { RestApiService } from "app/services/rest-api.service";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { DatatableContentManager } from "app/gui/datatable";
import { User } from "entities/user";
import { ProjectRight, Right } from "entities/project-right";

@Component({
  selector: 'app-rightslist',
  templateUrl: './rightslist.component.html',
  styleUrls: ['./rightslist.component.css']
})
export class RightslistComponent extends DatatableContentManager<ProjectRight> implements OnDestroy {
  private _user: User = undefined;
  private _selectedProjectRights: Map<number, ProjectRight> = new Map<number, ProjectRight>();

  private _mapModifiedRights: Map<number, ProjectRight> = new Map<number, ProjectRight>();
  private _mapOriginalRights: Map<number, ProjectRight> = new Map<number, ProjectRight>();

  private _done$: EventEmitter<void> = new EventEmitter<void>();

  private _rightsMustBeChecked: number = 0;
  private _rightsMustBeUnchecked: number = 0;

  private _updatingRights: Map<number, boolean> = new Map<number, boolean>();

  private static addRight(rights: number, rightToAdd: number): number {
    return rights |= rightToAdd;
  }

  private static removeRight(rights: number, rightToRemove: number): number {
    return rights &= (0xffffffff - rightToRemove);
  }

  private static setRight(rights: number, rightToSet: number, add: boolean = true): number {
    return add ? RightslistComponent.addRight(rights, rightToSet) : RightslistComponent.removeRight(rights, rightToSet);
  }

  constructor(restService: RestApiService) {
    super(restService, 'getRights', undefined, () => {
      this.paginator.content.forEach((originalRight: ProjectRight) => {
        if(! this._mapOriginalRights.has(originalRight.project.id)) {
          let copyRight: ProjectRight = new ProjectRight(
            originalRight.id,
            originalRight.rights,
            originalRight.project,
            originalRight.user
          );
          this._mapOriginalRights.set(copyRight.project.id, copyRight);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this._mapModifiedRights.clear();
    this._mapOriginalRights.clear();
  }

  @Output('done') get done(): EventEmitter<void> {
    return this._done$;
  }

  @Input() set user(user: User) {
    this._mapModifiedRights.clear();
    this._mapOriginalRights.clear();
    this._user = user;
    this.load([this._user]);
  }

  get user(): User {
    return this._user;
  }

  get modified(): boolean {
    return this._mapModifiedRights.size > 0;
  }

  updateSelection(selection: Map<number, ProjectRight>): void {
    this._selectedProjectRights = selection;
    this.reEvaluateRights();
  }

  hasRight(projectRight: ProjectRight, right: Right): boolean {
    return ProjectRight.hasRight(projectRight.rights, right);
  }

  isSameAsOriginal(projectRight: ProjectRight): boolean {
    return this._mapOriginalRights.has(projectRight.project.id) &&
      this._mapOriginalRights.get(projectRight.project.id).rights === projectRight.rights;
  }

  setRight(event: MdCheckboxChange, projectRight: ProjectRight, right: number, itemChecked: boolean): void {
    if (event.checked) { // droit positif
      projectRight.rights |= right;
      if(itemChecked) {
        this._rightsMustBeUnchecked = RightslistComponent.removeRight(this._rightsMustBeUnchecked, right);
      }
    }
    else { // droit negatif
      projectRight.rights &= 0xffffffff - right;
      if(itemChecked) {
        this._rightsMustBeChecked = RightslistComponent.removeRight(this._rightsMustBeChecked, right);
      }
    }
    this.updateRight(projectRight);
  }

  setSelectedColRight(event: MdCheckboxChange, right: number): void {
    if(event.checked) {
      this._rightsMustBeChecked = RightslistComponent.addRight(this._rightsMustBeChecked, right);
      this._rightsMustBeUnchecked = RightslistComponent.removeRight(this._rightsMustBeUnchecked, right);
    }
    else {
      this._rightsMustBeUnchecked = RightslistComponent.addRight(this._rightsMustBeUnchecked, right);
      this._rightsMustBeChecked = RightslistComponent.removeRight(this._rightsMustBeChecked, right);
    }
    this.reEvaluateRights();
  }

  rightsColMustBeChecked(right: number): boolean {
    return ProjectRight.hasRight(this._rightsMustBeChecked, right);
  }

  rightsColMustBeUnchecked(right: number): boolean {
    return ProjectRight.hasRight(this._rightsMustBeUnchecked, right);
  }

  // utilisé pour faire les mises à jour
  rightsColChecked(right: number): boolean {
    let check: boolean = this.rightsColMustBeChecked(right);
    let uncheck: boolean = this.rightsColMustBeUnchecked(right);
    if(! check && ! uncheck) {
      return undefined;
    }
    return check ? true : false;
  }

  // utlisé pour afficher la case
  isRightsColChecked(right: number): boolean {
    if(this.rightsColChecked(right) === true) {
      return true;
    }
    return false;
  }

  updateRight(projectRight: ProjectRight): void {
    // un droit a été modifié et n'est pas contenu dans la liste des modifications
    if (! this.isSameAsOriginal(projectRight) && ! this._mapModifiedRights.has(projectRight.project.id)) {
      this._mapModifiedRights.set(projectRight.project.id, projectRight);
    }
    // une modification sur un droit a été annulée et il faut le supprimer de la liste des modifications
    else if (this.isSameAsOriginal(projectRight) && this._mapModifiedRights.has(projectRight.project.id)) {
      this._mapModifiedRights.delete(projectRight.project.id);
    }
  }

  reEvaluateRight(projectRight: ProjectRight, right: Right): void {
    let colChecked: boolean = this.rightsColChecked(right);
    if (colChecked != undefined) {
      projectRight.rights = RightslistComponent.setRight(projectRight.rights, right, colChecked ? true : false);
    }
    this.updateRight(projectRight);
  }

  reEvaluateRights(): void {
    setTimeout(() => {
      this._selectedProjectRights.forEach((projectRight: ProjectRight, id: number) => {
        for(let right: number = 64; right >= 1; right >>= 1) {
          this.reEvaluateRight(projectRight, right);
        }
        this.reEvaluateRight(projectRight, 64 * 2 - 1);
      });
      // on a déselectionné ce qu'il fallait et il ne faudra plus déselectionner à l'avenir :
      this._rightsMustBeUnchecked = 0;
    }, 0);
  }

  isRightBoxChecked(projectRight: ProjectRight, right: Right): boolean {
    return ProjectRight.hasRight(projectRight.rights, right);
  }

  submit(): void {
    let update: ProjectRight[] = [];
    this._mapModifiedRights.forEach((right: ProjectRight) => {
      update.push(right);
    });
    let updateSub: Subscription = this._restService.setRights(update).finally(() => {
      updateSub.unsubscribe();
    }).subscribe((res: number) => this._done$.emit());
  }

  cancel(): void {
    this._done$.emit()
  }

}

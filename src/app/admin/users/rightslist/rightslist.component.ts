import { Component, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";
import { RestApiService } from "app/services/rest-api.service";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { DatatableBitBoxContentManager } from "app/gui/datatable";
import { BitsContainer, BitBoxGridRules } from "app/shared/bit-box-grid-rules";
import { User } from "entities/user";
import { ProjectRight, Right } from "entities/project-right";

class ProjectRightBitsContainer implements BitsContainer {
  constructor(private _projectRight: ProjectRight) { }
  
  getId(): number {
    return this._projectRight.project.id;
  }

  getBits(): number {
    return this._projectRight.rights;
  }

  setBits(bits: number) {
    this._projectRight.rights = bits;
  }

  getContent(): ProjectRight {
    return this._projectRight;
  }
}

@Component({
  selector: 'app-rightslist',
  templateUrl: './rightslist.component.html',
  styleUrls: ['./rightslist.component.css']
})
export class RightslistComponent extends DatatableBitBoxContentManager {
  private _user: User = undefined;

  private _done$: EventEmitter<void> = new EventEmitter<void>();

  constructor(restService: RestApiService) {
    super(restService, 'getRights', 64, ProjectRightBitsContainer);
  }

  @Output('done') get done(): EventEmitter<void> {
    return this._done$;
  }

  @Input() set user(user: User) {
    this.grid.clear();
    this._user = user;
    this.load([this._user]);
  }

  get user(): User {
    return this._user;
  }

  submit(): void {
    let update: ProjectRight[] = [];
    this.grid.modifiedBits.forEach((bitsContainer: ProjectRightBitsContainer) => {
      update.push(bitsContainer.getContent());
    });
    let updateSub: Subscription = this._restService.setRights(update).finally(() => {
      updateSub.unsubscribe();
    }).subscribe((res: number) => this._done$.emit());
  }

  cancel(): void {
    this._done$.emit()
  }

}

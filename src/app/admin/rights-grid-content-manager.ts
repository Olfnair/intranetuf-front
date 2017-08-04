import { EventEmitter, Output, Input } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { BitsContainer } from "app/shared/bit-box-grid-rules";
import { DatatableBitBoxContentManager } from "app/gui/datatable";
import { Project } from "entities/project";
import { ProjectRight } from "entities/project-right";
import { User } from "entities/user";

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

export class RightsGridContentManager<T> extends DatatableBitBoxContentManager {
  private _entity: T = undefined;

  private _close$: EventEmitter<void> = new EventEmitter<void>();

  constructor(restService: any, rightsGetterMethod: string) {
    super(restService, rightsGetterMethod, 64, ProjectRightBitsContainer);
  }

  @Input() set entity(entity: T) {
    this.grid.clear();
    this._entity = entity;
    this.load([this._entity]);
  }

  get entity(): T {
    return this._entity;
  }

  @Output('close') get close$(): EventEmitter<void> {
    return this._close$;
  }

  submit(): void {
    let update: ProjectRight[] = [];
    this.grid.modifiedBits.forEach((bitsContainer: ProjectRightBitsContainer) => {
      update.push(bitsContainer.getContent());
    });
    let updateSub: Subscription = this._restService.setRights(update).finally(() => {
      updateSub.unsubscribe();
    }).subscribe(
      (res: number) => {
        // ok
      },
      (error: Response) => {
        // gestion d'erreur
      }
    );
    this._close$.emit();
  }

  cancel(): void {
    this._close$.emit()
  }
}
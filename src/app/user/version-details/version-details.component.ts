import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { ActivatedRoute } from "@angular/router";
import { RestApiService } from "app/services/rest-api.service";
import { File } from "entities/file";
import { Version, Status as VersionStatus } from "entities/version";
import { WorkflowCheck, CheckType, Status as CheckStatus } from "entities/workflow-check";

class CheckContainer {
  private _title: string = '';
  private _checks: WorkflowCheck[] = [];
  private _type: CheckType;

  private _checksObs: Observable<WorkflowCheck[]> = undefined;

  constructor(type: CheckType, title: string = '') {
    this._type = type;
    this._title = title;
  }

  update(): void {
    this._checksObs =  Observable.create((observer: Observer<WorkflowCheck[]>) => {
      observer.next(this._checks);
      observer.complete();
    });
  }

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }

  get checks(): WorkflowCheck[] {
    return this._checks;
  }

  get type(): CheckType {
    return this._type;
  }

  get checksObs(): Observable<WorkflowCheck[]> {
    return this._checksObs;
  }
}

@Component({
  selector: 'app-version-details',
  templateUrl: './version-details.component.html',
  styleUrls: ['./version-details.component.css']
})
export class VersionDetailsComponent implements OnInit, OnDestroy {

  private _paramsSub: Subscription= undefined;
  
  private _checkContainers: CheckContainer[] = [];
  private _file: File = undefined;

  constructor(
    private _route: ActivatedRoute,
    private _restService: RestApiService
  ) {
    this._checkContainers.push(new CheckContainer(CheckType.CONTROL, 'Contrôles'));
    this._checkContainers.push(new CheckContainer(CheckType.VALIDATION, 'Validations'));
  }

  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      this._file = JSON.parse(decodeURIComponent(params['file']) || undefined);
      let sub: Subscription = this._restService.getWorkflowChecksForVersion(this._file.version.id).finally(() => {
        sub.unsubscribe();
      }).subscribe(
        (checks: WorkflowCheck[]) => {
          checks.forEach((check: WorkflowCheck) => {
            this._checkContainers.forEach((checkContainer: CheckContainer) => {
              if(checkContainer.type == check.type) {
                checkContainer.checks.push(check);
              }
            });
          });
          this._checkContainers.forEach((checkContainer: CheckContainer) => {
            checkContainer.update();
          });
        },
        (error: Response) => {
          // gestion erreur
        }
      );
    });
  }

  ngOnDestroy() {
    if(this._paramsSub) {
      this._paramsSub.unsubscribe();
    }
  }

  get file(): File {
    return this._file;
  }

  get checkContainers(): CheckContainer[] {
    return this._checkContainers;
  }

  fileIconStatus(): string {
    if(this._file.version.status == VersionStatus.VALIDATED) {
      return 'check';
    }
    else if(this._file.version.status == VersionStatus.REFUSED) {
      return 'error';
    }
    return 'warning';
  }

  checksStatus(container: CheckContainer): string {
    let ret: string = 'check';
    container.checks.forEach((check: WorkflowCheck) => {
      if(check.status == CheckStatus.CHECK_KO) {
        ret = 'error';
      }
      else if(check.status == CheckStatus.WAITING || check.status == CheckStatus.TO_CHECK) {
        ret = 'warning';
      }
    });
    return ret;
  }

}

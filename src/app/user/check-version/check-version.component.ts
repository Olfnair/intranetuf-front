import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { GuiForm } from "app/gui/gui-form";
import { Base64 } from "app/shared/base64";
import { WorkflowCheck, CheckType, Status } from "entities/workflow-check";

@Component({
  selector: 'app-check-version',
  templateUrl: './check-version.component.html',
  styleUrls: ['./check-version.component.css']
})
export class CheckVersionComponent extends GuiForm implements OnInit, OnDestroy {
  private _paramsSub: Subscription = undefined;
  private _check: WorkflowCheck = undefined;

  constructor(private _route: ActivatedRoute, private _router: Router, private _restService: RestApiService) {
    super();
  }

  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      this._check = JSON.parse(Base64.urlDecode(params['check']) || undefined);
    });
  }

  ngOnDestroy() {
    if(this._paramsSub) {
      this._paramsSub
    }
  }

  get checkTypeName(): string {
    if(! this._check) { return ''; }
    if(this._check.type == CheckType.CONTROL) {
      return 'Contrôle';
    }
    else if(this._check.type == CheckType.VALIDATION) {
      return 'Validation';
    }
    return '';
  }

  get filename(): string {
    return this._check.version.filename;
  }

  submit(validated: boolean): void {
    this._check.comment = this.form.controls.comment.value;
    this._check.status = validated ? Status.CHECK_OK : Status.CHECK_KO;
    let sub: Subscription = this._restService.updateWorkflowCheck(this._check).finally(() => {
      sub.unsubscribe();
      this._router.navigate(['/home']);
    }).subscribe(
      (status: number) => {
        // ok
      },
      (error: Response) => {
        // gérer erreur ?
      }
    );
  }

  /**
    * @override
    */
  protected _buildForm(): FormGroup {
    return new FormGroup({
      comment: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(10), Validators.maxLength(250)
      ]))
    });
  }

}

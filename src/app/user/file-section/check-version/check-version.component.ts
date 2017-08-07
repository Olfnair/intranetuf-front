import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { ModalService } from "app/gui/modal.service";
import { GuiForm } from "app/gui/gui-form";
import { Base64 } from "app/shared/base64";
import { WorkflowCheck, CheckType, Status } from "entities/workflow-check";

@Component({
  selector: 'app-check-version',
  templateUrl: './check-version.component.html',
  styleUrls: ['./check-version.component.css']
})
export class CheckVersionComponent extends GuiForm {
  private _check: WorkflowCheck = undefined;

  private _close$: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private _restService: RestApiService,
    private _modalService: ModalService
  ) { super(); }

  @Input() set check(check: WorkflowCheck) {
    this._check = check;
  }

  @Output('close') get close$(): EventEmitter<void> {
    return this._close$;
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

  confirm(validated: boolean) {
    let sub: Subscription = this._modalService.yesno(
      'Confirmation',
      'Etes-vous sûr de vouloir ' + (validated ? 'VALIDER' : 'REFUSER') + ' ce fichier ?',
      validated || false
    ).finally(() => {
      sub.unsubscribe();
    }).subscribe((yes: boolean) => {
      if(yes) {
        this.submit(validated);
      }
    });
  }

  submit(validated: boolean): void {
    this._check.comment = this.form.controls.comment.value;
    this._check.status = validated ? Status.CHECK_OK : Status.CHECK_KO;
    let sub: Subscription = this._restService.updateWorkflowCheck(this._check).finally(() => {
      sub.unsubscribe();
      this._close$.emit();
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

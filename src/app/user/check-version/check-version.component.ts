import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { GuiForm } from "app/gui/gui-form";
import { WorkflowCheck, CheckType } from "entities/workflow-check";

@Component({
  selector: 'app-check-version',
  templateUrl: './check-version.component.html',
  styleUrls: ['./check-version.component.css']
})
export class CheckVersionComponent extends GuiForm implements OnInit, OnDestroy {
  private _paramsSub: Subscription = undefined;
  private _check: WorkflowCheck = undefined;

  constructor(private _route: ActivatedRoute, private _router: Router) {
    super();
  }

  ngOnInit() {
    this._paramsSub = this._route.params.subscribe(params => {
      this._check = JSON.parse(decodeURIComponent(params['check']) || undefined);
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

  submit(accepted: boolean): void {
    this._router.navigate(['/home']);
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

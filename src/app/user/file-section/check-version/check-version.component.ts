/**
 * Auteur : Florian
 * License : 
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { ModalService } from "app/gui/modal.service";
import { GuiForm } from "app/gui/gui-form";
import { WorkflowCheck, CheckType, Status } from "entities/workflow-check";

/**
 * Composant pour mettre un commentaire sur une version et refuser ou valider le contrôle/validation
 */
@Component({
  selector: 'app-check-version',
  templateUrl: './check-version.component.html',
  styleUrls: ['./check-version.component.css']
})
export class CheckVersionComponent extends GuiForm {
  
  /** check à refuser ou valider */
  private _check: WorkflowCheck = undefined;

  /** @event - fermeture du composant */
  private _close$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé
   * @param {ModalService} _modalService - service pour afficher les modales
   */
  constructor(
    private _restService: RestApiService,
    private _modalService: ModalService
  ) { super(); }

  /** @property {WorkflowCheck} check - le check à refuser ou valider */
  @Input()
  set check(check: WorkflowCheck) {
    this._check = check;
  }

  /**
   * @event close - fermeture du composant
   * @returns {EventEmitter<void>}
   */
  @Output('close')
  get close$(): EventEmitter<void> {
    return this._close$;
  }

  /** @property {string} checkTypeName - le type de check à effectuer */
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
  
  /** @property {string} filename - le nom du fichier à valider/refuser pour le check */
  get filename(): string {
    return this._check.version.filename;
  }

  /**
   * Ouvre une modale de confirmation du check
   * @param {boolean} validated - indique si le check a été validé (true) ou refusé (false)
   */
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

  /**
   * Enregistre le contrôle
   * @param {boolean} validated - indique si le check a été validé (true) ou refusé (false)
   * @emits close - event de fermeture du composant
   */
  submit(validated: boolean): void {
    this._check.comment = this.form.controls.comment.value;
    this._check.status = validated ? Status.CHECK_OK : Status.CHECK_KO;
    let sub: Subscription = this._restService.editWorkflowCheck(this._check).finally(() => {
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
   * Construit le formulaire
   * @override
   * @returns {FormGroup}
   */
  protected buildForm(): FormGroup {
    return new FormGroup({
      comment: new FormControl('', Validators.compose([
        Validators.required, Validators.minLength(10), Validators.maxLength(250)
      ]))
    });
  }

}

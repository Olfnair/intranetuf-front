import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { WorkflowCheck } from "entities/workflow-check";
import { DatatableContentManager } from "app/gui/datatable";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-checkslist',
  templateUrl: './checkslist.component.html',
  styleUrls: ['./checkslist.component.css']
})
export class CheckslistComponent extends DatatableContentManager<WorkflowCheck, RestApiService> implements OnInit {

  /**
   * @constructor
   * @param {RestApiService} restService - service REST utlisé 
   */
  constructor(
    restService: RestApiService,
    private _session: SessionService
  ) {
    super(
      restService,                  // service REST
      'fetchWorkflowChecksByUser',  // méthode appelée sur le service REST pour charger la liste des checks
      true,                         // afficher le spinner de chargement
      () => {                       // actions à effectuer après chaque chargement/rechargement
        this.reload = false;
      }
    );
  }

  get userId(): number {
    return this._session.userId;
  }

  ngOnInit(): void {
    this.load([this.userId]);
  }

}

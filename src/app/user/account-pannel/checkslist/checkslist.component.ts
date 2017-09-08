import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { WorkflowCheck } from "entities/workflow-check";
import { DatatableContentManager, DatatableQueryParams } from "app/gui/datatable";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";

@Component({
  selector: 'app-checkslist',
  templateUrl: './checkslist.component.html',
  styleUrls: ['./checkslist.component.css']
})
export class CheckslistComponent extends DatatableContentManager<WorkflowCheck, RestApiService> implements OnInit {

  private _whereParams: [string, string][] = [];

  private _title: string = '';
  
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

  ngOnInit(): void {
    let params = new DatatableQueryParams();
    params.limit = DatatableContentManager.PAGE_SIZE;
    this.update(params, [this.userId]);
  }

  get title(): string {
    return this._title;
  }

  @Input()
  set title(title: string) {
    this._title = title;
  }

  @Input()
  set whereParams(whereParams: [string, string][]) {
    this._whereParams = whereParams;
  }

  get userId(): number {
    return this._session.userId;
  }

  /**
   * Mets à jour le contenu en fonction des paramètres de requête params
   * @override
   * @param {DatatableQueryParams} params - paramètres de requête
   * @param {any[]} args - arguments à passer à la méthode appelée sur le service REST pour charger les données 
   */
  public update(params: DatatableQueryParams, args?: any[]): void {
    this._whereParams.forEach((entry: [string, string]) => {
      params.searchParams.set(entry[0], entry[1]);
    });
    console.log(params.index);
    super.update(params, args);
  }

}

/**
 * Auteur : Florian
 * License : 
 */

import { Observable } from "rxjs/Observable";
import { DatatablePaginator, DatatableQueryParams } from ".";

/**
 * Gestionnaire de contenu des datatables :
 * Charge le contenu en gérant la pagination si nécessaire
 */
export class DatatableContentManager<T, RestService> {
  
  /** @static Nombre d'éléments par page par défaut */
  private static readonly PAGE_SIZE = 10;

  /** Paginateur (Gère contenu et pages) */
  private _paginator: DatatablePaginator<T, RestService> =
      new DatatablePaginator<T, RestService>(DatatableContentManager.PAGE_SIZE);
  /** Observable sur le paginateur, passé en entrée au composant datatable pour qu'il puisse accéder au contenu */
  private _dataObs: Observable<DatatablePaginator<T, RestService>> = undefined;
  /** Paramètres de requête sur les données à charger : recherche/tri/pagination */
  private _params: DatatableQueryParams = undefined;
  /** arguments de la méthode à appeler pour charger les données */
  private _args: any[] = undefined;

  /**
   * @constructor
   * @param {RestService} _restService - service Rest utilisé pour charger les données du paginator 
   * @param {string} _methodName - nom de la méthode
   * @param {boolean} _reload - indique s'il faut afficher le spinner de la datatable lors des rechargements 
   * @param {() => void} _onLoad - callback pour spécifier des actions à effectuer après les chargements
   */
  constructor(
    protected _restService: RestService,
    private _methodName: string,
    private _reload?: boolean,
    private _onLoad?: () => void
  ) { }

  /**
   * Réinitialise le contenu
   * @param {boolean} reload - afficher le spinner lors du rechargement ? false par défaut
   */
  public reset(reload: boolean = false): void {
    this._reload = reload;
    this._paginator.goToIndex(0, [], 0); // retour à la première page (index 0), contenu vide
    this._params = undefined;            // aucun paramètre de requête (paramètres par défaut utilisés)
  }

  /** 
   * @property {DatatablePaginator<T, RestService>} paginator - le paginateur :
   * contient le contunu de la page actuelle et gère la pagination
   */
  public get paginator(): DatatablePaginator<T, RestService> {
    return this._paginator;
  } 

  /** @property {Observable<DatatablePaginator<T, RestService>>} dataObs - observable sur les données (le paginateur) */
  public get dataObs(): Observable<DatatablePaginator<T, RestService>> {
    return this._dataObs;
  }

  /** @property {boolean} reload - afficher le spinner lors d'un rechargement ou non */
  public set reload(reload: boolean) {
    this._reload = reload;
  }

  /** @property {any[]} args - arguments à passer à la méthode appelée sur le service REST pour charger les données */
  public set args(args: any[]) {
    this._args = args;
  }

  /**
   * Charge / Recharge le contenu en tenant compte des paramètres actuels
   * @param {any[]} args - arguments à passer à la méthode appelée sur le service REST pour charger les données
   */
  public load(args?: any[]): void {
    if(args) {
      this._args = args;
    }

    // Mise à jour du contenu de la page :
    this._dataObs = this._paginator.update(
      this._restService, // service REST utilisé pour charger les données
      this._methodName,  // nom de la méthode à appeler sur le service REST
      this._params,      // paramètres de requête qui seront convertis en arguments
      this._args,        // arguments compléentaires à passer à la méthode
      this._reload,      // spinner de chargement ?
      () => {            // callback des actions à effectuer après le chargement
        if(this._params && this.paginator.currentPageNum > this.paginator.totalPages) {
          this._params.index = this.paginator.pageToIndex(this.paginator.currentPageNum - 1);
          this.load(args);
        }
        else {
          this._onLoad();
        }
      }
    );
  }

  /**
   * Mets à jour le contenu en fonction des paramètres de requête params
   * @param {DatatableQueryParams} params - paramètres de requête
   * @param {any[]} args - arguments à passer à la méthode appelée sur le service REST pour charger les données 
   */
  public update(params: DatatableQueryParams, args?: any[]): void {
    this._params = params;
    this.load(args);
  }
  
}
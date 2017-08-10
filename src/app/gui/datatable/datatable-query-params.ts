/**
 * Auteur : Florian
 * License : 
 */

import { DatatableQueryOptions } from ".";

/**
 * Paramètres de requête des datatables (tri/recherche/pagination)
 */
export class DatatableQueryParams {
  
  /** options de tri  */
  private _orderParams: DatatableQueryOptions = new DatatableQueryOptions();
  /** options de recherche */
  private _searchParams: DatatableQueryOptions = new DatatableQueryOptions();
  /** tableau reprenant les options de tri [0] et de recherche [1] */
  private _params: DatatableQueryOptions[] = [];
  /** pagination : index de début */
  private _index: number = 0;
  /** pagination : limite du nombre d'éléments à charger */
  private _limit: number = 0;

  /** @constructor */
  constructor() {
    this._params.push(this._orderParams);
    this._params.push(this._searchParams);
  }

  /** @property {DatatableQueryOptions} orderParams - options de tri */
  get orderParams(): DatatableQueryOptions {
    return this._orderParams
  }

  /** @property {DatatableQueryOptions} orderParams - options de recherche */
  get searchParams(): DatatableQueryOptions {
    return this._searchParams;
  }

  /** @property {number} index - index à partir duquel on charge les données */
  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  /** @property {number} limit - nombre max d'éléments à charger */
  get limit(): number {
    return this._limit;
  }

  set limit(limit: number) {
    this._limit = limit;
  }

  /**
   * Réinitialise les paramètres
   */
  reset(): void {
    this._params.forEach((params: DatatableQueryOptions) => {
      params.reset();
    });
    this._index = 0;
    this._limit = 0;
  }

  /**
   * Indique s'il y a des paramètres ou non (params par défaut)
   * @returns {boolean} - true si pas de paramètre, sinon false
   */
  isEmpty(): boolean {
    for(let i: number = 0; i < this._params.length; ++i) {
      if(! this._params[i].isEmpty()) { return false; }
    }
    return true;
  }
}
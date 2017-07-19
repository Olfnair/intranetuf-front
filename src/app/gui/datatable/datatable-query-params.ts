import { DatatableQueryOptions } from ".";

export class DatatableQueryParams {
  private _orderParams: DatatableQueryOptions = new DatatableQueryOptions();
  private _searchParams: DatatableQueryOptions = new DatatableQueryOptions();
  private _index: number = 0;
  private _limit: number = 0;

  constructor() { }

  get orderParams(): DatatableQueryOptions {
    return this._orderParams
  }

  get searchParams(): DatatableQueryOptions {
    return this._searchParams;
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  get limit(): number {
    return this._limit;
  }

  set limit(limit: number) {
    this._limit = limit;
  }
}
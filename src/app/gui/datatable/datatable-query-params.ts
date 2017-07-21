import { DatatableQueryOptions } from ".";

export class DatatableQueryParams {
  private _orderParams: DatatableQueryOptions = new DatatableQueryOptions();
  private _searchParams: DatatableQueryOptions = new DatatableQueryOptions();
  private _params: DatatableQueryOptions[] = [];
  private _index: number = 0;
  private _limit: number = 0;

  constructor(limit?: number) {
    this._params.push(this._orderParams);
    this._params.push(this._searchParams);
    this._limit = limit ? limit : 0;
  }

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

  reset(limit?: number): void {
    this._params.forEach((params: DatatableQueryOptions) => {
      params.reset();
    });
    this._index = 0;
    this._limit = limit ? limit : 0;
  }

  isEmpty(): boolean {
    for(let i: number = 0; i < this._params.length; ++i) {
      if(! this._params[i].isEmpty()) { return false; }
    }
    return true;
  }
}
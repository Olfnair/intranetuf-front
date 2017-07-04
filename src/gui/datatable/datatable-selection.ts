export class DatatableSelection<T> {
  private _id: number = undefined;
  private _data: T = undefined;

  constructor(id: number = undefined, data: T = undefined) {
    this._id = id;
    this._data = data;
  }

  get id(): number {
    return this._id;
  }

  get data(): T {
    return this._data;
  }
}
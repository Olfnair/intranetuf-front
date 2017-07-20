export class DatatableQueryOptions {
  private _colMap: Map<string, string> = new Map<string, string>();

  constructor() { }

  set(col: string, param: string): void {
    if(param == '') { // si pas de recherche sur ce champ, on le supprime du map
      this._colMap.delete(col);
      return;
    }
    this._colMap.set(col, param);
  }

  get(col: string): string {
    return this._colMap.get(col);
  }

  has(col: string): boolean {
    return this._colMap.has(col);
  }

  delete(col: string): boolean {
    return this._colMap.delete(col);
  }

  reset(): void {
    this._colMap.clear();
  }

  isEmpty(): boolean {
    return this._colMap.size <= 0;
  }

  get searchMap(): Map<string, string> {
    return this._colMap;
  }

  toString(replacers: Map<string, string> = undefined): string {
    let ret = '';
    this._colMap.forEach((param: string, col: string) => { 
      let colname: string = undefined;
      if(replacers) {
        colname = replacers.get(col);
      }
      colname = colname ? colname : col;
      ret += 'col:"' + colname + '"param:"' + param + '"';
    });

    if(ret.length <= 0) {
      return 'default'; // recherche par defaut
    }
    return ret;
  }

}
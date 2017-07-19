import { Observable } from "rxjs/Observable";

export class DatatableDataLoader<T> {
  public dataObs: Observable<T> = undefined;
  public reload: boolean = undefined;
  
  constructor(dataObs: Observable<T> = undefined, reload: boolean = undefined) {
    this.dataObs = dataObs;
    this.reload = reload;
  }
}

import { Observable } from "rxjs/Observable";
import { DatatablePaginator, DatatableQueryParams } from ".";

export class DatatableContentManager<T, RestService> {
  private static readonly PAGE_SIZE = 2; // nombre d'éléments par page

  private _paginator: DatatablePaginator<T, RestService> = new DatatablePaginator<T, RestService>(DatatableContentManager.PAGE_SIZE);
  private _dataObs: Observable<DatatablePaginator<T, RestService>> = undefined;
  private _params: DatatableQueryParams = undefined;
  private _args: any[] = undefined;

  constructor(
    protected _restService: RestService,
    private _methodName: string,
    private _reload?: boolean,
    private _onLoad?: () => void
  ) { }

  public reset(reload: boolean = false) {
    this._reload = reload;
    this._paginator.goToIndex(0, [], 0);
    this._params = undefined;
  }

  public get paginator(): DatatablePaginator<T, RestService> {
    return this._paginator;
  } 

  public get dataObs(): Observable<DatatablePaginator<T, RestService>> {
    return this._dataObs;
  }

  public set reload(reload: boolean) {
    this._reload = reload;
  }

  public set args(args: any []) {
    this._args = args;
  }

  public load(args?: any[]): void {
    if(args) {
      this._args = args;
    }

    this._dataObs = this._paginator.update(
      this._restService,
      this._methodName,
      this._params,
      this._args,
      this._reload,
      this._onLoad
    );
  }

  public update(params: DatatableQueryParams, args?: any[]): void {
    this._params = params;
    this.load(args);
  }
}
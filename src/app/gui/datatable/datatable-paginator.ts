import { DatatablePage, DatatableQueryParams } from ".";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

export class DatatablePaginator<T, RestService> {
  private _page: DatatablePage<T>;
  private _totalItemsCount: number = 0;
  private _currentPageNum: number = 1;
  private _totalPages = 0;
  private _reloadBetweenPages: boolean = true;

  constructor(pagesSize: number = 20) {
    this._page = new DatatablePage<T>(pagesSize);
  }
  
  setPageContent(content: T[], totalItemsCount: number = 0): boolean {
    let ret = this._page.setContent(content);
    if(! ret) { return false; }
    this._totalItemsCount = totalItemsCount;
    return true;
  }

  get content(): T[] {
    return this._page.content;
  }

  set pagesSize(pagesSize: number) {
    this._page.pageSize = pagesSize;
  }

  get pagesSize(): number {
    return this._page.pageSize;
  }

  get currentPageNum(): number {
    return this._currentPageNum;
  }

  get totalPages(): number {
    return this._totalPages;
  }

  get reloadBetweenPages(): boolean {
    return this._reloadBetweenPages;
  }

  set reloadBetweenPages(reloadBetweenPages: boolean) {
    this._reloadBetweenPages = reloadBetweenPages;
  }

  public hasNextPage(): boolean {
    return this._totalItemsCount > this.pageToIndex(this._currentPageNum) + this.content.length;
  }

  public hasPrevPage(): boolean {
    return this._currentPageNum > 1;
  }

  public indexToPage(index: number): number {
    return 1 + Math.floor(index / this._page.pageSize);
  }

  public pageToIndex(pageNum: number): number {
    return (pageNum - 1) * this._page.pageSize;
  }

  public hasIndex(index: number): boolean {
    return index >= 0 && (index < this._totalItemsCount || index < this.pagesSize);
  }

  public hasPage(pageNum: number): boolean {
    return this.hasIndex(this.pageToIndex(pageNum));
  }

  public goToIndex(index: number, content: T[] = this.content, totalItemsCount: number = this._totalItemsCount): boolean {
    if(! this.hasIndex(index)) { return false; }
    if(! this.setPageContent(content, totalItemsCount)) { return false; }
    this._currentPageNum = this.indexToPage(index);
    this._totalPages = this.indexToPage(totalItemsCount - 1);
    return true;
  }

  public goToPage(pageNum: number, content: T[] = this.content, totalItemsCount: number = this._totalItemsCount): boolean { 
    return this.goToIndex(this.pageToIndex(pageNum), content, totalItemsCount);
  }

  public update(
    restService: RestService,
    methodName: string,
    params: DatatableQueryParams,
    otherArgs: any[] = undefined,
    reload: boolean = false,
    onResult?: () => void
  ): Observable<DatatablePaginator<T, RestService>> {
    if(! restService[methodName] || ! (restService[methodName] instanceof Function)) {
      return Observable.create((observer: Observer<DatatablePaginator<T, RestService>>) => {
        observer.error('invalid method');
        observer.complete();
      });
    }

    let args: any[] = [];
    if(otherArgs) {
      otherArgs.forEach((arg: any) => {
        args.push(arg);
      });
    }

    let index: number = params ? params.index : 0;
    args.push(params ? params.searchParams.toString() : 'default');
    args.push(params ? params.orderParams.toString() : 'default');
    args.push(index);
    args.push(params ? params.limit : this.pagesSize);

    this.reloadBetweenPages = reload;

    return Observable.create((observer: Observer<DatatablePaginator<T, RestService>>) => {
      let sub = restService[methodName](...args).finally(() => {
        observer.complete();
        sub.unsubscribe();
      }).subscribe(
        (result: any) => {
          if(result == undefined) {
            observer.error(result);
            return;
          }
          if(result.list != undefined || result.totalCount != undefined) {
            this.goToIndex(index, result.list ? result.list : [], result.totalCount ? result.totalCount : 0);
          }
          else {
            this.goToIndex(index, result, result.length);
          }
          observer.next(this);
          if(onResult) {
            onResult();
          }
        },
        (error: Response) => {
          observer.error(error);
        }
      );
    });
  }
}
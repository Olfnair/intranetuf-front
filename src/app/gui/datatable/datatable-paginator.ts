import { DatatablePage } from ".";

export class DatatablePaginator {
  private _page: DatatablePage = new DatatablePage();
  private _totalItemsCount: number = 0;
  private _currentPageNum: number = 1;

  constructor() { }
  
  setContent(content: any[], totalItemsCount: number = 0): boolean {
    let ret = this._page.setContent(content);
    if(! ret) { return false; }
    this._totalItemsCount = totalItemsCount;
    return true;
  }

  get content(): any[] {
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
    return this._totalItemsCount / this._page.pageSize + (this._totalItemsCount % this._page.pageSize) > 0 ? 1 : 0;
  }

  public hasNextPage(): boolean {
    return this._page.length > this._page.pageSize;
  }

  public hasPrevPage(): boolean {
    return this._currentPageNum > 1;
  }

  private pageForward(next: boolean, itemsCount? :number): boolean {
    if(! (next ? this.hasNextPage() : this.hasPrevPage())) {
      return false;
    }
    this.setContent([], 0);
    next ? this._currentPageNum++ : this._currentPageNum--;
    return true;
  }

  public goToNextPage(itemsCount? :number): boolean {
    return this.pageForward(true);
  }

  public goToPrevPage(itemsCount?: number): boolean {
    return this.pageForward(false);
  }
}
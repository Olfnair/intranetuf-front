export class DatatablePage {
  private _pageNum: number = 1;
  private _itemsCount: number = 0;
  private _pagesSize: number = 0;

  constructor(pageSize?: number) {  
    this._pagesSize = pageSize ? pageSize : 0;
  }

  get pageNum(): number {
    return this._pageNum;
  }

  set itemsCount(itemsCount: number) {
    this._itemsCount = itemsCount;
  }

  get itemsCount(): number {
    return (this.itemsCount <= this.pageSize) ? this.itemsCount : this.pageSize;
  }

   get pageSize(): number {
    return this._pagesSize;
  }

  set pageSize(pageSize: number) {
    this._pagesSize = pageSize;
  }

  public hasNextPage(): boolean {
    return this._itemsCount === this._pagesSize;
  }

  public hasPrevPage(): boolean {
    return this._pageNum > 1;
  }

  private pageForward(next: boolean, itemsCount? :number): boolean {
    if(! (next ? this.hasNextPage() : this.hasPrevPage())) {
      return false;
    }
    this._itemsCount = itemsCount ? itemsCount : 0;
    next ? this._pageNum++ : this._pageNum--;
    return true;
  }

  public goToNextPage(itemsCount? :number): boolean {
    return this.pageForward(true);
  }

  public goToPrevPage(itemsCount?: number): boolean {
    return this.pageForward(false);
  }
}
export class DatatablePage<T> {
  private _pageSize: number = 0;
  private _content: T[] = [];

  constructor(pageSize?: number) {
    this._pageSize = pageSize ? pageSize : 0;
  }

  get length(): number {
    return this._content.length;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(pageSize: number) {
    this._pageSize = pageSize;
  }

  setContent(content: T[]): boolean {
    if(content == undefined || content == null) {
      this._content = [];
      return true;
    }
    if(content instanceof Array) {
      if(this._content.length > this._pageSize) { return false; }
      this._content = content;
    }
    else {
      this._content = [content];
    }
    return true;
  }

  get content(): T[] {
    return this._content;
  }
}
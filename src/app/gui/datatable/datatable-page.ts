export class DatatablePage {
  private _pageSize: number = 0;
  private _content: any[];

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

  setContent(content: any[]): boolean {
    if(this._content.length > this._pageSize) { return false; }
    this._content = content;
    return true;
  }

  get content(): any [] {
    return this._content;
  }
}
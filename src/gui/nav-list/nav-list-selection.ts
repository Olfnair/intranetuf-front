export class NavListSelection {

  private _id: number = undefined;
  private _text: string = undefined;

  constructor(id: number = undefined, text: string = undefined) {
    this._id = id;
    this._text = text;
  }

  get id(): number {
    return this._id;
  }

  get text(): string {
    return this._text;
  }
  
}

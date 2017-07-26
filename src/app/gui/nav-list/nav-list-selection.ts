export class NavListSelection {

  private _id: number = undefined;
  private _text: string = undefined;
  private _textColor: string = undefined;
  private _selectedTextColor: string = undefined;

  constructor(
    id: number = undefined,
    text: string = undefined,
    textColor: string = undefined,
    selectedTextColor: string = undefined
  ) {
    this._id = id;
    this._text = text;
    this._textColor = textColor;
    this._selectedTextColor = selectedTextColor;
  }

  get id(): number {
    return this._id;
  }

  get text(): string {
    return this._text;
  }

  get textColor(): string {
    return this._textColor;
  }

  get selectedTextColor(): string {
    return this._selectedTextColor;
  }
  
}

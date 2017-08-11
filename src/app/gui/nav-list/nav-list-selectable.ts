/***
 * Auteur : Florian
 * License : 
 */

/**
 * Elément sélectionnable dans une nav-list
 */
export class NavListSelectable {

  /**
   * @constructor
   * @param {number} _id - id de l'élément
   * @param {string} _text - texte de l'élément
   * @param {string} _textColor - couleur du texte quand l'élément n'est pas sélectionné
   * @param {string} _selectedTextColor - couleur du texte quand l'élément est sélectionné
   */
  constructor(
    private _id: number = undefined,
    private _text: string = undefined,
    private _textColor: string = undefined,
    private _selectedTextColor: string = undefined
  ) { }

  /** @property {number} id - id de l'élément */
  get id(): number {
    return this._id;
  }

  /** @property {string} text - texte de l'élément */
  get text(): string {
    return this._text;
  }

  /** @property {string} textColor - couleur du texte de l'élement quand il n'est pas sélectionné */
  get textColor(): string {
    return this._textColor;
  }
  
  /** @property {string} selectedTextColor - couleur du texte de l'élément quand il est sélectionné */
  get selectedTextColor(): string {
    return this._selectedTextColor;
  }
  
}

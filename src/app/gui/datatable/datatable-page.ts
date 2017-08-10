/***
 * Auteur : Florian
 * License : 
 */

/**
 * Page d'une datatable et son contenu
 * @param T - Type de contenu de la page
 */
export class DatatablePage<T> {
  
  /** Taille de la page : nombre d'éléments affichables max */
  private _pageSize: number = 0;
  /** contenu */
  private _content: T[] = [];

  /**
   * @constructor
   * @param {number} pageSize - taille max de la page
   */
  constructor(pageSize?: number) {
    this._pageSize = pageSize ? pageSize : 0;
  }

  /** @property {number} length - nombre d'éléments actuellement sur la page */
  get length(): number {
    return this._content.length;
  }

  /** @property {number} pageSize - nombre d'élements max sur la page */
  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(pageSize: number) {
    this._pageSize = pageSize;
  }

  /**
   * Remplace le contenu de la page par le contenu content spécifié
   * @param {T[]} content - contenu à mettre sur la page
   */
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

  /** @property {T[]} content - le contenu de la page */
  get content(): T[] {
    return this._content;
  }
}
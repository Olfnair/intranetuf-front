/***
 * Auteur : Florian
 * License : 
 */

/**
 * Objet utilisé par le back-end pour renvoyer des listes de résultats paginés avec le compte total inclus
 */
export class FlexQueryResult<T> {
  
  /**
   * @constructor
   * @param {T[]} list - liste des résultats de la page
   * @param {number} totalCount - nombre total d'éléments sur toutes les pages
   */
  constructor(public list: T[] = undefined, public totalCount: number = undefined) { }
  
}

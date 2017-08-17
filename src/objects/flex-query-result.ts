/***
 * Auteur : Florian
 * License : 
 */

/**
 * Objet utilisé par le back-end pour renvoyer des listes de résultats paginés avec le compte total inclus
 */
export class FlexQueryResult<T> {
  
  /** liste des résultats de la page */
  public list: T[] = undefined;

  /** nombre total d'éléments sur toutes les pages */
  public totalCount: number = undefined;

  /** @constructor */
  constructor() { }
  
}
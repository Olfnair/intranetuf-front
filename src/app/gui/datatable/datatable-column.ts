/***
 * Auteur : Florian
 * License : 
 */

/**
 * Informations de colonne de datatable
 */
export class DatatableColumn {
  /**
   * @constructor
   * @param {string} label - label du titre de la colonne 
   * @param {boolean} sort - indique si on peut trier la colonne on non. false par défaut
   * @param {boolean} search - indique si on peut faire une recherche ou non. false par défaut
   * @param {string} width - largeur de la colonne ('75px', '20%', ...)
   * @param {string} query - nom de la colonne correspondante dans la DB côté back-end
   */
  constructor(
    public label: string = undefined,
    public sort: boolean = false,
    public search: boolean = false,
    public width: number = undefined,
    public query: string = undefined
  ) { }
}

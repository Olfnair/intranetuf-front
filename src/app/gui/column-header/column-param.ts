/**
 * Auteur : Florian
 * License : 
 */

/**
 * Paramètre de colonne (recherche ou tri). Indique la colonne concernée et le paramètre pour cette colonne.
 * Exemples :
 * Tri croissant sur la colonne 'nom' : {col: 'nom', param: 'ASC'}.
 * Recherche des prénoms contenant 'jean' : {col: 'firstname', 'jean'}.
 */
export class ColumnParam {
  
  /** la colonne concernée */
  public col: string = '';
  /** le paramètre à appliquer */
  public param: string = '';

  /**
   * @constructor
   * @param {string} col - la colonne concernée
   * @param {string} param - le paramètre à appliquer
   */
  constructor(col: string = '', param: string = '') {
    this.col = col;
    this.param = param;
  }
}

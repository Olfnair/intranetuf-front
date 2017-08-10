/***
 * Auteur : Florian
 * License : 
 */

/**
 * Options de tri/recherche sur les colonnes
 */
export class DatatableQueryOptions {
  
  /** Map contenant les différents paaramètres par colonne */
  private _colMap: Map<string, string> = new Map<string, string>();

  /** @constructor */
  constructor() { }

  /**
   * Ajoute une option sur la colonne col avec le paramètre param
   * @param {string} col - colonne sur laquelle il faut mettre un paramètre
   * @param {string} param - paramètre à affecter à la colonne
   */
  set(col: string, param: string): void {
    if(! param) { // si pas de recherche/tri sur ce champ, on le supprime du map
      this._colMap.delete(col);
      return;
    }
    this._colMap.set(col, param);
  }

  /**
   * récupère le paramètre d'un colonne col (si elle est dans les options)
   * @param {string} col - colonne dont on veut le paramètre
   * @returns {string} - le paramètre de la colonne demandée ou null si elle n'est pas dans les options
   */
  get(col: string): string {
    return this._colMap.get(col);
  }

  /**
   * Indique si la colonne col est dans les options
   * @param {string} col - colonne dont on veut savoir si elle est dans les options ou pas
   * @returns {boolean} - true si la colonne est dans les options, false sinon
   */
  has(col: string): boolean {
    return this._colMap.has(col);
  }

  /**
   * Supprime l'option pour la colonne col
   * @param {string} col - colonne dont on veut supprimer l'option
   * @returns {boolean} - true si la suppression est effective, false si col n'était pas dans les options 
   */
  delete(col: string): boolean {
    return this._colMap.delete(col);
  }

  /**
   * Réinitialise les options (à aucune) 
   */
  reset(): void {
    this._colMap.clear();
  }

  /**
   * Indique si les options sont vides
   * @returns {boolean} true => vide, false => pas vide
   */
  isEmpty(): boolean {
    return this._colMap.size <= 0;
  }

  /** @property {Map<string, string>} searchMap - Map contenant les options */
  get searchMap(): Map<string, string> {
    return this._colMap;
  }

  /**
   * retourne les options sous forme de chaine de caractères
   * @param {Map<string, string>} replacers - Map qui permet de remplacer un nom de colonne spécifié par un autre
   * @returns {string} - 
   */
  toString(replacers: Map<string, string> = undefined): string {
    let ret = '';
    // construction de la chaine. Format : col_1:"param_1"col_2:"param_2"...
    this._colMap.forEach((param: string, col: string) => { 
      let colname: string = undefined;
      if(replacers) {
        colname = replacers.get(col);
      }
      colname = colname ? colname : col;
      ret += 'col:"' + colname + '"param:"' + param + '"';
    });

    if(ret.length <= 0) {
      return 'default'; // recherche par defaut
    }
    return ret;
  }

}
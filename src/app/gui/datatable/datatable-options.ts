/***
 * Auteur : Florian
 * License : 
 */

/**
 * Options de configuration des datatables
 */
export class DatatableOptions {

  /** une colonne supplémentaire avec des cases à cocher pour sélectionner les lignes */
  public selectionCol: boolean = false;
  
  // bouton d'ajout et le texte affiché quand on le survole :
  /** Indique s'il faut afficher un bouton d'ajout */
  public addButton: boolean = false;
  /** Texte affiché quand on survole le bouton d'ajout */
  public addButtonTooltip: string = undefined
  /** nom de l'icone à utiliser sur le bouton d'ajout */
  public addButtonIconName: string = 'add';

  /** annule les sélections quand on change de page */
  public resetSelectionOnPageChange: boolean = false;
  
  /** afficher ou non le footer */
  public displayFooter: boolean = false;

  /** afficher ou non les titres de colonne quand la table est vide */
  public displayEmpty: boolean = false;

  /** message si la table est vide */
  public emptyMessage: string = undefined;

  /** message si aucun résultat de recherche */
  public emptySearchMessage: string = undefined;

  /** ajoute un bouton qui permet d'afficher ou non le contenu de la table */
  public displayToggle = false;

  /** @constructor */
  public constructor() { }

  /**
   * Fait une copie de options sur this
   * @param {DatatableOptions} options - options à copier 
   */
  public copy(options: DatatableOptions) {
    Object.keys(this).forEach((k: string) => {
      if(options[k] != undefined) {
        this[k] = options[k];
      }
    });
  }
}

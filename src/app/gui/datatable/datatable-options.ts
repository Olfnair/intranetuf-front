export class DatatableOptions {
  // une colonne supplémentaire avec des cases à cocher pour sélectionner les lignes
  public selectionCol: boolean = false;
  
  // bouton d'ajout et le texte affiché quand on le survole
  public addButton: boolean = false;
  public addButtonTooltip: string = undefined
  public addButtonIconName: string = 'add';
  
  // afficher ou non le footer
  public displayFooter: boolean = false;

  // afficher ou non les titres de colonne quand la table est vide
  public displayEmpty: boolean = false;

  // message si la table est vide
  public emptyMessage: string = undefined;

  // message si aucun résultat de recherche
  public emptySearchMessage: string = undefined;

  // ajoute un bouton qui permet d'afficher ou non le contenu de la table
  public displayToggle = false;

  public constructor() { }

  public copy(options: DatatableOptions) {
    Object.keys(this).forEach((k: string) => {
      if(options[k] != undefined) {
        this[k] = options[k];
      }
    });
  }
}

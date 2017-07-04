export class DatatableOptions {
  // une colonne supplémentaire avec des cases à cocher pour sélectionner les lignes
  public selectionCol: boolean = false;
  
  // bouton d'ajout et le texte affiché quand on le survole
  public addButton: boolean = false;
  public addButtonTooltip: string = undefined
  
  // afficher ou non le footer
  public displayFooter: boolean = false;

  // afficher ou non les titres de colonne quand la table est vide
  public displayEmpty: boolean = false

  // message si la table est vide
  public emptyMessage: string = undefined;

  constructor() { }
}

/***
 * Auteur : Florian
 * License : 
 */

/**
 * Options pour la modale qui permet de choisir le nom d'un projet (nouveau ou edit)
 */
export class ChoseProjectNameOptions {
  
  /** titre du projet */
  public title: string = 'Choix du nom du projet';
  /** message d'erreur pour une saisie invalide */
  public errorText: string = 'Veuillez indiquer le nom du projet';
  /** texte du bouton de validation */
  public submitText: string = 'Valider';
  /** texte du bouton d'annulation */
  public cancelText: string = 'Annuler';

  /**
   * Copie les options données en paramètre
   * @constructor
   * @param {ChoseProjectNameOptions} options - les options éventuelles à copier (sinon options par défaut) 
   */
  constructor(options: ChoseProjectNameOptions = undefined) {
    if(options) {
      this.copy(options);
    }
  }

  /**
   * Copie les options données en paramètre
   * @private
   * @param {ChoseProjectNameOptions} options
   */
  private copy(options: ChoseProjectNameOptions): void {
    Object.keys(this).forEach((key: string) => {  // pour chaque clé existante dans this
      if(options[key]) {
        this[key] = options[key];                 // on copie la clé correspondante de options si elle existe
      }
    });
  }
  
}
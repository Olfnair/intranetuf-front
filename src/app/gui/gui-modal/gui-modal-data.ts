/***
 * Auteur : Florian
 * License : 
 */

/**
 * Informations d'une modale
 */
export class GuiModalData {

  /**
   * @constructor
   * @param {string} title - titre de la modale 
   * @param {string} text - texte de la modale
   * @param {boolean} success - message de réussite ou non
   * @param {boolean} yesno - true => un bouton OUI et un bouton NON, false => juste un bouton OK
   */
  constructor(
    public title: string = '',
    public text: string = '',
    public success: boolean = false,
    public yesno: boolean = false
  ) { }
  
}
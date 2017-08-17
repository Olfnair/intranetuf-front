/***
 * Auteur : Florian
 * License : 
 */

/**
 * Objet qui encapsule un entier :
 * - Utilisé par le back-end pour envoyer ou recevoir des nombres entiers (seuls ou liste).
 */
export class RestLong {

  /**
   * @constructor
   * @param {number} value - valeur entière encaspsulée dans l'objet
   */
  constructor(public value: number = undefined) {
    this.value = value;
  }

}
/***
 * Auteur : Florian
 * License : 
 */

/**
 * Entité Crédentials : login et mot de passe d'un utilisateur
 */
export class Credentials {

  /**
   * @constructor
   * @param {string} login - login de l'utilisateur
   * @param {string} pwd - mot de passe de l'utilisateur
   */
  constructor(public login: string, public pwd: string) { }

}

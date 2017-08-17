/***
 * Auteur : Florian
 * License : 
 */

/**
 * Entité Credentials : login et mot de passe d'un utilisateur
 */
export class Credentials {

  /**
   * @constructor
   * @param {string} login - login de l'utilisateur
   * @param {string} password - mot de passe de l'utilisateur
   */
  constructor(public login: string, public password: string) { }

}

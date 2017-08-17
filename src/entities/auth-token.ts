/***
 * Auteur : Florian
 * License : 
 */

/**
 * Entité Token d'authentification
 */
export class AuthToken {
  
  /** nonce (nombre généré aléatoirement pour chaque token) */
  public n: number = undefined; // nonce
  
  /** id de l'utilisateur */
  public u: number = undefined; // userId
  
  /** role(s) */
  public r: number = undefined; // roleId
  
  /** date d'expiration  */
  public e: number = undefined; // expDate

  /** signature du token par le serveur */
  public s: string = undefined; // signature

  /** @constructor */
  constructor() { }

}

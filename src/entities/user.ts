/**
 * Auteur : Florian
 * License : 
 */

import { Credentials } from "entities/credentials";

/**
 * Enumération des rôles possibles d'un utilisateur
 * @enum
 */
export enum Roles {
  USER = 0,
  ADMIN = 1,
  SUPERADMIN = 2
}

/**
 * Entité Utilisateur
 */
export class User {
  
  /** id de l'utilisateur */
  public id: number = undefined;
  
  /** roles de l'utilisateur */
  public role: number = undefined;
  
  /** nom de l'utilisateur */
  public name: string = undefined;

  /** prénom de l'utilisateur */
  public firstname: string = undefined;
  
  /** e-mail de l'utilisateur */
  public email: string = undefined;
  
  /** login de l'utilisateur */
  public login: string = undefined;
  
  /** ref sur les credentials de l'utilisateur */
  public credentials: Credentials = undefined;
  
  /** utilisateur actif ou non */
  public active: boolean = undefined;
  
  /** utilisateur en attente ou non (compte en attente d'activation ou non) */
  public pending: boolean = undefined;

  /** @constructor */
  constructor() { }

  /**
   * Indique si les rôles à tester userRole contiennent les rôles à vérifier roleCheck
   * @param {number} userRole - roles à tester 
   * @param {number} rolecheck - roles à vérifier
   * @returns {boolean} - true si les rôles à tester contiennnent les rôles à vérifier
   */
  public static hasRole(userRole: number, rolecheck: number): boolean {
    if(userRole == undefined || userRole == null) {
      return false;
    }
    return (userRole & rolecheck) == rolecheck || rolecheck == Roles.USER;
  }
  
}

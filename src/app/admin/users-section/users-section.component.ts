/**
 * Auteur : Florian
 * License :
 */

import { Component } from '@angular/core';
import { GenericEntitySection } from "../generic-entity-section";
import { User } from "entities/user";

/**
 * Section 'Utilisateurs' du panneau d'admin
 */
@Component({
  selector: 'app-users-section',
  templateUrl: './users-section.component.html',
  styleUrls: ['./users-section.component.css']
})
export class UsersSectionComponent extends GenericEntitySection<User> {
  
  /**
   * @constructor
   */
  constructor() {
    super({
      // Etats possibles (this.state) :
      List:   0, // Lister les utilisateurs
      Add:    1, // Ajouter un utilisateur
      Edit:   2, // Editer un utilisateur
      Rights: 3, // Gérer les droits d'un utilisatrur
      Roles:  4  // Gérer les rôles des utilisateurs
    });
  }

}

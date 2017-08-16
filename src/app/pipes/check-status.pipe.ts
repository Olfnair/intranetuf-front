/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Status } from "entities/workflow-check";

/**
 * Pipe qui transforme le statut (nombre) d'un WorkflowChek (Contrôle ou Validation) en la chaine de
 * caractères qui y correspond
 */
@Pipe({
  name: 'checkStatus'
})
export class CheckStatusPipe implements PipeTransform {

  /**
   * Transforme un statut en une chaine de caractères
   * @param {Status} status - le statut à transformer en chaine de caractères
   * @returns {string} - la chaine de caractères qui correspond au paramètre status
   */
  transform(status: Status): string {
    switch(status) {
      case Status.WAITING:
        return 'En attente';
      case Status.TO_CHECK:
        return 'A effectuer';
      case Status.CHECK_OK:
        return 'Validé';
      case Status.CHECK_KO:
        return 'Refusé';
      default:
        return '';
    }
  }

}

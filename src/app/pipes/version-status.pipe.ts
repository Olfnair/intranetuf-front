/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Status } from "entities/version";

/**
 * Récupérer une chaine de caractères correspondant au statut d'une version
 */
@Pipe({
  name: 'versionStatus'
})
export class VersionStatusPipe implements PipeTransform {

  /**
   * Transforme le status en la chaine de caractères qui y correspond
   * @param {Status} status - le statut à transformer
   * @returns {string} - la chaine de caratères correspond au statut (status)
   */
  transform(status: Status): string {
    switch(status) {
      case Status.CREATED:
        return 'Créé';
      case Status.CONTROLLED:
        return 'Contrôlé';
      case Status.VALIDATED:
        return 'Validé';
      case Status.REFUSED:
        return 'Refusé';
      default:
        return '';
    }
  }

}

/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe qui convertit un boolean en chaine de caractères Oui (true) ou Non (false)
 */
@Pipe({
  name: 'boolToString'
})
export class BoolToStringPipe implements PipeTransform {

  /**
   * Convertit le paramètre bool en une chaine de caractères 'Oui' si bool est true, sinon 'Non'
   * @param {boolean} bool - le boolean à convertir en chaine de caractères
   * @returns {string} - la chaine de caractères correspondant au boolean
   */
  transform(bool: boolean): string {
    return bool ? 'Oui' : 'Non';
  }

}

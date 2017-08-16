/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Garantit une longueur minimale pour un nombre (x chiffres)
 */
@Pipe({
  name: 'numberLen'
})
export class NumberLenPipe implements PipeTransform {

  /**
   * Crée un nombre de valeur value et d'une longueur minimale len
   * @param {number} value - valeur du nombre 
   * @param {number} len - nombre de chiffres minimum du nombre
   * @returns {string} - la chaine de caractères qui correspond au nombré créé
   */
  transform(value: number, len: number = 2): string {
    let str: string = value.toString(10);
    for(let diff = len - str.length; diff > 0; --diff) {
      str = '0' + str;
    }
    return str;
  }

}

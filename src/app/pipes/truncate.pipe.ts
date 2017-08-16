/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Tronque une chaine de caractères si elle est trop longue
 */
@Pipe({
  name: 'truncate'
})
export class TruncatePipe {
  
  /**
   * Limite une chaine de caractères (value) à un certains nombre de caractères (limit)
   * en y ajoutant le trail si la chaine a du être tronquée.
   * @param {string} value - la chaine de caractères à limiter 
   * @param {number} limit - le nombre max de caractères à conserver dans la chaine
   * @param {string} trail - trail en cas de tronquage
   */
  transform(value: string, limit: number = 10, trail: string = '...'): string {
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }

}
/**
 * Auteur : Florian
 * License : 
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe qui transforme un epoch en chaine de caractères
 */
@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  /**
   * Transforme un epoch en une chaine de caractères au format (jj/mm/aaaa)
   * @param {number} epoch - epoch (en secondes) à transforer en chaine de caratères
   * @returns {string} la chaine de caractères qui correspond à l'epoch
   */
  transform(epoch: number, defaultValue: string = ''): string {
    if(! epoch) {
      return defaultValue;
    }
    let date: Date = new Date(epoch * 1000);
    let day: string = date.getDate().toString();
    let month: string = (date.getMonth() + 1).toString();
    let year: string = date.getFullYear().toString();
    while(day.length < 2) {
      day = "0" + day;
    }
    while(month.length < 2) {
      month = "0" + month;
    }
    while(year.length < 4) {
      year = "0" + year;
    }
    return day + '/' + month + '/' + year;
  }
  
}

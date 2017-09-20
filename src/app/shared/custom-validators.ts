/**
 * Auteur : Florian
 * License : 
 */

import { FormControl } from '@angular/forms';
import { EXTENSIONS } from 'configuration/upload';


/**
 * Validations personnalisées
 */
export class CustomValidators {
  
  /**
   * vérifie que l'utilisateur a entré un email google
   * @param {FormControl} control - le contrôle sur lequel le test va être effectué
   * @returns {{googleEmail: boolean}}
   */
  static googleEmail(control: FormControl) {
    // email regex
    const regex = /^\w+\.\w+@gmail\.com$/;
    // returns control
    return regex.test(control.value) ? null : { googleEmail: true };
  }

  /**
   * Vérifie que l'utilisateur a entré un email
   * @param {FormControl} control - le contrôle sur lequel le test va être effectué
   * @returns {{email: boolean}}
   */
  static email(control: FormControl) {
    // email regex
    // http://emailregex.com/
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // returns control
    return regex.test(control.value) ? null : { email: true };
  }

  /**
   * Vérifie le login
   * @param {FormControl} control - le contrôle sur lequel le test va être effectué
   * @returns {{login: boolean}}
   */
  static login(control: FormControl) {
    const regex = /^[a-z0-9]+$/i;

    // returns control
    return regex.test(control.value) ? null : { login: true };
  }

  static fileExtension(control: FormControl) {
    let value: string = control.value;
    let index: number = value.lastIndexOf('.');
    if(index < 0 || index == value.length - 1) {
      return { fileExtension: true };
    }
    let ext: string = value.substring(index);
    return EXTENSIONS.includes(ext) ? null : { fileExtension: true };
  }
}

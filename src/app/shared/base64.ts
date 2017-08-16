/***
 * Auteur : Florian
 * License : 
 */

/**
 * Classe qui gère les conversions en Base64
 */
export class Base64 {
  
  /**
   * Encode data en base 64 URL (+/= deviennent -_.), pas de padding en sortie
   * @param {string} data - les données à encoder
   * @returns {string} les données encodées en Base64 URL (données considérées en ISO-8859-1)
   */
  public static urlEncode(data: string): string {
    let base64str: string = btoa(data);
    let urlStr: string = '';
    for(let i: number = 0; i < base64str.length; ++i) {
      switch(base64str[i]) {
        case '+':
          urlStr += '-';
          break;
        case '/':
          urlStr += '_';
          break;
        case '=':
          // skip le padding, on n'en veut pas
          break;
        default:
          urlStr += base64str[i];
          break;
      }
    }
    return urlStr;
  }

  /**
   * Décode data depuis base 64 URL (+/= deviennent -_.)
   * @param {string} data - les données à décoder
   * @returns {string} les données décodées en ISO-8859-1
   */
  public static urlDecode(data: string): string {
    let base64str: string = '';
    for(let i: number = 0; i < data.length; ++i) {
      switch(data[i]) {
        case '-':
          base64str += '+';
          break;
        case '_':
          base64str += '/';
          break;
        case '.':
          // skip ce caractère
          break;
        default:
          base64str += data[i];
          break;
      }
    }
    return atob(base64str);
  }

}
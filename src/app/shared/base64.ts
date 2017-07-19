export class Base64 {
  
  public static urlEncode(data: string): string {
    let base64str: string = btoa(data);
    let urlStr: string = '';
    for(let i = 0; i < base64str.length; ++i) {
      switch(base64str[i]) {
        case '+':
          urlStr += '-';
          break;
        case '/':
          urlStr += '_';
          break;
        case '=':
          // skip ce caractère
          break;
        default:
          urlStr += base64str[i];
          break;
      }
    }
    return urlStr;
  }

  public static urlDecode(data: string): string {
    let base64str: string = '';
    for(let i = 0; i < data.length; ++i) {
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
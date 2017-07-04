import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberLen'
})
export class NumberLenPipe implements PipeTransform {

  transform(value: number, len: number = 2): string {
    let str: string = value.toString(10);
    for(let diff = len - str.length; diff > 0; --diff) {
      str = '0' + str;
    }
    return str;
  }

}

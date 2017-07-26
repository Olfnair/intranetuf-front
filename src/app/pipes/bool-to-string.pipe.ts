import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'boolToString'
})
export class BoolToStringPipe implements PipeTransform {

  transform(bool: boolean): string {
    return bool ? 'Oui' : 'Non';
  }

}

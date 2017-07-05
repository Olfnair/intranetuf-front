import { Pipe, PipeTransform } from '@angular/core';
import { Status } from "entities/version";

@Pipe({
  name: 'versionStatus'
})
export class VersionStatusPipe implements PipeTransform {

  transform(status: number): string {
    switch(status) {
      case Status.CREATED:
        return 'Créé';
      case Status.CONTROLLED:
        return 'Contrôlé';
      case Status.VALIDATED:
        return 'Validé';
      default:
        return '';
    }
  }

}

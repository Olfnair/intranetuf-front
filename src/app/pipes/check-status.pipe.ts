import { Pipe, PipeTransform } from '@angular/core';
import { Status } from "entities/workflow-check";

@Pipe({
  name: 'checkStatus'
})
export class CheckStatusPipe implements PipeTransform {

  transform(status: Status): string {
    switch(status) {
      case Status.WAITING:
        return 'En attente';
      case Status.TO_CHECK:
        return 'A effectuer';
      case Status.CHECK_OK:
        return 'Validé';
      case Status.CHECK_KO:
        return 'Refusé';
      default:
        return '';
    }
  }

}

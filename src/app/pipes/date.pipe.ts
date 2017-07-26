import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: number): string {
    if(! value) {
      return "inconnue";
    }
    let date: Date = new Date(value * 1000);
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

export class Date {
  public id: number = undefined;
  public day: number = 1;
  public month: number = 1;
  public year: number = 1970;
  public hour: number = 0;
  public min: number = 0;
  public sec: number = 0;

  constructor() {
  }

  isValid(): boolean {
    if (this.month > 12 || this.day > 31 || this.hour > 23 || this.min > 59 || this.sec > 59
     || this.month <  1 || this.day <  1 || this.hour <  0 || this.min <  0 || this.sec <  0) {
      return false;
    }
    if (this.month == 2) {
      return this.isBissex() ? this.day <= 29 : this.day <= 28;
    }
    return this.day < 31 || ((this.month - 1) % 7) % 2 == 0;
  }

  isBissex(): boolean {
    return this.year % 400 == 0 || this.year % 4 == 0 && this.year % 100 != 0;
  }
}

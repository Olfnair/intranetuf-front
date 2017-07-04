export class Date {
  public id: number = undefined;
  public day: number = undefined;
  public month: number = undefined;
  public year: number = undefined;
  public hour: number = undefined;
  public min: number = undefined;
  public sec: number = undefined;

  constructor() { }

  isValid(): boolean {
    return this.isValidDate() && this.isValidHour();
  }

  isValidDate(): boolean {
    if(this.year == undefined || this.month == undefined || this.day == undefined) {
      return false;
    }
    if (this.month > 12 || this.day > 31
     || this.month <  1 || this.day <  1) {
      return false;
    }
    if (this.month == 2) {
      return this.isBissex() ? this.day <= 29 : this.day <= 28;
    }
    return this.day < 31 || ((this.month - 1) % 7) % 2 == 0;
  }

  isValidHour(): boolean {
    if(this.hour == undefined || this.min == undefined || this.sec == undefined) {
      return false;
    }
    return this.hour < 24 && this.min < 60 && this.sec < 60
        && this.hour >= 0 && this.min >= 0 && this.sec >= 0;
  }

  validate(): void {
    if(! this.isValidDate()) {
      this.year = undefined;
      this.month = undefined;
      this.day = undefined;
    }
    if(! this.isValidHour()) {
      this.hour = undefined;
      this.min = undefined;
      this.sec = undefined;
    }
  }

  isBissex(): boolean {
    return this.year % 400 == 0 || this.year % 4 == 0 && this.year % 100 != 0;
  }
}

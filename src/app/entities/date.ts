export class Date {
    public day: number;
    public month: number;
    public year: number;
    public hour: number;
    public min: number;
    public sec: number;

    constructor() {
        this.day = 0;
        this.month = 0;
        this.year = 0;
        this.hour = 0;
        this.min = 0;
        this.sec = 0;
    }

    isValid(): boolean {
        if (this.month > 12 || this.day > 31 || this.hour > 23 || this.min > 59 || this.sec > 59) {
            return false;
        }
        else if (this.month == 2) {
            if (this.isBissex() && this.day > 29)
                return false;
            else if (this.day > 28)
                return false;
        }
        return true;
    }

    isBissex(): boolean {
        return this.year % 400 == 0 || this.year % 4 == 0 && this.year % 100 != 0;
    }
}

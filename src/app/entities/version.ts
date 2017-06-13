import { Date } from "app/entities/date";

export class Version {
  public id: number = undefined;
  public filename: string = undefined;
  public num: number = undefined;
  public status: number = undefined;
  public date_upload: Date = undefined;

  constructor() {
  }
}

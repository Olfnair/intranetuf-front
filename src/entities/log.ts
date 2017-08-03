import { File } from "entities/file";
import { User } from "entities/user";

export class Log {
  public id: number = undefined;
  public type: string = undefined;
  public message: string = undefined;
  public logdate: number = undefined;
  public user: User = undefined;
  public file: File = undefined;

  constructor() { }
}
import { Credentials } from "app/entities/credentials";

export class User {
  public id: number = undefined;
  public name: string = undefined;
  public firstname: string = undefined;
  public email: string = undefined;
  public login: string = undefined;
  public credentials: Credentials = undefined;
  public active: boolean = undefined;
  public pending: boolean = undefined;

  constructor() { }
}

import { Credentials } from "entities/credentials";

export enum Roles {
  USER = 0,
  ADMIN = 1,
  SUPERADMIN = 2
}

export class User {
  public id: number = undefined;
  public role: number = undefined;
  public name: string = undefined;
  public firstname: string = undefined;
  public email: string = undefined;
  public login: string = undefined;
  public credentials: Credentials = undefined;
  public active: boolean = undefined;
  public pending: boolean = undefined;

  constructor() { }

  public static hasRole(userRole: number, rolecheck: number): boolean {
    if(userRole == undefined || userRole == null) {
      return false;
    }
    return (userRole & rolecheck) > 0 || rolecheck == Roles.USER;
  }
}

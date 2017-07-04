export class AuthToken {
  public n: number = undefined; // nonce
  public u: number = undefined; // userId
  public r: number = undefined; // roleId
  public e: number = undefined; // expDate
  public s: string = undefined; // signature

  constructor() { }
}

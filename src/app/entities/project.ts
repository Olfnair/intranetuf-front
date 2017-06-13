export class Project {
  public id: number = undefined;
  public name: string = undefined;
  public active: boolean = true;

  constructor(name: string) {
    this.name = name;
  }
}

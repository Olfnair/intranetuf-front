import { Version } from "app/entities/version";
import { Project } from "app/entities/project";
import { User } from "app/entities/user";

export class File {
  public id: number = undefined;
  public active: boolean = true;
  public author: User = undefined;
  public version: Version = undefined;
  public project: Project = undefined;

  constructor() {
  }
}

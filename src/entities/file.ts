import { Project } from "entities/project";
import { User } from "entities/user";
import { Version } from "entities/version";

export class File {
  public id: number = undefined;
  public active: boolean = undefined;
  public author: User = undefined;
  public version: Version = undefined;
  public project: Project = undefined;

  constructor() { }
}

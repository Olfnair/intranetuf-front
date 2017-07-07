import { Date } from "entities/date";
import { File } from "entities/file";
import { WorkflowCheck } from "entities/workflow-check";

export enum Status { 
  CREATED = 0,
  CONTROLLED = 1,
  VALIDATED = 2,
  REFUSED = 3
}

export class Version {
  public id: number = undefined;
  public filename: string = undefined;
  public num: number = undefined;
  public status: number = undefined;
  public file: File = undefined;
  public date_upload: Date = undefined;
  public workflowChecks: WorkflowCheck[] = undefined;

  constructor() { }
}

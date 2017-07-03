import { Date } from "app/entities/date";
import { File } from "app/entities/file";
import { WorkflowCheck } from "app/entities/workflow-check";

export class Version {
  public id: number = undefined;
  public filename: string = undefined;
  public num: number = undefined;
  public status: number = undefined;
  public file: File = undefined;
  public date_upload: Date = undefined;
  public workflowCheck: WorkflowCheck[] = undefined;

  constructor() { }
}

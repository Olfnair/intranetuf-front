import { Date } from "entities/date";
import { User } from "entities/user";
import { Version } from "entities/version";

export enum CheckType {
  CONTROL = 0,
  VALIDATION = 1
}

export class WorkflowCheck {
  id: number = undefined;
  status: number = undefined;
  date_init: Date = undefined;
  date_action: Date = undefined;
  comment: string = undefined;
  order_num: number = undefined;
  type: CheckType = undefined;
  version: Version = undefined;
  user: User = undefined;

  constructor() { }
}
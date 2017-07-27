import { User } from "entities/user";
import { Version } from "entities/version";

export enum CheckType {
  CONTROL = 0,
  VALIDATION = 1
}

export enum Status {
  WAITING = 0,
  TO_CHECK = 1,
  CHECK_OK = 2,
  CHECK_KO = 3
}

export class WorkflowCheck {
  id: number = undefined;
  status: number = undefined;
  date_init: number = undefined;
  date_checked: number = undefined;
  comment: string = undefined;
  order_num: number = undefined;
  type: CheckType = undefined;
  version: Version = undefined;
  user: User = undefined;

  constructor() { }
}
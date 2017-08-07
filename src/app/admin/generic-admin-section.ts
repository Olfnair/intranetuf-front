import { AppSection } from "app/shared/app-section";

export class GenericEntitySection<T> extends AppSection {
  private _entity: T = undefined;
  
  constructor(states: any) {
    super(states);
  }

  get entity(): T {
    return this._entity;
  }

  set entity(entity: T) {
    this._entity = entity;
  }

  setStateAndEntity(state: number, entity: T) {
    this.state = state;
    this._entity = entity;
  }
}
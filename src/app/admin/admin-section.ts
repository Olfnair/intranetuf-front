import { Input } from "@angular/core";

export class AdminSection {
  private readonly _statesEnum: any = {};

  private _state: number;

  public constructor(states: any) {
    this._statesEnum = states;
    this._state = states[Object.keys(states)[0]];
  }

  public get State(): any {
    return this._statesEnum;
  }

  @Input()
  public set state(state: number) {
    this._state = state;
  }

  @Input()
  public set stateName(key: string) {
    this._state = this._statesEnum[key];
  }

  public get state(): number {
    return this._state;
  }
}

export class GenericAdminSection<T> extends AdminSection {
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
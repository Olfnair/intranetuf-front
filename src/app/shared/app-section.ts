/**
 * Auteur : Florian
 * License : 
 */

import { Input, EventEmitter, Output } from "@angular/core";


/**
 * Classe qui représente une section de l'application (gestion des fichiers d'un projet, gestion des utilisateurs, ...)
 */
export class AppSection {

  /** indique si on peut revenir à l'écran précedant */
  private _canNavBack: boolean = false;
  
  /** @event - demande pour revenir à l'écran précédent */
  private _navback$: EventEmitter<void> = new EventEmitter<void>();
  
  /** Etat courant de la section */
  private _state: number;

  /**
   * @constructor
   * @param states - les états possibles de la section (qui déterminent quoi afficher)
   */
  public constructor(private readonly _statesEnum: any) {
    this._state = _statesEnum[Object.keys(_statesEnum)[0]];
  }

  /** @property {any} State - Enumération des états possibles pour cette section */
  public get State(): any {
    return this._statesEnum;
  }

  /** @property {number} state - état courant de la section */
  public get state(): number {
    return this._state;
  }

  @Input()
  public set state(state: number) {
    this._state = state;
  }

  /** @property {string} stateName - nom de l'état courant */
  @Input()
  public set stateName(key: string) {
    this._state = this._statesEnum[key];
  }

  /** @property {boolean} canNavBack - indique s'il faut afficher le bouton permettant de revenir à l'écran précédent */
  get canNavBack(): boolean {
    return this._canNavBack;
  }

  @Input()
  set canNavBack(canNavBack: boolean) {
    this._canNavBack = canNavBack;
  }

  /**
   * @event navback - retour à l'écran précédent
   * @returns {EventEmitter<void>}
   */
  @Output('navback')
  get navback$(): EventEmitter<void> {
    return this._navback$;
  }

  /**
   * @emits navback - event de demande pour revenir à l'écran précédent
   */
  navback(): void {
    let initialState = this._statesEnum[Object.keys(this._statesEnum)[0]];
    
    if(this.state == initialState) {
      this._navback$.emit();
      return;
    }

    this.state = initialState;
  }
  
}

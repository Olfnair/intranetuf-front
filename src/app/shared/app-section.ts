/**
 * Auteur : Florian
 * License : 
 */

import { Input } from "@angular/core";


/**
 * Classe qui représente une section de l'application (gestion des fichiers d'un projet, gestion des utilisateurs, ...)
 */
export class AppSection {
  
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
  
}

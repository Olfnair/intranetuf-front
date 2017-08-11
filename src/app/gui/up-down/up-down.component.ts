/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';

/**
 * Composant qui affiche un bouton 'haut' et un autre bouton 'bas' juste en dessous 
 */
@Component({
  selector: 'up-down',
  templateUrl: './up-down.component.html',
  styleUrls: ['./up-down.component.css']
})
export class UpDownComponent {

  /** first == true => pas de bouton up */
  private _first: boolean = false;
  /** first == true => pas de bouton down */
  private _last: boolean = false;

  // Events :
  /** @event - l'utilisateur a cliqué sur le bouton up */
  private _up$: EventEmitter<void> = new EventEmitter<void>();
  /** @event - l'utilisateur a cliqué sur le bouton down */
  private _down$: EventEmitter<void> = new EventEmitter<void>();

  /** @constructor */
  constructor() { }

  /** @property {boolean} first - indique si le bouton up est actif */
  get first(): boolean {
    return this._first;
  }

  @Input() set first(first: boolean) {
    this._first = first;
  }

  /** @property {boolean} last - indique si le bouton down est actif */
  get last(): boolean {
    return this._last;
  }

  @Input() set last(last: boolean) {
    this._last = last;
  }

  
  /**
   * @event up - l'utilisateur a cliqué sur le bouton up
   * @returns {EventEmitter<void>}
   */
  @Output('up') get up(): EventEmitter<void> {
    return this._up$;
  }

  /**
   * @event down - l'utilisateur a cliqué sur le bouton down
   * @returns {EventEmitter<void>}
   */
  @Output('down') get down(): EventEmitter<void> {
    return this._down$;
  }

  /**
   * @emits up - l'utilisateur a cliqué sur le bouton up
   */
  emitUp(): void {
    this._up$.emit();
  }

  /**
   * @emits down - l'utilisateur a cliqué sur le bouton down
   */
  emitDown(): void {
    this._down$.emit();
  }

}

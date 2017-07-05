import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'up-down',
  templateUrl: './up-down.component.html',
  styleUrls: ['./up-down.component.css']
})
export class UpDownComponent {

  // si first : pas de bouton up
  private _first: boolean = false;
  // si last : pas de bouton down
  private _last: boolean = false;

  // events pour savoir quand on clique sur up ou down
  private _upEmitter: EventEmitter<void> = new EventEmitter<void>();
  private _downEmitter: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  @Input() set first(first: boolean) {
    this._first = first;
  }

  get first(): boolean {
    return this._first;
  }

  @Input() set last(last: boolean) {
    this._last = last;
  }

  get last(): boolean {
    return this._last;
  }

  @Output('up') get up(): EventEmitter<void> {
    return this._upEmitter;
  }

  @Output('down') get down(): EventEmitter<void> {
    return this._downEmitter;
  }

  emitUp(): void {
    this._upEmitter.emit();
  }

  emitDown(): void {
    this._downEmitter.emit();
  }

}

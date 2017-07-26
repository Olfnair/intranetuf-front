import { Input, EventEmitter, Output } from '@angular/core';
import { NavListSelection } from "app/gui/nav-list";
import { DomSanitizer } from "@angular/platform-browser";

export class NavList {
  private _title: string = undefined;
  private _error: string = undefined;

  private _selectables: NavListSelection[] = undefined;
  private _select$: EventEmitter<NavListSelection> = new EventEmitter<NavListSelection>();
  private _loaded$: EventEmitter<void> = new EventEmitter<void>();

  // ref sur la selection courante
  private _selected: NavListSelection = undefined;

  constructor(private _sanitizer: DomSanitizer) { }

  @Input() set title(title: string) {
    this._title = title;
  }

  get title(): string {
    return this._title;
  }

  @Input() set error(error: string) {
    this._error = error;
  }

  get error(): string {
    return this._error;
  }

  @Input() set selectables(selectables: NavListSelection[]) {
    this._selectables = selectables;
    this._loaded$.emit();
  }

  get selectables(): NavListSelection[] {
    return this._selectables;
  }

  @Input() set selected(selection: NavListSelection) {
    this._selected = selection;
  }

  get selected(): NavListSelection {
    return this._selected;
  }

  isSelected(selectable: NavListSelection): boolean {
    return this._selected && this._selected == selectable;
  }

  @Output('select') get select$(): EventEmitter<NavListSelection> {
    return this._select$;
  }

  select(selection: NavListSelection): void {
    this._selected = selection;
    this._select$.emit(this._selected);
  }

  @Output('loaded') get loaded$(): EventEmitter<void> {
    return this._loaded$;
  }

  getTextColor(textColor: string, defaultColor: string = '#000000') {
    return this._sanitizer.bypassSecurityTrustStyle(textColor ? textColor : defaultColor);
  }
}
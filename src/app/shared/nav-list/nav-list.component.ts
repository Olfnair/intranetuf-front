import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

export class NavListSelection {
  private _id: number = undefined;
  private _text: string = undefined;

  constructor(id: number = undefined, text: string = undefined) {
    this._id = id;
    this._text = text;
  }

  get id(): number {
    return this._id;
  }

  get text(): string {
    return this._text;
  }
}

export class NavList {
  private _title: string = undefined;

  private _selectables: NavListSelection[] = [];
  private _select$: EventEmitter<NavListSelection> = new EventEmitter<NavListSelection>();
  
  private _showOnSmall: boolean = false; // afficher en dessous de 993 px;
  private _showOnLarge: boolean = true; // afficher au dessus de 993 px;

  // ref sur la selection courante
  private _selected: NavListSelection = undefined;

  constructor() { }

  @Input() set title(title: string) {
    this._title = title;
  }

  get title(): string {
    return this._title;
  }

  @Input() set selectables(selectables: NavListSelection[]) {
    this._selectables = selectables;
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

  @Input() set showOnSmall(showOnSmall: boolean) {
    this._showOnSmall = showOnSmall;
  }

  get showOnSmall(): boolean {
    return this._showOnSmall;
  }

  @Input() set showOnLarge(showOnLarge: boolean) {
    this._showOnLarge = showOnLarge;
  }

  get showOnLarge(): boolean {
    return this._showOnLarge;
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
}

@Component({
  selector: 'nav-list',
  templateUrl: './nav-list.component.html',
  styleUrls: ['./nav-list.component.css']
})
export class NavListComponent extends NavList implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  } 

}

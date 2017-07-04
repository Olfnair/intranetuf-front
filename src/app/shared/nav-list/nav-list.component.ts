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

  private _selectables: NavListSelection[] = undefined;
  private _select$: EventEmitter<NavListSelection> = new EventEmitter<NavListSelection>();
  private _loaded$: EventEmitter<void> = new EventEmitter<void>();

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

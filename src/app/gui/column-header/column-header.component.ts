import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from "../datatable";

export class ColumnOrder {
  public name: string = '';
  public asc: boolean = true;

  constructor(name: string = '', asc: boolean = true) {
    this.name = name;
    this.asc = asc;
  }
}

export class ColumnSearch {
  public name: string = '';
  public value: string = '';

  constructor(name: string = '', value: string = '') {
    this.name = name;
    this.value = value;
  }
}

@Component({
  selector: 'column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css']
})
export class ColumnHeaderComponent {
  private _column: DatatableColumn = undefined;
  private _growingSortOrder: boolean = false;
  private _selected: boolean = false;
  private _selected$: EventEmitter<boolean> = new EventEmitter<boolean>();
  private _order$: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  get growingSortOrder(): boolean {
    return this._growingSortOrder;
  }

  @Input() set column(column: DatatableColumn) {
    this._column = column;
  }

  get column(): DatatableColumn {
    return this._column;
  }
  
  @Input() set selected(selected: boolean) {
    this._selected = selected;
    this._selected$.emit(this._selected);
  }
  
  get selected(): boolean {
    return this._selected;
  }

  @Output('selected') get selected$(): EventEmitter<boolean> {
    return this._selected$;
  }

  toggleSortOrder(): void {
    this._growingSortOrder = ! this._growingSortOrder;
    if(! this._selected) {
      this.selected = true;
    }
  }

  columnSearch(value: string): void {
    console.log(value);
  }

}

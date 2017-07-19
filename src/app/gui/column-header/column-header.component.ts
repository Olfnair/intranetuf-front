import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from "../datatable";
import { ColumnParam } from ".";

@Component({
  selector: 'column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css']
})
export class ColumnHeaderComponent {
  private _column: DatatableColumn = undefined;
  private _growingSortOrder: boolean = false;
  private _selected: boolean = false;
  private _select$: EventEmitter<DatatableColumn> = new EventEmitter<DatatableColumn>();
  private _order$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();
  private _search$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();

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
    if(! this._selected) {
      this._growingSortOrder = false;
    }
  }
  
  get selected(): boolean {
    return this._selected;
  }

  @Output('select') get select$(): EventEmitter<DatatableColumn> {
    return this._select$;
  }

  @Output('order') get order$(): EventEmitter<ColumnParam> {
    return this._order$;
  }

  @Output('search') get search$(): EventEmitter<ColumnParam> {
    return this._search$;
  }

  toggleSortOrder(): void {
    this._growingSortOrder = ! this._growingSortOrder;
    this._order$.emit(
      new ColumnParam(
        this._column.query ? this._column.query : this._column.label, this._growingSortOrder ? 'ASC' : 'DESC'
      )
    );
    if(! this._selected) {
      this._selected = true;
      this._select$.emit(this._column);
    }
  }

  columnSearch(param: string): void {
    this._search$.emit(new ColumnParam(this._column.query ? this._column.query : this._column.label, param));
  }

}

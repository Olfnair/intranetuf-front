import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from "../datatable";
import { ColumnParam } from ".";

enum SearchState {
  UNDEFINED = 0,
  ASC = 1,
  DESC = 2
}

@Component({
  selector: 'column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css']
})
export class ColumnHeaderComponent {
  SearchState: typeof SearchState = SearchState; // on rend l'enum accessible depuis le template

  private _column: DatatableColumn = undefined;
  private _searchState: SearchState = SearchState.UNDEFINED;
  private _order$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();
  private _search$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();

  constructor() { }

  get searchState(): SearchState {
    return this._searchState;
  }

  @Input() set column(column: DatatableColumn) {
    this._column = column;
  }

  get column(): DatatableColumn {
    return this._column;
  }

  @Output('order') get order$(): EventEmitter<ColumnParam> {
    return this._order$;
  }

  @Output('search') get search$(): EventEmitter<ColumnParam> {
    return this._search$;
  }

  reset(): void {
    this._searchState = SearchState.UNDEFINED;
  }

  stateToString(): string {
    switch(this._searchState) {
      case SearchState.ASC:
        return 'ASC';
      case SearchState.DESC:
        return 'DESC';
      default:
        return undefined;
    }
  }

  switchSortOrder(): void {
    this._searchState = (this._searchState + 1) % 3;
    this._order$.emit(
      new ColumnParam(this._column.query ? this._column.query : this._column.label, this.stateToString())
    );
  }

  columnSearch(param: string): void {
    this._search$.emit(new ColumnParam(this._column.query ? this._column.query : this._column.label, param));
  }

}

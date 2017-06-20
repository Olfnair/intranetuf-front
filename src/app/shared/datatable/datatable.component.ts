import { Component, OnInit, ContentChild, TemplateRef, Input, Directive } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";

@Directive({
  selector: 'datatable-title'
})
export class DatatableTitle {}

@Directive({
  selector: 'datatable-header'
})
export class DatatableHeader {}

@Component({
  selector: 'datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {
  @ContentChild(TemplateRef)
  public contentTpl: TemplateRef<any>;

  private _columns: string[] = [];
  private _data: any[] = [];

  private _selectedData: any[] = [];
  private _selectAllTrue: boolean = false;
  private _selectAllFalse: boolean = false;

  // options
  private _selectionCol: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  get data(): any[] {
    return this._data;
  }

  @Input() set data(data: any[]) {
    if(data) {
      this._data = data;
    }
  }

  get columns(): string[] {
    return this._columns;
  }

  @Input() set columns(columns: string[]) {
    this._columns = columns;
  }

  @Input() set selectionCol(selectionCol: boolean) {
    this._selectionCol = selectionCol;
  }

  get selectionCol(): boolean {
    return this._selectionCol;
  }

  get selectAllTrue(): boolean {
    return this._selectAllTrue;
  }

  get selectAllState(): boolean {
    if (this._selectAllTrue) { return true; }
    if (this._selectAllFalse) { return false; }
    return undefined;
  }

  setSelectAllState(event: MdCheckboxChange): void {
    this._selectAllTrue = event.checked;
    this._selectAllFalse = !event.checked;
  }

  checkSelect(event: MdCheckboxChange, item: any): void {
    let index: number = this._selectedData.indexOf(item);
    if (!event.checked && index !== -1) {
      this._selectedData.splice(index, 1);
      this._selectAllTrue = false;
    }
    else if (event.checked && index === -1) {
      this._selectedData.push(item);
    }
  }

}

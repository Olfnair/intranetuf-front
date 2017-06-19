import { Component, OnInit, ContentChild, TemplateRef, Input, Directive } from '@angular/core';

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

}

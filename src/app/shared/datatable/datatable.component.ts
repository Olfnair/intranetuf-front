import { Component, OnInit, ContentChild, TemplateRef, Input } from '@angular/core';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent implements OnInit {
  @ContentChild(TemplateRef) contentTpl: TemplateRef<Element>;

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

}

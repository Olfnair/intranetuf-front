import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-datable-row',
  templateUrl: './datable-row.component.html',
  styleUrls: ['./datable-row.component.css']
})
export class DatableRowComponent implements OnInit {

  private _file: any;

  constructor() { }

  ngOnInit() {
  }

  @Input() set file(file: any) {
    console.log(JSON.stringify(file));
    console.log(1);
    this._file = file;
  }

  get file(): any {
    return this._file;
  }

}

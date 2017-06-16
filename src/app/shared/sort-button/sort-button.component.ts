import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sort-button',
  templateUrl: './sort-button.component.html',
  styleUrls: ['./sort-button.component.css']
})
export class SortButtonComponent implements OnInit {
  private _growingSortOrder: boolean = true;

  constructor() { }

  ngOnInit() {
  }

  get growingSortOrder(): boolean {
    return this._growingSortOrder;
  }

  toggleSortOrder() {
    this._growingSortOrder = ! this._growingSortOrder;
  }

}

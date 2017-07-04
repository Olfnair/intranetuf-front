import { Component } from '@angular/core';

@Component({
  selector: 'sort-button',
  templateUrl: './sort-button.component.html',
  styleUrls: ['./sort-button.component.css']
})
export class SortButtonComponent {
  private _growingSortOrder: boolean = true;

  constructor() { }

  get growingSortOrder(): boolean {
    return this._growingSortOrder;
  }

  toggleSortOrder() {
    this._growingSortOrder = ! this._growingSortOrder;
  }

}

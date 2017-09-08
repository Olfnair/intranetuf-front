import { Component, Input } from '@angular/core';

@Component({
  selector: 'cell-content',
  templateUrl: './cell-content.component.html',
  styleUrls: ['./cell-content.component.css']
})
export class CellContentComponent {

  private _content: string;
  private _link: boolean = false;
  
  constructor() { }

  get content(): string {
    return this._content;
  }
  
  @Input()
  set content(content: string) {
    this._content = content;
  }

  get link(): boolean {
    return this._link;
  }

  @Input()
  set link(link: boolean) {
    this._link = link;
  }

}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit {
  private _project: number = -1;
  
  constructor() { }

  ngOnInit() {
  }

  @Input() set project(project: number) {
    this._project = project;
  }

  get project(): number {
    return this._project;
  }

}

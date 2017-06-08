import { Component, OnInit, Input } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit {
  private _project: number = -1;
  private _files: any[] = [];
  
  constructor(private _restService: RestApiService) { }

  ngOnInit() {
  }

  @Input() set project(project: number) {
    this._project = project;
    this._restService.fetchFilesByProject(project).subscribe((files: any[]) => this._files = files);
  }

  get project(): number {
    return this._project;
  }

  get files(): any[] {
    return this._files;
  }

}

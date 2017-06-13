import { Component, OnInit, Input } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { Project } from "app/entities/project";
import { Router } from "@angular/router";

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.css']
})
export class FilelistComponent implements OnInit {
  private _project: Project = undefined;
  private _files: any[] = [];
  
  constructor(private _restService: RestApiService, private _router: Router) { }

  ngOnInit() {
  }

  @Input() set project(project: Project) {
    this._project = project;
    if(project) {
      this._restService.fetchFilesByProject(project).subscribe((files: any[]) => this._files = files);
    }
  }

  get project(): Project {
    return this._project;
  }

  get files(): any[] {
    return this._files;
  }

  add(): void {
    this._router.navigate(['/add_file']);
  }

}

import { Component, OnInit, NgZone, Input, EventEmitter, Output } from '@angular/core';
import { RestApiService } from "app/shared/rest-api.service";
import { RequestOptions, Http, Headers } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { FileUploadService } from "app/shared/file-upload.service";

@Component({
  selector: 'app-projectlist',
  templateUrl: './projectlist.component.html',
  styleUrls: ['./projectlist.component.css']
})
export class ProjectlistComponent implements OnInit {

  private _projects: any[];
  private _progress: number = -1;
  private _select$: EventEmitter<number>;
  private _opened: boolean = false;
  
  // conserve l'id du projet selectionné
  private _selected: number = -1;
  
  constructor(private _restService: RestApiService, private _http: Http, private _uploadService: FileUploadService, private _zone: NgZone) {
    this._select$ = new EventEmitter();
    this._projects = [];
    this._uploadService.progress$.subscribe(data => {
      this._zone.run(() => {
          console.log('progress = '+data);
          this._progress = data;
        });
      });
  }

  ngOnInit() {
    this._restService.fetchProjects().subscribe((projects: any[]) => this._projects = projects);
  }

  get projects(): any[] {
    return this._projects;
  }

  get progress(): number {
    return this._progress;
  }

  @Input() set selected(id: number) {
    this._selected = id;
  }

  get selected(): number {
    return this._selected;
  }

  get opened(): boolean {
    return this._opened;
  }

  toggle(): void {
    this._opened = ! this._opened;
  }

  @Output ('select') get select$(): EventEmitter<number> {
    return this._select$;
  }

  select(id: number): void {
    this._selected = id;
    this._select$.emit(this._selected);
  }

  fileChange(event): void {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
      let file: File = fileList[0];
      let formData:FormData = new FormData();
      formData.append('file', file, file.name);
      let headers = new Headers();
      //headers.append('Content-Type', 'multipart/form-data');
      headers.append('Accept', 'application/json');
      let options = new RequestOptions({headers: headers});
      this._http.post('https://localhost:8443/IUF/rest/upload', formData, options)
          .map(res => res.json())
          .catch(error => Observable.throw(error))
          .subscribe(
            data => console.log('success'),
            error => console.log(error)
          )
    }
  }

  onChange(event): void {
    console.log('onChange');
    let fileList: FileList = event.target.files;
    if(fileList.length <= 0) {
      return;
    }
    this._progress = 0;
    let file: File = fileList[0];
    console.log(file);
    this._uploadService.upload([], fileList)
                       .finally(() => console.log('sent'))
                       .subscribe(
                         //() => console.log('sent ok'), // marche pas ???
                         error => console.log(error)
                       )
  }
}

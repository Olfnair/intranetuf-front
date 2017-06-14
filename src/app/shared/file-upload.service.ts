import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { environment } from "environments/environment";
import {File as FileEntity} from "app/entities/file";
import 'rxjs/Rx';

@Injectable()
export class FileUploadService {
  private _progressValue: number
  private _progress$: Observable<number>;
  private _progressObserver: Observer<number>;
  private _url: string;

  constructor() {
    this._url = environment.backend.protocol + "://"
              + environment.backend.host + ":"
              + environment.backend.port
              + environment.backend.endpoints.allFiles;
    this._progress$ = Observable.create((observer: Observer<number>) => {
      this._progressObserver = observer;
    }).share();
    this._progress$.subscribe((value: number) => this._progressValue = value);
  }

  get progressValue(): number {
    return this._progressValue;
  }

  get progress$(): Observable<number> {
    return this._progress$;
  }

  upload(params: string[], file: File, fileEntity: FileEntity): Observable<void> {
    return Observable.create(observer => {
      let formData: FormData = new FormData(), xhr: XMLHttpRequest = new XMLHttpRequest();

      formData.append("entity", new Blob([JSON.stringify({file: fileEntity})], {type: "application/json"}));
      formData.append("file", file, file.name);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.upload.onprogress = (event) => {
        //this._progress$ = Math.round(event.loaded / event.total * 100);
        this._progressObserver.next(Math.round(event.loaded / event.total * 100));
      };

      //xhr.timeout = 10000; // time in milliseconds
      xhr.open('POST', this._url, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(formData);
    });
  }
}
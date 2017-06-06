import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { environment } from "environments/environment";
import 'rxjs/Rx';

@Injectable()
export class FileUploadService {
  private _progress$: any;
  private _progressObserver: Observer<any>;
  private _url: string;

  constructor() {
    this._url = environment.backend.protocol + "://"
              + environment.backend.host + ":"
              + environment.backend.port
              + environment.backend.endpoints.upload;
    this._progress$ = Observable.create(observer => {
      this._progressObserver = observer
    }).share();
  }

  get progress$(): any {
    return this._progress$;
  }

  upload(params: string[], files: FileList): Observable<any> {
    return Observable.create(observer => {
      let formData: FormData = new FormData(), xhr: XMLHttpRequest = new XMLHttpRequest();

      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i], files[i].name);
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 201) {
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.upload.onprogress = (event) => {
        this._progress$ = Math.round(event.loaded / event.total * 100);
        this._progressObserver.next(this._progress$);
      };

      //xhr.timeout = 10000; // time in milliseconds
      xhr.open('POST', this._url, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(formData);
    });
  }
}
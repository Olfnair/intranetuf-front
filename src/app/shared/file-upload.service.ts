import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { environment } from "environments/environment";
import { File as FileEntity } from "app/entities/file";
import { SessionService } from "app/shared/session.service";
import 'rxjs/Rx';

@Injectable()
export class FileUploadService {
  private _progressValue: number
  private _progress$: Observable<number>;
  private _progressObserver: Observer<number>;
  private _urlFile: string;
  private _urlVersion: string;

  constructor(private _session: SessionService) {
    this._urlFile = environment.backend.protocol + "://"
                  + environment.backend.host + ":"
                  + environment.backend.port
                  + environment.backend.endpoints.allFiles;
    this._urlVersion = environment.backend.protocol + "://"
                     + environment.backend.host + ":"
                     + environment.backend.port
                     + environment.backend.endpoints.allVersions;
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

  upload(params: string[], file: File, entityType: string, entity: any): Observable<void> {
    return Observable.create(observer => {
      let formData: FormData = new FormData(), xhr: XMLHttpRequest = new XMLHttpRequest();
      let url = entityType == 'version' ? this._urlVersion : this._urlFile;

      formData.append("entity", new Blob([JSON.stringify({[entityType]: entity})], {type: "application/json"}));
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
      xhr.open('POST', url, true);
      xhr.setRequestHeader("Authorization", "Bearer " + this._session.authToken);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(formData);
    });
  }
}
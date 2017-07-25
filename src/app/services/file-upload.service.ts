import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { environment } from "environments/environment";
import { File as FileEntity } from "entities/file";
import { SessionService } from "./session.service";
import 'rxjs/Rx';

@Injectable()
export class FileUploadService {
  //private _progressValue: number
  private _progress: Observable<number>;
  private _progressObserver: Observer<number>;
  private _urlFile: string;
  private _urlVersion: string;
  private _xhr: XMLHttpRequest;

  constructor(private _session: SessionService) {
    this._urlFile = environment.backend.protocol + "://"
                  + environment.backend.host + ":"
                  + environment.backend.port
                  + environment.backend.endpoints.file;
    this._urlVersion = environment.backend.protocol + "://"
                     + environment.backend.host + ":"
                     + environment.backend.port
                     + environment.backend.endpoints.version;
    this._progress = Observable.create((observer: Observer<number>) => {
      this._progressObserver = observer;
    }).share();
  }

  get progress(): Observable<number> {
    return this._progress;
  }

  upload(params: string[], file: File, entityType: string, entity: any): Observable<void> {
    return Observable.create(observer => {
      let formData: FormData = new FormData()
      let url = entityType == 'version' ? this._urlVersion : this._urlFile;

      this._xhr = new XMLHttpRequest();
      
      formData.append("entity", new Blob([JSON.stringify({[entityType]: entity})], {type: "application/json"}));
      formData.append("file", file, file.name);

      this._xhr.onreadystatechange = () => {
        if (this._xhr.readyState === 4) {
          if (this._xhr.status >= 200 && this._xhr.status < 300) {
            observer.complete();
          } else {
            observer.error(this._xhr.response);
          }
        }
      };

      this._xhr.upload.onprogress = (event) => {
        let progress = Math.round(event.loaded / event.total * 100) 
        this._progressObserver.next(progress);
        if(progress >= 100) {
          this._progressObserver.complete();
        }
      };

      this._xhr.open('POST', url, true);
      this._xhr.setRequestHeader("Authorization", "Bearer " + JSON.stringify(this._session.authToken));
      this._xhr.setRequestHeader("Accept", "application/json");
      this._xhr.send(formData);
    });
  }

  abort(): void {
    this._xhr.abort();
  }
}
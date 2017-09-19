/**
 * Auteur : Florian
 * License : 
 */

import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";
import { environment } from "environments/environment";
import { File as FileEntity } from "entities/file";
import { SessionService } from "./session.service";
import 'rxjs/Rx';

/**
 * service d'upload des fichiers
 */
@Injectable()
export class FileUploadService {
  
  /** Etat d'avancement d'un upload */
  private _progress: Observable<number>;
  
  /** Observer sur l'état d'avancement d'un upload */
  private _progressObserver: Observer<number>;
  
  /** URL vers l'api pour uploader un nouveau fichier */
  private _urlFile: string;
  
  /** URL vers l'api pour uploader une nouvelle version d'un fichier */
  private _urlVersion: string;
  
  /** gestionnaire de requêtes ajax */
  private _xhr: XMLHttpRequest;

  /**
   * @constructor
   * @param {SessionService} _session : informations globales de session
   */
  constructor(private _session: SessionService) {
    // création des URL's :
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

  /** @property {Observable<number>} progress - Observable sur l'état d'avancement d'un upload */
  get progress(): Observable<number> {
    return this._progress;
  }

  /**
   * Upload un nouveau fichier ou une nouvelle version
   * @param {File} file - le fichier à uploader 
   * @param {string} entityType - type d'entité : 'file' ou 'version' 
   * @param {any} entity - entité correspondant au fichier
   * @returns {Observable<void>} - indique la fin de l'upload
   */
  upload(file: File, entityType: string, entity: any): Observable<void> {
    return Observable.create(observer => {
      let formData: FormData = new FormData();
      let url = entityType == 'version' ? this._urlVersion : this._urlFile; // URL en fonction du type d'entité

      this._xhr = new XMLHttpRequest();
      
      // création du formData qui va servir à uploader le fichier :
      formData.append("entity", new Blob([JSON.stringify(/*{[entityType]: entity}*/entity)], {type: "application/json"}));
      formData.append("file", file, file.name);

      // détecter la fin de l'upload :
      this._xhr.onreadystatechange = () => {
        if (this._xhr.readyState === 4) {                           // Fin de l'upload
          if (this._xhr.status >= 200 && this._xhr.status < 300) {  // réponse OK :
            observer.complete();
          } else {                                                  // Erreur :
            observer.error(this._xhr.status);
          }
        }
      };

      // progression : 
      this._xhr.upload.onprogress = (event) => {
        let progress = Math.round(event.loaded / event.total * 100) 
        this._progressObserver.next(progress);
        if(progress >= 100) {
          this._progressObserver.complete();
        }
      };

      // envoi de la requête d'upload :
      this._xhr.open('POST', url, true);
      this._xhr.setRequestHeader("Authorization", "Bearer " + JSON.stringify(this._session.authToken));
      this._xhr.setRequestHeader("Accept", "application/json");
      //this._xhr.setRequestHeader("X-File-Size", (file.size).toString());
      this._xhr.send(formData);
    });
  }

  /**
   * Annule l'upload en cours
   */
  abort(): void {
    this._xhr.abort();
  }
  
}
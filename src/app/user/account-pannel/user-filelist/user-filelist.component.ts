import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { DatatableContentManager } from "app/gui/datatable";
import { RestApiService } from "app/services/rest-api.service";
import { SessionService } from "app/services/session.service";
import { File } from "entities/file";

@Component({
  selector: 'app-user-filelist',
  templateUrl: './user-filelist.component.html',
  styleUrls: ['./user-filelist.component.css']
})
export class UserFilelistComponent extends DatatableContentManager<File, RestApiService> implements OnInit {

  /** @event - l'utilisateur a demandé le détail d'un fichier */
  private _versionDetails$: EventEmitter<File> = new EventEmitter<File>();

  /** @event - l'utilisateur veut uploader une nouvelle version */
  private _addFile$: EventEmitter<File> = new EventEmitter<File>();

  /**
   * @constructor
   * @param {RestApiService} restService - service REST utlisé 
   */
  constructor(
    restService: RestApiService,
    private _session: SessionService
  ) {
    super(
      restService,            // service REST
      'fetchFilesByUser',     // méthode appelée sur le service REST pour charger la liste des fichiers
      true,                   // afficher le spinner de chargement
      () => {                 // actions à effectuer après chaque chargement/rechargement
        this.reload = false;
      }
    );
  }

  get userId(): number {
    return this._session.userId;
  }

  ngOnInit(): void {
    this.load([this.userId]);
  }

  /**
   * @event versionDetails - l'utilisateur a demandé à voir les détails d'un fichier
   * @returns {EventEmitter<File>} - le fichier que l'utilisateur a demandé à voir
   */
  @Output('versionDetails')
  get versionDetails$(): EventEmitter<File> {
    return this._versionDetails$;
  }

  @Output('addFile')
  get addFile$(): EventEmitter<File> {
    return this._addFile$;
  }

  /**
   * @param {File} file - fichier dont on veut les détails
   * @emits versionDetails - demande pour voir les détails d'un fichier
   */
  versionDetails(file: File): void {
    this._versionDetails$.emit(file);
  }

  /**
   * @param {File} file - le fichier auquel on veut ajouter une version
   * @emits addFile - demande d'ajout d'une nouvelle version à un fichier
   */
  addFile(file: File): void {
    this._addFile$.emit(file);
  }

}

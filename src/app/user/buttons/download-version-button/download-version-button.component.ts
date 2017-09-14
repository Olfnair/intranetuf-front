import { Component, Input } from '@angular/core';
import { RestApiService } from 'app/services/rest-api.service';
import { SessionService } from 'app/services/session.service';
import { Version } from 'entities/version';

@Component({
  selector: 'app-download-version-button',
  templateUrl: './download-version-button.component.html',
  styleUrls: ['./download-version-button.component.css']
})
export class DownloadVersionButtonComponent {

  private _downLoadLink: string = '';
  private _version: Version = undefined;

  private _text: string = undefined;

  /**
   * @constructor
   * @param {RestApiService} _restService - service REST utilisé
   * @param {SessionService} _session - informations globales de session
   */
  constructor(private _restService: RestApiService, private _session: SessionService) { }

  get downloadLink(): string {
    return this._restService.getDownloadLink(this._version);
  }

  get version(): Version {
    return this._version;
  }

  @Input()
  set version(version: Version) {
    this._version = version;
  }

  get text(): string {
    return this._text;
  }

  @Input()
  set text(text: string) {
    this._text = text;
  }

  /**
   * Renvoie le token de session de l'utilisateur courant en base64
   * @returns {string} - token de session de l'utilisateur courant en base64
   */
  getToken(): string {
    return this._session.base64AuthToken;
  }
}

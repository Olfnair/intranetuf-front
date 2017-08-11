/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input } from '@angular/core';

/**
 * Composant qui affiche une icone en fonction du statut passé en entrée
 */
@Component({
  selector: 'status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent {

  /** statut */
  private _status: string = '';

  /** @constructor */
  constructor() { }

  /** @property {string} - statut faisant partie de : ['check', 'warning', 'error'] */
  get status(): string {
    return this._status;
  }

  @Input() set status(status: string) {
    this._status = status;  
  }

}

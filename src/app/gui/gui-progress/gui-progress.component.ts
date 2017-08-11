/**
 * Auteur : Florian
 * License : 
 */

import { Component, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import { MD_DIALOG_DATA } from '@angular/material';
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";

/**
 * Composant Spinner de progression
 */
@Component({
  selector: 'gui-progress',
  templateUrl: './gui-progress.component.html',
  styleUrls: ['./gui-progress.component.css']
})
export class GuiProgressComponent implements OnInit {
  
  /** progression en % */
  private _progress: number = 0;
  
  /** souscription à l'observable qui indique la progression */
  private _sub: Subscription;

  /**
   * @constructor
   * @param {Observable<number>} _obs - Observable qui indique la progression
   * @param {NgZone} _zone - Objet qui permet de mettre à jour le composant (Injecté par le framework)
   */
  constructor(
    @Inject(MD_DIALOG_DATA) private _obs: Observable<number>,
    private _zone: NgZone
  ) { }

  /**
   * Après initialisation...
   */
  ngOnInit() {
    this._sub = this._obs.subscribe((value: number) => {
      this._zone.run(() => {
        this._progress = value;
      });
    });
  }

  /**
   * Après destruction du composant...
   */
  ngOnDestroy() {
    this._sub.unsubscribe(); // on libère les ressources
  }

  /** @property {number} progress - état de progression en % */
  get progress(): number {
    return this._progress;
  }

}

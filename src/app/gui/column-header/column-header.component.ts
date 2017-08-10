/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatatableColumn } from "../datatable";
import { ColumnParam } from ".";

/**
 * Etats possibles pour le tri d'une colonne
 * @enum
 */
enum OrderState {
  UNDEFINED = 0,  // Indéfini (ni croissant, ni décroissant)
  ASC = 1,        // Croissant
  DESC = 2        // Décroissant
}

/**
 * Header de colonne : titre, recherche, tri
 */
@Component({
  selector: 'column-header',
  templateUrl: './column-header.component.html',
  styleUrls: ['./column-header.component.css']
})
export class ColumnHeaderComponent {
  
  /** @enum - Etats possibles pour le tri d'un colonne */
  OrderState: typeof OrderState = OrderState; // on rend l'enum accessible depuis le template

  /** Informations sur la colonne */
  private _column: DatatableColumn = undefined;
  /** Etat actuel du tri de la colonne */
  private _orderState: OrderState = OrderState.UNDEFINED;
  
  // Events :
  /** @event - modification de l'ordre de tri */
  private _order$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();
  /** @event - modification du paramètre de recherche */
  private _search$: EventEmitter<ColumnParam> = new EventEmitter<ColumnParam>();

  /** @constructor */
  constructor() { }

  /** @property {OrderState} orderState - Etat actuel du tri (indéfini, croissant, décroissant) */
  get orderState(): OrderState {
    return this._orderState;
  }

  /** @property {DatatableColumn} column - informations de colonne */
  get column(): DatatableColumn {
    return this._column;
  }

  @Input()
  set column(column: DatatableColumn) {
    this._column = column;
  }

  /**
   * @event order - modification de l'ordre de tri
   * @returns {EventEmitter<ColumnParam>} - Le paramètre de colonne modifié
   */
  @Output('order')
  get order$(): EventEmitter<ColumnParam> {
    return this._order$;
  }

  /**
   * @event search - modification du paramètre de récherche
   * @returns {EventEmitter<ColumnParam>} - Le paramètre de colonne modifié
   */
  @Output('search')
  get search$(): EventEmitter<ColumnParam> {
    return this._search$;
  }

  /**
   * Réinitialise le composant
   */
  reset(): void {
    this._orderState = OrderState.UNDEFINED;
  }

  /**
   * Renvoie la chaine de caractères correspondant à l'état de tri actuel
   * @returns {string} - chaine de caractères correspondant à l'état de tri actuel
   */
  stateToString(): string {
    switch(this._orderState) {
      case OrderState.ASC:
        return 'ASC';
      case OrderState.DESC:
        return 'DESC';
      default:
        return undefined;
    }
  }

  /**
   * Bascule à l'état de tri suivant dans la chaine : undefined -> asc -> desc -> undefined -> ...
   * @emits order - changement d'ordre de tri
   */
  switchOrderState(): void {
    this._orderState = (this._orderState + 1) % 3;
    this._order$.emit(
      new ColumnParam(this._column.query ? this._column.query : this._column.label, this.stateToString())
    );
  }

  /**
   * Emet un event de recherche correspondant à la chaine param
   * @param {string} param - chaine de recherche
   * @emits search - changement du paramètre de recherche
   */
  columnSearch(param: string): void {
    this._search$.emit(new ColumnParam(this._column.query ? this._column.query : this._column.label, param));
  }

}

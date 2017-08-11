/**
 * Auteur : Florian
 * License : 
 */

import { Input, EventEmitter, Output } from '@angular/core';
import { NavListSelectable } from "app/gui/nav-list";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

/**
 * Menu/Liste de navigation
 */
export class NavList {
  
  /** titre de la liste */
  private _title: string = undefined;
  
  /** message d'erreur */
  private _error: string = undefined;
  
  /** message de liste vide */
  private _emptyMessage: string = undefined;

  /** éléments de la liste */
  private _selectables: NavListSelectable[] = undefined;
  
  // Events :
  /** @event - sélection d'un élément */
  private _select$: EventEmitter<NavListSelectable> = new EventEmitter<NavListSelectable>();
  /** @event - chargement terminé */
  private _loaded$: EventEmitter<void> = new EventEmitter<void>();

  /** sélection actuelle */
  private _selected: NavListSelectable = undefined;

  /** liste dense ou non */
  private _dense: boolean = false;

  /**
   * @constructor
   * @param _sanitizer - sanitizer pour les styles CSS (Passer celui injecté dans le composant utilisateur)
   */
  constructor(private _sanitizer: DomSanitizer) { }

  /** @property {string} title - titre de la liste */
  get title(): string {
    return this._title;
  }
  
  @Input()
  set title(title: string) {
    this._title = title;
  }
  
  /** @property {string} error - message d'erreur de chargement */
  get error(): string {
    return this._error;
  }
  
  @Input()
  set error(error: string) {
    this._error = error;
  }

  /** @property {string} emptyMessage - message quand la liste est vide après chargement */
  get emptyMessage(): string {
    return this._emptyMessage;
  }

  @Input()
  set emptyMessage(emptyMessage: string) {
    this._emptyMessage = emptyMessage;
  }

  /** @property {NavListSelection[]} selectables - Elements sélectionnables de la liste */
  get selectables(): NavListSelectable[] {
    return this._selectables;
  }

  @Input()
  set selectables(selectables: NavListSelectable[]) {
    this._selectables = selectables;
    this._loaded$.emit();
  }

  /** @property {NavListSelectable} selected - élément sélectionné dans la liste */
  get selected(): NavListSelectable {
    return this._selected;
  }
  
  @Input()
  set selected(selection: NavListSelectable) {
    this._selected = selection;
  }

  /** @property {boolean} dense - liste dense ou non */
  get dense(): boolean {
    return this._dense;
  }

  @Input()
  set dense(dense: boolean) {
    this._dense = dense;
  }

  /**
   * @event loaded - la liste est chargée
   * @returns {EventEmitter<void>}
   */
  @Output('loaded')
  get loaded$(): EventEmitter<void> {
    return this._loaded$;
  }

  /**
   * @event select - un élément a été sélectionné
   * @returns {EventEmitter<NavListSelectable>} - élément sélectionné
   */
  @Output('select')
  get select$(): EventEmitter<NavListSelectable> {
    return this._select$;
  }

  /**
   * Indique si l'élément selectable donné en paramètre est actuellement sélectionné dans la liste
   * @param {NavListSelectable} selectable - élément sélectionnable à tester
   * @returns {boolean} - true => sélectionné, false => non sélectionné
   */
  isSelected(selectable: NavListSelectable): boolean {
    return this._selected && this._selected == selectable;
  }

  /**
   * Sélectionne l'élément passé en paramètre
   * @param {NavListSelectable} selection - élément à sélectionner 
   */
  select(selection: NavListSelectable): void {
    this._selected = selection;
    this._select$.emit(this._selected);
  }

  /**
   * Renvoie la chaine à passer à l'attribut html 'dense' de la liste
   * @returns {string} - liste dense => '', liste non dense => null
   */
  isDense(): string {
    if(! this.dense) {
      return null;
    }
    return '';
  }

  /**
   * Rechargement : reset des éléments séléctionnables
   */
  startReload(): void {
    this._selectables = undefined;
  }

  /**
   * Formatte la couleur du texte passé en paramètre dans un SafeStyle
   * @param {string} textColor - couleur du texte
   * @param {string} defaultColor - couleur par défaut
   * @returns {SafeStyle} - la couleur demandée
   */
  getTextColor(textColor: string, defaultColor: string = '#000000'): SafeStyle {
    return this._sanitizer.bypassSecurityTrustStyle(textColor ? textColor : defaultColor);
  }
  
}
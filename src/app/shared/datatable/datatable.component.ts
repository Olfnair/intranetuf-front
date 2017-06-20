import { Component, OnInit, ContentChild, TemplateRef, Input, Directive, EventEmitter, Output } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";

export class Column {
  public label: string;
  public sortable: boolean;

  constructor(label: string = undefined, sortable: boolean = false) {
    this.label = label;
    this.sortable = sortable;
  }
}

export class Options {
  public selectionCol: boolean;
  public addButton: boolean;
  public addButtonTooltip: string;

  constructor(selectionCol: boolean = false, addButton: boolean = false, addButtonTooltip: string = undefined) {
    this.selectionCol = selectionCol;
    this.addButton = addButton;
    this.addButtonTooltip = addButtonTooltip;
  }
}

@Directive({
  selector: 'datatable-title'
})
export class DatatableTitle { }

@Directive({
  selector: 'datatable-header'
})
export class DatatableHeader { }

@Directive({
  selector: 'datatable-footer'
})
export class DatatableFooter { }

@Component({
  selector: 'datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent<T> implements OnInit {
  @ContentChild(TemplateRef)
  private _contentTpl: TemplateRef<Element>;

  // events
  private _addButtonClick$: EventEmitter<void> = new EventEmitter<void>();
  private _selectedDataUpdate$: EventEmitter<T[]> = new EventEmitter<T[]>();

  // titres colonnes et données
  private _columns: Column[] = [];
  private _data: T[] = [];

  // sélection des rangées (checkbox)
  private _selectedData: T[] = [];
  private _selectAllTrue: boolean = false;
  private _selectAllFalse: boolean = false;

  /* options :
   * selectionCol: boolean => Crée une colonne de sélection pour les rangées : émet (selectedDataUpdate) quand les données selectionnées changent
   * addButton: boolean => Bouton pour ajouter des données : émet (addButtonClick) quand on click dessus
   * addButtonTooltip: string => le texte du tooltip quand on survole le bouton addButton (optionnel)
   */
  private _options: Options = new Options();

  constructor() { }

  ngOnInit() {
  }

  @Output('addButtonClick') get addButtonClick(): EventEmitter<void> {
    return this._addButtonClick$;
  }

  @Output('selectedDataUpdate') get selectedDataUpdate(): EventEmitter<T[]> {
    return this._selectedDataUpdate$;
  }

  get data(): T[] {
    return this._data;
  }

  @Input() set data(data: T[]) {
    if (data) {
      this._data = data;
    }
  }

  get columns(): Column[] {
    return this._columns;
  }

  @Input() set columns(columns: Column[]) {
    this._columns = columns;
  }

  @Input() set options(options: Options) {
    if (options.selectionCol) {
      this._options.selectionCol = options.selectionCol;
    }
    if (options.addButton) {
      this._options.addButton = options.addButton;
    }
    if (options.addButtonTooltip) {
      this._options.addButtonTooltip = options.addButtonTooltip;
    }
  }

  get options(): Options {
    return this._options;
  }

  get selectAllTrue(): boolean {
    return this._selectAllTrue;
  }

  get selectAllState(): boolean {
    if (this._selectAllTrue) { return true; }
    if (this._selectAllFalse) { return false; }
    return undefined;
  }

  add(): void {
    this._addButtonClick$.emit();
  }

  setSelectAllState(event: MdCheckboxChange): void {
    this._selectAllTrue = event.checked;
    this._selectAllFalse = !event.checked;
  }

  checkSelect(event: MdCheckboxChange, item: T): void {
    let index: number = this._selectedData.indexOf(item);
    if (!event.checked && index !== -1) {
      this._selectedData.splice(index, 1);
      this._selectAllTrue = false;
      this._selectedDataUpdate$.emit(this._selectedData);
    }
    else if (event.checked && index === -1) {
      this._selectedData.push(item);
      this._selectedDataUpdate$.emit(this._selectedData);
    }
  }

}

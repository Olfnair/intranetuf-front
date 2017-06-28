import { Component, OnInit, ContentChild, TemplateRef, Input, Directive, EventEmitter, Output } from '@angular/core';
import { MdCheckboxChange } from "@angular/material";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

export class Column {
  public label: string;
  public sortable: boolean;

  constructor(label: string = undefined, sortable: boolean = false) {
    this.label = label;
    this.sortable = sortable;
  }
}

export class Options {
  // une colonne supplémentaire avec des cases à cocher pour sélectionner les lignes
  public selectionCol: boolean = false;
  
  // bouton d'ajout et le texte affiché quand on le survole
  public addButton: boolean = false;
  public addButtonTooltip: string = undefined
  
  // afficher ou non le footer
  public displayFooter: boolean = false;

  // afficher ou non les titres de colonne quand la table est vide
  public displayEmpty: boolean = false

  // message si la table est vide
  public emptyMessage: string = undefined;

  constructor() { }
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
  private _emptyData: boolean = true;

  // Observable qui sert à charger les données
  private _dataObservable: Observable<T[]>;
  private _loading: boolean = true;
  private _loadingError: boolean = false;

  // sélection des rangées (checkbox)
  private _selectedData: T[] = [];
  private _selectAllTrue: boolean = false;
  private _selectAllFalse: boolean = false;

  /* options :
   * selectionCol: boolean => Crée une colonne de sélection pour les rangées : émet (selectedDataUpdate) quand les données selectionnées changent
   * addButton: boolean => Bouton pour ajouter des données : émet (addButtonClick) quand on click dessus
   * addButtonTooltip: string => le texte du tooltip quand on survole le bouton addButton (optionnel)
   * displayFooter: boolean => afficher ou non le footer
   * displayEmpty: boolean => afficher ou non les têtes de colonne quand la table est vide
   * emptyMessage: string => message à afficher quand la table est vide
   */
  private _options: Options = new Options(); // génère les options par défaut

  constructor() { }

  ngOnInit() {
  }

  @Output('addButtonClick') get addButtonClick(): EventEmitter<void> {
    return this._addButtonClick$;
  }

  @Output('selectedDataUpdate') get selectedDataUpdate(): EventEmitter<T[]> {
    return this._selectedDataUpdate$;
  }

  get columns(): Column[] {
    return this._columns;
  }

  @Input() set columns(columns: Column[]) {
    this._columns = columns;
  }

  get data(): T[] {
    return this._data;
  }

  private startLoading(): void {
    this.loading = true;
    this.loadingError = false
  }

  private endLoading(sub: Subscription): void{
    if(sub) {
      sub.unsubscribe();
    }
    this.loading = false;
  }

  @Input() set dataObs(dataObservable: Observable<T[]>) {
    if(dataObservable == undefined || dataObservable == null) {
      return;
    }
    this.startLoading();
    let sub: Subscription = dataObservable.subscribe(
      (data: T[]) => { // ok
        if (data) {
          this._data = data;
          this.emptyData = (this._data.length <= 0);
        }
        else {
          this.emptyData = true;
        }
      },
      (error: any) => { // erreur
        this.loadingError = true;
      },
      () => { // finalement
        this.endLoading(sub);
      }
    );
  }

  set loading(loading: boolean) {
    this._loading = loading;
  }

  get loading(): boolean {
    return this._loading;
  }

  set loadingError(loadingError: boolean) {
    this._loadingError = loadingError; 
  }

  get loadingError():boolean {
    return this._loadingError;
  }

  get emptyData(): boolean {
    return this._emptyData;
  }

  set emptyData(value: boolean) {
    // On utilise un timeout parce que cette propriété est normalement déterminée lors d'un changement des données (@Input data) passées à la table,
    // ce qui entraine une détection de changement au niveau du modèle (code des fichiers .ts) pour modifier la vue (le html est modifié).
    // C'est cette détection qui change la valeur de la propriété en appelant set emptyData() via @Input() set data()
    // Or, la propriété get emptyData() est aussi utilisée dans la vue. Donc, la modifier entraine une détéction de changement du modèle.
    // Angular affiche une erreur (qui est en fait un warning) si une détection de changement entraine un autre changement immédiat.
    // L'idée est d'éviter qu'un changement en entraine un autre parce que celà peut créer une boucle infinie, une vue pas à jour ou un modèle instable
    // en fonction de la manière dont angular gère ce cas.
    // On met donc un timer de 0 pour que le changement de la propriété ne soit détecté qu'au prochain tick de mise à jour de la vue et on évite l'erreur.
    setTimeout(() => {
      this._emptyData = value;
    }, 0);
  }

  @Input() set options(options: Options) {
    this._options = options;
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

  get nbCols(): number {
    return this._columns.length + (this._options.selectionCol ? 1 : 0);
  }

  add(): void {
    this._addButtonClick$.emit();
  }

  setSelectAllState(event: MdCheckboxChange): void {
    this._selectAllTrue = event.checked;
    this._selectAllFalse = !event.checked;
  }

  checkSelect(event: MdCheckboxChange, item: T, last: boolean): void {
    let index: number = this._selectedData.indexOf(item);
    let update: boolean = false;
    if (!event.checked && index !== -1) {
      this._selectedData.splice(index, 1);
      this._selectAllTrue = false;
      update = true;
    }
    else if (event.checked && index === -1) {
      this._selectedData.push(item);
      update = true;
    }
    // On emet un évènement si il y a eu mise à jour et qu'il n'y en a pas d'autres qui vont suivre
    // (sinon, on va attendre la dernière pour envoyer l'event, pas de flood inutile...)
    if(update && (this.selectAllState == undefined || (this.selectAllState != undefined && last))) {
      this._selectedDataUpdate$.emit(this._selectedData);
    }
  }

}

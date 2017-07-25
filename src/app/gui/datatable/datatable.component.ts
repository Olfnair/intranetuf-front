import {
  Component,
  ContentChild,
  TemplateRef,
  Input,
  Directive,
  EventEmitter,
  Output
} from '@angular/core';
import { MdCheckboxChange } from "@angular/material";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import {
  DatatableColumn,
  DatatableOptions,
  DatatableSelection,
  DatatableQueryParams,
  DatatableQueryOptions,
  DatatablePaginator
} from ".";
import { ColumnParam, ColumnHeaderComponent } from "../column-header";

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
export class DatatableComponent<T> {
  @ContentChild(TemplateRef)
  private _content: TemplateRef<Element>;

  // events
  private _addButtonClick$: EventEmitter<void> = new EventEmitter<void>();
  private _selectedDataUpdate$: EventEmitter<DatatableSelection<T>[]> = new EventEmitter<DatatableSelection<T>[]>();

  // event des params recherche/ordre
  private _params$: EventEmitter<DatatableQueryParams> = new EventEmitter<DatatableQueryParams>();

  // titres colonnes et données
  private _columns: DatatableColumn[] = [];
  private _paginator: DatatablePaginator<T> = new DatatablePaginator<T>();
  private _emptyData: boolean = true;

  // chargement
  private _loading: boolean = true;
  private _loadingError: boolean = false;

  // sélection des rangées (checkbox)
  private _selectedData: DatatableSelection<T>[] = [];
  private _selectAllTrue: boolean = false;
  private _selectAllFalse: boolean = false;

  // si le displayToggle est actif
  private _showContent: boolean = false;

  // paramètres de recherche/ordre
  private _params: DatatableQueryParams = new DatatableQueryParams();

  /* options :
   * selectionCol: boolean => Crée une colonne de sélection pour les rangées :
   *  émet (selectedDataUpdate) quand les données selectionnées changent
   * addButton: boolean => Bouton pour ajouter des données : émet (addButtonClick) quand on click dessus
   * addButtonTooltip: string => le texte du tooltip quand on survole le bouton addButton (optionnel)
   * displayFooter: boolean => afficher ou non le footer
   * displayEmpty: boolean => afficher ou non les têtes de colonne quand la table est vide
   * emptyMessage: string => message à afficher quand la table est vide
   */
  private _options: DatatableOptions = new DatatableOptions(); // génère les options par défaut

  constructor(private _sanitizer: DomSanitizer) { }

  @Output('addButtonClick') get addButtonClick(): EventEmitter<void> {
    return this._addButtonClick$;
  }

  @Output('selectedDataUpdate') get selectedDataUpdate(): EventEmitter<DatatableSelection<T>[]> {
    return this._selectedDataUpdate$;
  }

  @Output('params') get order(): EventEmitter<DatatableQueryParams> {
    return this._params$;
  }

  get columns(): DatatableColumn[] {
    return this._columns;
  }

  @Input() set columns(columns: DatatableColumn[]) {
    this._columns = columns;
  }

  get content(): T[] {
    return this._paginator.content;
  }

  private startLoading(reload?: boolean): void {
    if (reload) {
      this._params.reset();
    }
    this.loading = reload ? true : this.loading;
    this.loadingError = false;
  }

  private endLoading(sub?: Subscription): void {
    if (sub) {
      sub.unsubscribe();
    }
    this.emptyData = this.content.length <= 0;
    this.loading = false;
  }

  @Input() set data(obs: Observable<DatatablePaginator<T>>) {
    this.startLoading(this._paginator.reloadBetweenPages);
    if (obs == undefined || obs == null) {
      // Ici, je suppose que le chargement est en cours et que l'Observable sera mis à jour plus tard.
      // J'arrête donc ici et laisse la table dans l'état 'en cours de chargement'.
      return;
    }
    let sub: Subscription = obs.finally(() => {
      this.endLoading(sub); // finalement
    }).subscribe(
      (paginator: DatatablePaginator<T>) => { // ok
        if(paginator instanceof DatatablePaginator) {
          this._paginator = paginator;
        }
        else { // en fait on peut passer un simple observable content un tableau de données aussi...
          let data: T[] = paginator;
          this._paginator = new DatatablePaginator<T>(data.length);
          this._paginator.goToPage(1, data, data.length);
          this._paginator.reloadBetweenPages = true;
        }
      },
      (error: any) => { // erreur
        this.loadingError = true;
      },
      () => { // complete (pas d'erreur)
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

  get loaded(): boolean {
    return !this._loading && !this._loadingError;
  }

  set loadingError(loadingError: boolean) {
    this._loadingError = loadingError;
  }

  get loadingError(): boolean {
    return this._loadingError;
  }

  get emptyData(): boolean {
    return this._emptyData;
  }

  set emptyData(value: boolean) {
    this._emptyData = value;
  }

  @Input() set options(options: DatatableOptions) {
    this._options = options;
  }

  get options(): DatatableOptions {
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

  get showContent(): boolean {
    return this._showContent;
  }

  get params(): DatatableQueryParams {
    return this._params;
  }

  get paginator(): DatatablePaginator<T> {
    return this._paginator;
  }

  add(): void {
    this._addButtonClick$.emit();
  }

  resetSelections(): void {
    this._selectedData = [];
    this._selectAllTrue = false;
    this._selectAllFalse = false;
  }

  setSelectAllState(event: MdCheckboxChange): void {
    this._selectAllTrue = event.checked;
    this._selectAllFalse = !event.checked;
  }

  getSelectionIndex(id: number): number {
    for (let i = 0; i < this._selectedData.length; ++i) {
      if (this._selectedData[i] && this._selectedData[i].id == id) {
        return i;
      }
    }
    return -1;
  }

  isSelected(id: number): boolean {
    return this.getSelectionIndex(id) >= 0;
  }

  checkSelect(event: MdCheckboxChange, id: number, item: T, last: boolean): void {
    let index: number = this.getSelectionIndex(id); // récupère l'index de la sélection dans le tableau si elle existe
    let update: boolean = false;
    if (!event.checked && index >= 0) { // suppression
      this._selectAllTrue = false; // si on supprime, on ne sélectionne plus tout
      this._selectedData[index] = undefined; // on marque l'élément à supprimer
      update = true;
    }
    else if (event.checked && index < 0) { // ajout
      this._selectAllFalse = false; // si on ajoute, on ne déselectionne pas tout
      this._selectedData.push(new DatatableSelection<T>(id, item));
      update = true;
    }
    // On emet un évènement si il y a eu mise à jour et qu'il n'y en a pas d'autres qui vont suivre
    // (Sinon, on va attendre la dernière pour envoyer l'event. Pas de flood inutile...)
    // on s'assure que l'event soit émit à tous les coups si c'est la dernière mise à jour, même en cas d'erreur
    // this.selectAllState != undefined indique une sélection ou désélection globale et donc, d'autres mises à jour à attendre
    if (update && this.selectAllState == undefined || last) {
      this._delUndefinedSelect();
      this._selectedDataUpdate$.emit(this._selectedData);
      console.log(JSON.stringify(this._selectedData));
    }
  }

  private _delUndefinedSelect(): void {
    // effectue les suppressions avant d'emettre les données
    let newSelectedData: DatatableSelection<T>[] = [];
    for (let selection of this._selectedData) {
      if (selection != undefined) {
        newSelectedData.push(selection);
      }
    }
    this._selectedData = newSelectedData;
  }

  emitParams(): void {
    this._params.index = this._paginator.pageToIndex(this._paginator.currentPageNum);
    this._params.limit = this._paginator.pagesSize;
    this._params$.emit(this._params);
  }

  setParam(params: DatatableQueryOptions, columnParam: ColumnParam): void {
    params.set(columnParam.col, columnParam.param);
    this.emitParams();
  }

  setOrderParam(columnParam: ColumnParam): void {
    this.setParam(this._params.orderParams, columnParam);
  }

  setSearchParam(columnParam: ColumnParam): void {
    this.paginator.goToIndex(0, [], 0);
    this.setParam(this._params.searchParams, columnParam);
  }

  toggleDisplay(): void {
    this._showContent = !this._showContent;
  }

  columnWidth(width: string): SafeStyle {
    return this._sanitizer.bypassSecurityTrustStyle(width ? width : '');
  }

  setPageSize(pageSize: number): void {
    this._paginator.pagesSize = pageSize;
  }

  goToPage(pageNum: number): boolean {
    let ret = this._paginator.goToPage(pageNum);
    if(ret) {
      this.emitParams();
    }
    return ret;
  }

  goToPrevPage(): boolean {
    return this.goToPage(this._paginator.currentPageNum - 1);
  }

  goToNextPage(): boolean {
    return this.goToPage(this._paginator.currentPageNum + 1);
  }

  goToFirstPage(): boolean {
    return this.goToPage(1);
  }

  goToLastPage(): boolean {
    return this.goToPage(this._paginator.totalPages);
  }
}
/**
 * Auteur : Florian
 * License :
 */

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
  DatatableQueryParams,
  DatatableQueryOptions,
  DatatablePaginator
} from ".";
import { ColumnParam } from "../column-header";

/**
 * Titre de DatatableComponent
 */
@Directive({
  selector: 'datatable-title'
})
export class DatatableTitle { }


/**
 * Header de DatatableComponent : permet d'ajouter du contenu en tout début de datatable
 */
@Directive({
  selector: 'datatable-header'
})
export class DatatableHeader { }

/**
 * Permet d'ajouter une dernière rangée et son contenu à DatatableComponent
 */
@Directive({
  selector: 'datatable-final-row'
})
export class DatatableFinalRow { }

/**
 * Footer de la table : affiché tout en bas.
 * Passer l'option {displayFooter: true} à DatatableComponent pour l'afficher.
 */
@Directive({
  selector: 'datatable-footer'
})
export class DatatableFooter { }

/**
 * Composant Datatable générique :
 * @desc Contient un DatatablePaginator qui gère le contenu de la datatable et la pagination
 * @desc Contient un DatatableQueryParams pour gérer les recherches/tris
 * @desc Utilisation :
 * l'utilisateur du composant doit spécifier un template pour l'affichage des lignes de la datatable :
 * <datatable [options]="..." [data]="personnes">
 *   <ng-template let-personne="item">
 *     <td>{{personne.nom}}</td>...<td>{{personne.adresse}}</td>
 *   </ng-template>
 * </datatable>
 */
@Component({
  selector: 'datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.css']
})
export class DatatableComponent<T, RestService> {
  /**
   * Template d'affichage pour une ligne :
   * l'utilisateur du composant doit spécifier un template pour l'affichage des lignes de la datatable :
   * <ng-template><td>contenu_cell_1</td>...<td>...</td><ng-template>
   */
  @ContentChild(TemplateRef)
  private _content: TemplateRef<Element>;

  // Events :
  /** @event - click sur le bouton 'ajouter' */
  private _addButtonClick$: EventEmitter<void> = new EventEmitter<void>();
  /** @event - lignes sélectionnées */
  private _selectedDataUpdate$: EventEmitter<Map<number, T>> = new EventEmitter<Map<number, T>>();
  /** @event - paramètres de recherche/tri/pagination */
  private _queryParams$: EventEmitter<DatatableQueryParams> = new EventEmitter<DatatableQueryParams>();

  // Titres colonnes et données :
  /** Spécification des colonnes */
  private _columns: DatatableColumn[] = [];
  /** Paginateur : gestion des pages et du contenu */
  private _paginator: DatatablePaginator<T, RestService> = new DatatablePaginator<T, RestService>();
  private _emptyData: boolean = true;

  // Chargement :
  /** La table est en train de charger des données (depuis le back-end) */
  private _loading: boolean = true;
  /** Erreur lors du chargement */
  private _loadingError: boolean = false;

  // Sélection des lignes (checkbox) :
  /**
   * Map id ligne sélectionnée -> contenu de la ligne
   * @desc L'id est soit l'index du contenu dans la datatable, soit l'id du contenu quand il existe.
   */
  private _selectedData: Map<number, T> = new Map<number, T>();
  /** Sélection de toutes les lignes */
  private _selectAllTrue: boolean = false;
  /** Désélection de toutes les lignes */
  private _selectAllFalse: boolean = false;

  /**
   * Affiche le contenu
   * @desc N'est évalué que si l'option {displayToggle: true} est utilisée.
   */
  private _showContent: boolean = false;

  /** paramètres de recherche/tri/pagination */
  private _params: DatatableQueryParams = new DatatableQueryParams();

  /** options/configuration de la datatable */
  private _options: DatatableOptions = new DatatableOptions(); // génère les options par défaut

  /**
   * @constructor
   * @param {DomSanitizer} _sanitizer - sanitizer utilisé pour insérer du style conditionnel dans la page
   */
  constructor(private _sanitizer: DomSanitizer) { }

  /**
   * @event addButtonClick - L'utilisateur a cliqué sur le bouton ajouter
   * @returns {EventEmitter<void>}
   */
  @Output('addButtonClick')
  get addButtonClick$(): EventEmitter<void> {
    return this._addButtonClick$;
  }

  /**
   * @event selectedDataUpdate - Les données sélectionnées ont changé
   * @returns {EventEmitter<Map<number, T>>} - Map id -> donnée
   */
  @Output('selectedDataUpdate')
  get selectedDataUpdate$(): EventEmitter<Map<number, T>> {
    return this._selectedDataUpdate$;
  }

  /**
   * @event queryParams - Les paramètres de recherche/tri/pagination ont changé
   * @returns {EventEmitter<DatatableQueryParams>} - Les paramètres de recherche/tri/pagination
   */
  @Output('queryParams')
  get queryParams$(): EventEmitter<DatatableQueryParams> {
    return this._queryParams$;
  }

  /** @property {DatatableColumn[]} columns - Spécification des colonnes */
  get columns(): DatatableColumn[] {
    return this._columns;
  }

  @Input() set columns(columns: DatatableColumn[]) {
    this._columns = columns;
  }

  /** @property {T[]} content - Contenu de la datatable */
  get content(): T[] {
    return this._paginator.content;
  }

  /** @private Mets à jour le map des sélections (id -> data) après un rechargement des données */
  private updateSelection(): void {  
    this.content.forEach((data: T, index: number) => {
      index = data['id'] != undefined ? data['id'] : index;
      // on s'intéresse aux id's qui sont sélectionnés et qui correspondent à du contenu qu'on a rechargé :
      if(this._selectedData.has(index)) {
        // mise à jour du contenu
        this._selectedData.set(index, data);
      }
    });
  }

  /**
   * @private Passe la datatable à l'état 'startLoading' : début de chargement du contenu
   * @param {boolean} reload - afficher le spinner de rechargement de la table ou non 
   */
  private startLoading(reload?: boolean): void {
    if (reload) {
      this._params.reset();
    }
    this.loading = reload ? true : this.loading;
    this.loadingError = false;
  }

  /**
   * @private Passe la datatable à l'état 'endLoading': chargement terminé
   * @param {Subscription} sub - Subscription à l'observable qui a servi à charger les données de la datatable
   */
  private endLoading(sub?: Subscription): void {
    if (sub) {
      sub.unsubscribe();
    }
    this.emptyData = this.content.length <= 0;
    this.loading = false;
  }

  /**
   * @property {Observable<DatatablePaginator<T, RestService>} data - Observable sur les données de la datatable.
   * @desc Rechargement automatique des données de la table chaque fois qu'un nouvel observable est passé
   * en paramètre.
   */
  @Input()
  set data(obs: Observable<DatatablePaginator<T, RestService>>) {
    this.startLoading(this._paginator.reloadBetweenPages);
    if (obs == undefined) {
      // Ici, je suppose que le chargement est en cours et que l'Observable sera mis à jour plus tard.
      // J'arrête donc ici et laisse la table dans l'état 'en cours de chargement'.
      return;
    }
    
    // Chargement des données :
    let sub: Subscription = obs.finally(() => {
      this.endLoading(sub);                                 // Finalement, quand on a chargé, on libère les ressources
    }).subscribe(
      (paginator: DatatablePaginator<T, RestService>) => {  // Ok : données chargées avec succès
        if(paginator instanceof DatatablePaginator) {
          this._paginator = paginator;
        }
        else { // en fait on peut passer un simple observable contenant un tableau de données aussi...
          let data: T[] = paginator;
          this._paginator = new DatatablePaginator<T, RestService>(data.length);
          this._paginator.goToPage(1, data, data.length);
          this._paginator.reloadBetweenPages = true;
        }
        this.updateSelection(); // mise à jour des lignes sélectionnées
      },
      (error: any) => {                                     // Erreur lors du chargement
        this.loadingError = true;
      },
      () => { // en complément du finally, pour être sûr    // Complete : (pas d'erreur)
        this.endLoading(sub);
      }
    );
  }

  /** @property {boolean} loading - indique un chargement en cours ou non */
  get loading(): boolean {
    return this._loading;
  }

  set loading(loading: boolean) {
    this._loading = loading;
  }

  /** @property {boolean} loaded - indique datatable chargée sans erreur ou non */
  get loaded(): boolean {
    return ! this._loading && ! this._loadingError;
  }

  /** @property {boolean} loadingError - indique qu'il y a eu une erreur pendant le chargement ou non */
  get loadingError(): boolean {
    return this._loadingError;
  }

  set loadingError(loadingError: boolean) {
    this._loadingError = loadingError;
  }

  /** @property {boolean} emptyData - indique datatable vide ou non */
  get emptyData(): boolean {
    return this._emptyData;
  }

  set emptyData(value: boolean) {
    this._emptyData = value;
  }

  /** @property {DatatableOptions} options - options/configuration de la datatable */
  get options(): DatatableOptions {
    return this._options;
  }

  @Input()
  set options(options: DatatableOptions) {
    this._options.copy(options);
  }

  /** @property {boolean} selectAllTrue - sélectionner toutes les lignes ou non */
  get selectAllTrue(): boolean {
    return this._selectAllTrue;
  }

  /** @property {boolean} selectAllState -
   * Sélectionner/déselectionner toutes les lignes ou undefined : garder l'état actuel pour chaque ligne
   */
  get selectAllState(): boolean {
    if (this._selectAllTrue) { return true; }
    if (this._selectAllFalse) { return false; }
    return undefined;
  }

  /** @property {number} tableSpan - largeur de la table, en colonnes */
  get tableSpan(): number {
    return this._columns.length + (this._options.selectionCol ? 1 : 0);
  }

  /** @property {boolean} showContent - afficher le contenu ou non (avec options: {displayToggle: true}) */
  get showContent(): boolean {
    return this._showContent;
  }

  /** @property {DatatableQueryParams} params - paramètres de recherche/tri/pagination */
  get params(): DatatableQueryParams {
    return this._params;
  }

  /** @property {DatatablePaginator<T, RestService>} paginator -  */
  get paginator(): DatatablePaginator<T, RestService> {
    return this._paginator;
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur le bouton ajouter
   * @emits addButtonClick
   */
  add(): void {
    this._addButtonClick$.emit();
  }

  /** Réinitialisation de la sélection globale */
  resetSelectAllState(): void {
    this._selectAllTrue = false;
    this._selectAllFalse = false;
  }

  /** Réinitialisation des sélections à aucune sélection */
  resetSelections(): void {
    this._selectedData.clear();
    this.resetSelectAllState();
  }

  /**
   * Méthode qui détermine l'état de la sélection globale
   * @param {MdCheckboxChange} event - changement d'état de la checkbox de sélection globale 
   */
  setSelectAllState(event: MdCheckboxChange): void {
    this._selectAllTrue = event.checked;
    this._selectAllFalse = ! event.checked;
  }

  /**
   * Méthode qui récupère l'identifiant d'un item (donnée) contenu dans la datatable
   * @param {T} item - donnée dont on veut l'identifiant 
   * @param {number} index - index de la donnée dans le contenu courant de la table
   */
  getId(item: T, index: number = 0) {
    return item['id'] ? item['id'] : index + this._paginator.pageToIndex(this._paginator.currentPageNum);
  }

  /**
   * @private Indique si l'id passé en paramètre correspond à un item (donnée) sélectionné ou non
   * @param {number} id - l'identifiant de l'item duqel on veut savoir s'il est sélectionné ou non 
   * @returns {boolean} - true si l'id correspond à un item sélectionné, false sinon
   */
  private isIdSelected(id: number): boolean {
    return this._selectedData.has(id);
  }

  /**
   * Indique si un item est sélectionné en fonction de son id ou de son index dans le contenu courant
   * @param {T} item - item dont on veut savoir s'il est sélectionné ou pas
   * @param {number} index - index de l'item dans le contenu courant de la datatable
   */
  isItemSelected(item: T, index: number = 0): boolean {
    // on récupère l'id de l'item et on demande s'il est sélectionné
    return this.isIdSelected(this.getId(item, index));
  }

  /**
   * @private Indique si la case de sélection de l'item est cochée ou non
   * @param {T} item - item dont on veut savoir si la case de sélection doit être cochée ou non
   * @param {number} index - index de l'item dans la contenu courant de la datatable
   */
  private isItemChecked(item: T, index: number = 0): boolean {
    return this.selectAllState || this.selectAllState == undefined && this.isItemSelected(item, index);
  }

  /**
   * @private Met à jour la sélection de l'item à l'emplacement index en fonction de l'event
   * @param {MdCheckboxChange} event - nouvel état de la case de sélection de l'item
   * @param {T} item - item (donnée) dont on veut mettre à jour la sélection
   * @param {number} index - index de l'item dans le contenu courant de la datatable
   */
  private checkSelect(event: MdCheckboxChange, item: T, index: number): void {
    let id: number = this.getId(item, index);
    let itemSelected: boolean = this.isIdSelected(id);  // cherche si l'item est déjà sélectionné
    let update: boolean = false;
    if (! event.checked && itemSelected) {              // suppression :
      this._selectAllTrue = false;                      // On supprime, donc on ne sélectionne plus tout
      this._selectedData.delete(id);                    // suppression de l'item
      update = true;
    }
    else if (event.checked && ! itemSelected) {         // ajout :
      this._selectAllFalse = false;                     // On ajoute, donc on ne déselectionne pas tout
      this._selectedData.set(id, item);                 // ajout de l'item
      update = true;
    } 
    if(update) {
      // émet event de mise à jour des sélections 'selectedDataUpdate'
      this._selectedDataUpdate$.emit(this._selectedData);
    }
  }

  /**
   * @private
   * @emits queryParams - les paramètres de requête courants de la datatable (recherche/tri/pagination)
   */
  private emitParams(): void {
    // on récupère les paramètres de pagination depuis le paginator :
    this._params.index = this._paginator.pageToIndex(this._paginator.currentPageNum);
    this._params.limit = this._paginator.pagesSize;
    
    this._queryParams$.emit(this._params); // emet un event 'queryParams'
  }

  /**
   * @private Affecte columnParam, un paramètre de requête, aux paramètres courants de params
   * @param {DatatableQueryOptions} params - les paramètres à mettre à jour 
   * @param {ColumnParam} columnParam - le paramètre à affecter
   */
  private setParam(params: DatatableQueryOptions, columnParam: ColumnParam): void {
    params.set(columnParam.col, columnParam.param);
    this.emitParams();
  }

  /**
   * Affecte un columnParam, paramètre de tri, aux paramètres de requête courants de la datatable
   * @param {ColumnParam} columnParam - le paramètre de tri à affecter
   */
  setOrderParam(columnParam: ColumnParam): void {
    this.setParam(this._params.orderParams, columnParam);
  }

  /**
   * Affecte un columnParam, paramètre de recherche, aux paramètres de requête courants de la datatable
   * @param {ColumnParam} columnParam - le paramètre de recherche à affecter
   */
  setSearchParam(columnParam: ColumnParam): void {
    this.resetSelections();                                 // suppression des sélections
    this.paginator.goToIndex(0, [], 0);                     // retour à la première page (index 0)
    this.setParam(this._params.searchParams, columnParam);
  }

  /**
   * bascule entre l'affichage complet / réduit au header quand {displayToggle: true}
   * fait partie des options de la datatable
   */
  toggleDisplay(): void {
    this._showContent = ! this._showContent;
  }

  /**
   * Renvoie la largeur d'affichage (CSS : width property) correspondant à la chaine width.
   * Utilisée pour indiquer que le style peut être trusté (ce n'est pas une entrée de l'utilisateur final)
   * @param {string} width - la largeur sous forme de chaine de caractères
   * @returns {SafeStyle} - le paramètre width en CSS 
   */
  private columnWidth(width: string): SafeStyle {
    return this._sanitizer.bypassSecurityTrustStyle(width ? width : '');
  }

  /**
   * Charge le contenu de la page pageNum en tenant compte des paramètres de requêtes courants
   * @param pageNum - le numéro de page à charger (commence à 1)
   * @returns {boolean} - true si la page existe, false sinon 
   */
  goToPage(pageNum: number): boolean {
    if(! this._paginator.goToPage(pageNum)) { // demande la page pageNum au paginator
      // garde : la page doit exister
      return false;
    }
    this.emitParams();          // on émet les paramètres de requête pour demander une mise à jour du contenu
    this.resetSelectAllState(); // décoche la case 'tout sélectionner' en cas de changement de page

    if(this.options.resetSelectionOnPageChange) {
      this._selectedData.clear();                         // suppression des sélections
      this._selectedDataUpdate$.emit(this._selectedData); // emet event 'selectedDataUpdate'
    }

    return true;
  }

  /**
   * Charge la page précedente si elle existe : si la page courante est n € N, on se retouve à la page n - 1
   * @returns {boolean} - true si la page existe, sinon false
   */
  goToPrevPage(): boolean {
    return this.goToPage(this._paginator.currentPageNum - 1);
  }

  /**
   * Charge la page suivante si elle existe : si la page courante est n € N, on se retouve à la page n + 1
   * @returns {boolean} - true si la page existe, sinon false
   */
  goToNextPage(): boolean {
    return this.goToPage(this._paginator.currentPageNum + 1);
  }

  /**
   * Charge la première page si elle existe (page numéro 1)
   * @returns {boolean} - true si la page existe, sinon false
   */
  goToFirstPage(): boolean {
    return this.goToPage(1);
  }

  /**
   * Charge la dernière page si elle existe
   * @returns {boolean} - true si la page existe, sinon false
   */
  goToLastPage(): boolean {
    return this.goToPage(this._paginator.totalPages);
  }
}

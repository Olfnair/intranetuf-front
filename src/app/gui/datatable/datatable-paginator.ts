/**
 * Auteur : Florian
 * License : 
 */

import { DatatablePage } from "./datatable-page";
import { DatatableQueryParams } from "./datatable-query-params";
import { Observer } from "rxjs/Observer";
import { Observable } from "rxjs/Observable";

/**
 * Paginateur : gère la pagination
 * @param T - Type de contenu
 * @param RestService - Classe du service REST à appeler pour charger le contenu
 */
export class DatatablePaginator<T, RestService> {
  
  /** Page courante : contient les données */
  private _page: DatatablePage<T>;
  
  /** Nombre total d'éléments (toutes pages comprises) */
  private _totalItemsCount: number = 0;
  
  /** numéro de page actuelle */
  private _currentPageNum: number = 1;
  
  /** nombre total de pages */
  private _totalPages = 0;
  
  /** afficher le spinner de chargement lors du rechargement des données */
  private _reloadBetweenPages: boolean = true;

  /**
   * constructor
   * @param {number} pagesSize - taille max des pages => nbre d'éléments affichables (20 par défaut)
   */
  constructor(pagesSize: number = 20) {
    this._page = new DatatablePage<T>(pagesSize);
  }
  
  /**
   * Met à jour le contenu de la page et le nombre d'éléments total
   * @param {T[]} content - contenu à mettre sur la page
   * @param {number} totalItemsCount - nombre total d'éléments (toutes pages comprises) 
   */
  setPageContent(content: T[], totalItemsCount: number = 0): boolean {
    let ret = this._page.setContent(content);
    if(! ret) { return false; }
    this._totalItemsCount = totalItemsCount;
    return true;
  }

  /** @property {T[]} content - contenu de la page courante */
  get content(): T[] {
    return this._page.content;
  }

  /** @property {number} pagesSize - nombre max d'éléments par page */
  get pagesSize(): number {
    return this._page.pageSize;
  }

  set pagesSize(pagesSize: number) {
    this._page.pageSize = pagesSize;
  }

  /** @property {number} currentPageNum - numéro de page actuel (1 étant la première page) */
  get currentPageNum(): number {
    return this._currentPageNum;
  }

  /** @property {number} totalPages - nombre total de pages */
  get totalPages(): number {
    return this._totalPages;
  }

  /** 
   * @property {boolean} realoadBetweenPages
   * - indique s'il faut afficher le spinner de chargement quand on change de page
   */
  get reloadBetweenPages(): boolean {
    return this._reloadBetweenPages;
  }

  set reloadBetweenPages(reloadBetweenPages: boolean) {
    this._reloadBetweenPages = reloadBetweenPages;
  }

  /**
   * Indique s'il existe une page suivant la page actuelle
   * @returns {boolean} - true s'il existe une page suivant la page actuelle, false sinon
   */
  public hasNextPage(): boolean {
    return this._totalItemsCount > this.pageToIndex(this._currentPageNum) + this.content.length;
  }

  /**
   * Indique s'il existe une page précédent la page actuelle
   * @returns {boolean} - true s'il existe une page précedentla page actuelle, false sinon
   */
  public hasPrevPage(): boolean {
    return this._currentPageNum > 1;
  }

  /**
   * Convertit l'index passé en paramètre en un numéro de page
   * @param {number} index - l'index d'un élément du contenu (pas forcément sur la page actuelle)
   * @returns {number} - la page contenant l'élément correspondant à cet index
   */
  public indexToPage(index: number): number {
    return 1 + Math.floor(index / this._page.pageSize);
  }

  /**
   * Convertit un numéro de page en un index correspondant au premier élément de cet page
   * @param {number} pageNum - le numéro de page à convertir en index 
   */
  public pageToIndex(pageNum: number): number {
    return (pageNum - 1) * this._page.pageSize;
  }

  /**
   * Indique si l'index existe dans le contenu (total, pas local)
   * @param {number} index - l'index duquel on veut tester l'exsitence
   * @returns {boolean} - true si l'index existe, false sinon
   */
  public hasIndex(index: number): boolean {
    return index >= 0 && (index < this._totalItemsCount || index < this.pagesSize);
  }

  /**
   * Indique si la page existe ou non
   * @param {number} pageNum - numéro de page dont on veut tester l'existence
   * @returns {boolean} - true si le numéro de page correspond à une page existante, false sinon 
   */
  public hasPage(pageNum: number): boolean {
    return this.hasIndex(this.pageToIndex(pageNum));
  }

  /**
   * Se déplacer vers l'index spécifié
   * @param {number} index - index de destination 
   * @param {T[]} content - contenu qui va remplacer le contenu actuel
   * @param totalItemsCount - nombre d'éléments total de contenu (pas uniquement celui de la page)
   * @returns {boolean} - true si déplacement réussi, false sinon 
   */
  public goToIndex(index: number, content: T[] = this.content, totalItemsCount: number = this._totalItemsCount): boolean {
    if(! this.hasIndex(index)) { return false; }
    if(! this.setPageContent(content, totalItemsCount)) { return false; }
    this._currentPageNum = this.indexToPage(index);
    this._totalPages = this.indexToPage(totalItemsCount - 1);
    return true;
  }

  /**
   * Se déplacer vers la page spécifiée
   * @param {number} pageNum - numéro de page de destination
   * @param {T[]} content - contenu qui va remplacer le contenu actuel
   * @param {number} totalItemsCount - nombre total d'éléments total de contenu (pas uniquement celui de la page)
   * @returns {boolean} - true si déplacement réussi, false sinon
   */
  public goToPage(pageNum: number, content: T[] = this.content, totalItemsCount: number = this._totalItemsCount): boolean { 
    return this.goToIndex(this.pageToIndex(pageNum), content, totalItemsCount);
  }

  /**
   * Met à jour le contenu et la pagination en fonction des paramètres
   * @param {RestService} restService - service REST utilisé 
   * @param {string} methodName - nom de la méthode à appeler sur le service
   * @param {DatatableQueryParams} params - paramètres de requête (recherche/tri/pagination) 
   * @param {any[]} otherArgs - arguments complémentaires à passer à la méthode dur service REST
   * @param {boolean} reload - afficher le spinner pendant le chargement des données
   * @param {() => void} onLoad - callback des actions à effectuer après le chargement des données
   * @returns {Observable<DatatablePaginator<T, RestService>>} - Observable sur le paginator et les données
   */
  public update(
    restService: RestService,
    methodName: string,
    params: DatatableQueryParams,
    otherArgs: any[] = undefined,
    reload: boolean = false,
    onLoad?: () => void
  ): Observable<DatatablePaginator<T, RestService>> {
    if(! restService[methodName] || ! (restService[methodName] instanceof Function)) {
      // garde : paramètres invalides
      return Observable.create((observer: Observer<DatatablePaginator<T, RestService>>) => {
        observer.error('invalid method');
        observer.complete();
      });
    }

    // Création d'un tableau d'arguments pour l'appel de la méthode du service REST :
    let args: any[] = [];

    // ajout des arguments complémentaires
    if(otherArgs) {
      otherArgs.forEach((arg: any) => {
        args.push(arg);
      });
    }

    // transformation des paramètres de requête en arguments et ajout au tableau :
    let index: number = params ? params.index : 0;
    args.push(params ? params.searchParams.toString() : 'default');
    args.push(params ? params.orderParams.toString() : 'default');
    args.push(index);
    args.push(params ? params.limit : this.pagesSize);

    // afficher le spinner de rechargement ?
    this.reloadBetweenPages = reload;

    // chargement des données et création Observable :
    return Observable.create((observer: Observer<DatatablePaginator<T, RestService>>) => {
      // Appel de la méthode du service REST avec le tableau d'arguments qu'on vient de créer
      let sub = restService[methodName](...args).finally(() => {
        observer.complete(); // fin Observable
        sub.unsubscribe();            // Finally, quand c'est terminé : clean les ressources
      }).subscribe(
        (result: any) => {            // Données chargées avec succès :
          if(result == undefined) {
            // garde : résultat invalide
            observer.error(result);
            return;
          }
          // on se déplace vers la bonne page :
          if(result.list != undefined || result.totalCount != undefined) {   
            this.goToIndex(index, result.list ? result.list : [], result.totalCount ? result.totalCount : 0);
          }
          else {
            this.goToIndex(index, result, result.length);
          }
          observer.next(this); // on passe les données à l'observable
          if(onLoad) {
            onLoad();         // callback des actions à effectuer après un chargement
          }
        },
        (error: Response) => {        // Erreur :
          observer.error(error);
        }
      );
    });
  }
}
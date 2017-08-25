/**
 * Auteur : Florian
 * License :
 */

import { Entity } from "./entity";
import { FlexQueryResult } from "objects/flex-query-result";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

/**
 * Classe pour contenir un string
 */
class ParamsString {
  public str: string = '';
}

/**
 * Parse les paramètres (clauses WHERE et ORDER)
 * - Exemple : [{col:"prenom", param:"Manfred"}, {col:"nom", param:"von Richtofen"}]
 * -> Map : {"prenom" -> "Manfred"}, {"nom" -> "von Richtofen"}
 */
export class ParamsParser {
  
  /** Identifiant de clé */
  private static readonly COL: string = 'col:';
  /** Identifiant de valeur */
  private static readonly PARAM: string = 'param:';

  /**
   * @constructor
   * @param {string} _params - paramètres à parser 
   */
  constructor(private _params: string = 'default') { }

  /**
   * Parse les paramètres
   * - Exemple : [{col:"prenom", param:"Manfred"}, {col:"nom", param:"von Richtofen"}]
   * -> Map : {"prenom" -> "Manfred"}, {"nom" -> "von Richtofen"}
   * @returns {Map<string, string>} - les paramètres parsés sous forme de map: col -> param
   */
  public parse(): Map<string, string> {
    let resmap: Map<string, string> = new Map<string, string>();
    let col: ParamsString;
    let param: ParamsString;
    // valeur par défaut :
    if (this._params == 'default' || this._params == '') {
      return resmap; // map vide
    }
    // on crée un map (colonne, param) :
    for (let i: number = 0; i < this._params.length && (i = this.extractNextValue(i, ParamsParser.COL, col = new ParamsString())) >= 0;) {
      // pour chaque colonne, on extrait la valeur de param :
      if ((i = this.extractNextValue(i, ParamsParser.PARAM, param = new ParamsString())) < 0) {
        // valeur introuvable => erreur : on arrête ici et renvoie ce qu'on a déjà trouvé
        return resmap;
      }
      resmap.set(col.str, param.str);
    }
    return resmap;
  }

  /**
   * Extrait la prochaine valeur identifiée par key
   * @private
   * @param {number} index - index à partir duquel on commence la recherche
   * @param {string} key - clé de la valeur à chercher
   * @param {ParamsString} buffer - buffer qui contient la valeur de sortie 
   */
  private extractNextValue(index: number, key: string, buffer: ParamsString): number {
    let c: string;
    let delimiter: string;

    index = this._params.indexOf(key, index);
    if (index < 0) {
      return index; // erreur : clé introuvable
    }
    index += key.length;
    c = '';
    for (; index < this._params.length && (c = this._params.charAt(index)) != '"' && c != '\''; ++index) { //skip to value delimiter " or '
      if (c == '}' || c == '{' || c == '[' || c == ']') {
        return -2; // erreur : valeur introuvable
      }
    }
    if (index >= this._params.length) {
      return -2; // erreur : valeur introuvable
    }
    delimiter = c;
    c = '';
    for (++index; index < this._params.length && (c = this._params.charAt(index)) != delimiter; ++index) {
      buffer.str += c;
    }
    if (index >= this._params.length) {
      return -2; // erreur : valeur introuvable
    }
    return index;
  }

}

/**
 * Liste abtraite d'entités
 * @param {T} - Le type d'entités dans la liste
 */
export abstract class AbstractEntityList<T extends Entity> {
  
  /** map des entités contenues dans la liste */
  private _listMap: Map<number, T> = new Map<number, T>();

  /** @constructor */
  constructor() { }

  /** @property {Map<number, T>} listMap - map de la liste des entités */
  public get listMap(): Map<number, T> {
    return this._listMap;
  }

  /** @property {number[]} - renvoie un tableau contenant tous les id's des entités contenues dans la liste */
  public get ids(): number[] {
    let ids: number[] = [];
    this._listMap.forEach((entity: T) => {
      ids.push(entity.id);
    });
    return ids;
  }

  /**
   * Vide la liste
   */
  public clear(): void {
    this._listMap.clear();
  }

  /**
   * Ajoute l'entité passée en paramètre à la liste
   * @param {T} entity - l'entité à ajouter
   * @returns {boolean} - true si ajout ok, false si l'entité est déjà dans la liste
   */
  public add(entity: T): boolean {
    if(this._listMap.has(entity.id)) {
      // garde : les entités sont uniques dans la liste
      return false;
    }
    this._listMap.set(entity.id, entity);
    return true;
  }

  /**
   * Enlève l'entité dont l'id est spécifié de la liste
   * @param {number} id - id de l'entité à supprimer
   * @returns {boolean} - true si la suppression est effective, false si l'id ne correspondait pas à une entité 
   */
  public remove(id: number): boolean {
    return this._listMap.delete(id);
  }

  /**
   * Indique si les clauses where sont respectées par l'entité passée en paramètre
   * @protected
   * @param {T} entity - l'entité à tester
   * @param {Map<string, string>} whereClauses - les clauses where à vérifier 
   */
  protected matchesWhereClauses(entity: T, whereClauses: Map<string, string>): boolean {  
    for (let clause of Array.from(whereClauses.entries())) {
      let col: string = clause[0];
      let param: string = clause[1];

      switch(typeof entity[col]) {
        case 'undefined': // on ignore
          break;
        case 'string':
          if(entity[col].toLowerCase().indexOf(param) < 0) { return false; }
          break;
        case 'number':
          if(entity[col] != parseInt(param)) { return false; }
          break;
        case 'boolean':
          if(entity[col] != (param === 'true')) { return false; }
          break;
        default:
          if(entity[col] != param) { return false; }
          break;
      }
    }
    return true; 
  }

  /**
   * Recherche les entités de la liste qui vérifient les clauses WHERE données en paramètre
   * @protected
   * @param {Map<string, string>} whereClauses - les clauses WHERE à tester
   * @returns {T[]} - les entités de la liste qui vérifient les clauses WHERE
   */
  protected abstract search(whereClauses: Map<string, string>): T[];

  /**
   * Trie le tableau d'entités donné en paramètre en fonction des clauses order données en paramètre
   * @protected
   * @param {T[]} searchResults - résultats de recherche à trier
   * @param {Map<string, string>} orderClauses - clauses ORDER
   */
  protected sort(searchResults: T[], orderClauses: Map<string, string>): T[] {
    return searchResults.sort((a: T, b: T) => {
      for (let order of Array.from(orderClauses.entries())) {
        let col: string = order[0];
        let asc: boolean = (order[1].toLowerCase() === 'asc');

        if(a[col] < b[col]) {
          return asc ? -1 : 1;
        }
        else if(a[col] > b[col]) {
          return asc ? 1 : -1;
        }
      }
      return 0;
    });
  }

  /**
   * Sélectionne les entités et les organise en fonction des paramètres
   * @param {string} whereParams - paramètres WHERE. Format : {col:"name",param:"von Richtofen"}
   * @param {string} orderParams - paramètres ORDER. Format : {col:"name",param:"ASC"}
   * @param {number} index - index à partir duquel on sélectionne les résultats
   * @param {number} limit - nombre max de résultats à sélectionner
   * @returns {Observable<FlexQueryResult<T>>} - Observable sur les résultats : contient une liste d'entités et le nombre total d'entités si index et limit étaient à 0
   */
  select(whereParams: string, orderParams: string, index: number, limit: number): Observable<FlexQueryResult<T>> {
    return Observable.create((observer: Observer<FlexQueryResult<T>>) => {
      let selectResults: T[] = this.sort(this.search(new ParamsParser(whereParams).parse()),
        new ParamsParser(orderParams).parse());
      observer.next(new FlexQueryResult<T>(selectResults.slice(index, (limit > 0 ? index + limit : undefined)),
        selectResults.length));
      observer.complete();
    });
  }

}

/**
 * Liste d'entités
 * @param {T} - Le type d'entités dans la liste
 */
export class EntityList<T extends Entity> extends AbstractEntityList<T> {
  
  /**
   * Recherche les entités de la liste qui vérifient les clauses WHERE données en paramètre
   * @protected
   * @param {Map<string, string>} whereClauses - les clauses WHERE à tester
   * @returns {T[]} - les entités de la liste qui vérifient les clauses WHERE
   */
  protected search(whereClauses: Map<string, string>): T[] {
    let results: T[] = [];
    this.listMap.forEach((entity: T) => {
      if(this.matchesWhereClauses(entity, whereClauses)) {
        results.push(entity);
      }
    });
    return results;
  }

}

/**
 * Liste d'entités ordonnées
 * @param {T} - Le type d'entités dans la liste
 */
export class OrderedEntityList<T extends Entity> extends AbstractEntityList<T> {

  private _order: number[] = [];

  private _orderMap: Map<number, number> = new Map<number, number>();
  
  /**
   * Ajoute une entité à la liste
   * @override
   * @param {T} entity - entité à ajouter à la liste
   * @returns {boolean} - true si ajout ok, false si l'entité est déjà dans la liste
   */
  public add(entity: T): boolean {
    if(! super.add(entity)) {
      return false;
    }
    this._order.push(entity.id);
    this._orderMap.set(entity.id, this._order.length - 1);
    return true;
  }

  /**
   * Enlève l'entité dont l'id est précisé de la liste
   * @override
   * @param {number} id - id de l'entité à retirer
   * @returns {boolean} - true si succès, false si l'id ne correspond à aucune entité de la liste
   */
  public remove(id: number): boolean {
    if(! super.remove(id)) {
      return false;
    }
    this._order = this._order.splice(this._orderMap.get(id), 1);
    this._orderMap.delete(id);
    return true;
  }

  /**
   * Vide la liste
   * @override
   */
  public clear(): void {
    super.clear();
    this._order = [];
  }

  /**
   * Echange l'ordre des entités correspondants à idA et idB
   * @param idA - id d'une entié A 
   * @param idB - id d'une entité B
   * @returns {boolean} - true si succès, false si un des id ne correspond pas à une entité de la liste
   */
  public swap(idA, idB): boolean {
    if(! this._orderMap.has(idA) || ! this._orderMap.has(idB)) {
      return false;
    }

    // récupération des indexes dans le tableau order :
    let orderA: number = this._orderMap.get(idA);
    let orderB: number = this._orderMap.get(idB);
    
    // swap dans le tableau order :
    let tmpId: number = this._order[orderA];
    this._order[orderA] = this._order[orderB];
    this._order[orderB] = tmpId;

    // swap dans le map
    this._orderMap.set(idA, orderB);
    this._orderMap.set(idB, orderA);
    
    return true;
  }
  
  /**
   * Recherche les entités de la liste qui vérifient les clauses WHERE données en paramètre
   * @protected
   * @param {Map<string, string>} whereClauses - les clauses WHERE à tester
   * @returns {T[]} - les entités de la liste qui vérifient les clauses WHERE
   */
  protected search(whereClauses: Map<string, string>): T[] {
    let results: T[] = [];
    for(let order of this._order) {
      let entity: T = this.listMap.get(order);
      if(this.matchesWhereClauses(entity, whereClauses)) {
        results.push(entity);
      }
    }
    return results;
  }

}
/**
 * Auteur: Florian
 * License:
 */

import { SessionService } from "app/services/session.service";

/**
 * Représente un panneau de l'application
 */
export class Pannel {
  
    /** Liste des index des onglets sélectionnés pour les différentes sections */
    private _tabIndex: number[] = [];
  
    /** mapping des nopms des sections vers leurs id's */
    private _sectionNameToIdMap: Map<string, number> = new Map<string, number>();
  
    /** id de la prochaine section créée dans ce pannel */
    private _currentSectionId: number = 0;
  
    /**
     * @constructor
     * @param {string} _navListName - nom de la nav list liée à ce pannel
     * @param {SessionService} _session - le service session global
     */
    constructor(private _navListName: string, private _session: SessionService) { }
  
    /**
     * Renvoie l'id de la section dont on donne le nom
     * @param {string} sectionName - nom de la section dont on veut l'id
     * @returns {number} - id de la section demandée
     */
    getSectionId(sectionName: string): number {
      // on met tout en minuscule pour éviter les erreurs de case matching
      sectionName = sectionName.toLowerCase();
      
      // cherche l'id de la section
      if(this._sectionNameToIdMap.has(sectionName)) {
        return this._sectionNameToIdMap.get(sectionName);
      }
  
      // crée l'id de la section s'il n'existe pas
      let id: number = this._currentSectionId;
      this._sectionNameToIdMap.set(sectionName, this._currentSectionId++);
      this._tabIndex.push(0); // sélection du premier tab par défaut
      return id;
    }
  
    /**
     * Renvoie l'index de l'onglet sélectionné dans la section dont le nom est donné en paramètre
     * @param {string} sectionName - nom de la section
     * @returns {number} - index de l'onglet sélectionné
     */
    getTabIndex(sectionName: string): number {
      return this._tabIndex[this.getSectionId(sectionName)];
    }
  
    /**
     * Met à jour l'index de l'onglet sélectionné pour la section dont le nom est donné en paramètre
     * @param {string} sectionName - nom de la section
     * @param {number} index - nouvel index d'onglet 
     */
    setTabIndex(sectionName: string, index: number): void {
      this._tabIndex[this.getSectionId(sectionName)] = index;
    }
  
    /** @property {number} selectedItemId - id de l'item sélectionné dans le menu de navigation du pannel */
    get selectedItemId(): number {
      return this._session.getSelectedItemId(this._navListName);
    }
  
    /**
     * Renvoie l'id de l'item
     * @param item - chaine de caractères correspondant à l'item voulu
     * @returns {number} - id de l'item
     */
    getItemId(item: string): number {
      return this._session.getNavListItemId(this._navListName, item);
    }
    
  }
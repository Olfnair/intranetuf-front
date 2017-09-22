/**
 * Auteur : Florian
 * License : 
 */

import { MdDialogRef, MdDialog, ComponentType, MdDialogConfig } from "@angular/material";
import { Injectable, TemplateRef } from '@angular/core';
import { GuiModalComponent, GuiModalData } from "app/gui/gui-modal";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { Observer } from "rxjs/Observer";

/**
 * Service permettant d'afficher simplement des fenêtres modales.
 */
@Injectable()
export class ModalService {

  /** Référence sur la modale affichée */
  private _dialogRef: MdDialogRef<any> = undefined;
  
  /**
   * @constructor
   * @param {MdDialog} _dialog - service de dialogue (injecté)
   */
  constructor(private _dialog: MdDialog) { }

  /**
   * Affiche une fenêtre modale en fonction des paramètres
   * @param {ComponentType<any> | TemplateRef<any>} comp - le composant qui va servir de template pour la modale 
   * @param {any} data - les données du template, contenues dans un objet 'data' de n'importe quel format
   * @returns {Observable<any>} - permet de savoir quand la modale est fermée et ce qu'elle renvoie comme données
   */
  popup(comp: ComponentType<any> | TemplateRef<any>, data: any = {}, config: MdDialogConfig = new MdDialogConfig()): Observable<any> {
    config.data = data;
    this._dialogRef = this._dialog.open(comp, config); // ouverture du composant modal avec ses données
    return Observable.create((observer: Observer<boolean>) => {
      let modalSub: Subscription = this._dialogRef.afterClosed().finally(() => {
        modalSub.unsubscribe(); // libération des ressources
        this._dialogRef = undefined;
      }).subscribe(
        (data: any) => {        // OK : la modale a été fermée
          observer.next(data);
          observer.complete();
        },
        (error: any) => {       // Erreur :
          observer.error(error);
        }
      );
    });
  }
   
  /**
   * Ouvre une modale informative avec un bouton OK pour la fermer
   * @param {string} title - titre de la modale
   * @param {text} text - texte de la modale
   * @param {boolean} success - indique si on informe d'un succès (true) ou d'un échec/erreur (false)
   * @returns {Observable<boolean>} - Obervable qui indique la fermeture de la modale.
   *                                  Contient true si c'était une modale de succès, sinon false
   */
  info(title: string, text: string, success: boolean = false): Observable<boolean> {
    return this.popup(GuiModalComponent, new GuiModalData(title, text, success));
  }

  /**
   * Ouvre une modale de question avec un bouton 'Oui' et un autre 'Non'.
   * @param {string} title - titre de la modale
   * @param {text} text - texte de la modale
   * @param {boolean} success - indique si on informe d'un succès (true) ou d'un échec/erreur (false)
   * @returns {Observable<boolean>} - Observable qui indique la fermeture de la modale.
   *                                  Contient true si l'utilisateur a cliqué sur oui, false sinon
   */
  yesno(title: string, text: string, success: boolean = true): Observable<boolean> {
    return this.popup(GuiModalComponent, new GuiModalData(title, text, success, true));
  }

  /**
   * Ferme la modale actuellement ouverte dans le service en lui indiquant les données à renvoyer
   * @param {any} dialogResult - données à renvoyer lors de la fermeture de la modale
   */
  close(dialogResult?: any): void {
    this._dialogRef.close(dialogResult);
  }

}

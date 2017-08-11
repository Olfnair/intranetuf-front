/**
 * Auteur : Florian
 * License : 
 */

import { EventEmitter, Output, Input } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { RestApiService } from "app/services/rest-api.service";
import { BitsContainer } from "app/gui/bit-box-grid-rules";
import { DatatableBitBoxContentManager } from "app/gui/datatable";
import { Project } from "entities/project";
import { ProjectRight } from "entities/project-right";
import { User } from "entities/user";

/**
 * Classe de représentation des droits d'un utilisateur sur un projet.
 * (Pour gérer les droits par utilisateur.)
 */
export class UserRightsBitsContainer implements BitsContainer {
  
  /**
   * @constructor
   * @param {ProjectRight} _projectRight - les droits d'un utilisateur sur un projet 
   */
  constructor(protected _projectRight: ProjectRight) { }
  
  /**
   * Renvoie l'id du container = id du projet concerné par les droits
   * @returns {number} - id du container
   */
  getId(): number {
    return this._projectRight.project.id;
  }

  /**
   * Renvoie un entier correspondant aux droits sur le projet
   * @returns {number} - droits sur le projet
   */
  getBits(): number {
    return this._projectRight.rights;
  }

  /**
   * Affecte les bits correspondants aux droits (bits)
   * @param {number} bits - un entier représentant les droits sur le projet 
   */
  setBits(bits: number) {
    this._projectRight.rights = bits;
  }

  /**
   * Renvoie l'entité ProjectRight qui contient les droits sur le projet
   * @returns {ProjectRight} - l'entité qui contient les droits sur le projet
   */
  getContent(): ProjectRight {
    return this._projectRight;
  }

}

/**
 * Classe de représentation des droits d'un projet pour un utilisateur.
 * (Pour gérer les droits par projet.)
 */
export class ProjectRightsBitsContainer extends UserRightsBitsContainer {
  
  /**
   * @constructor
   * @param {ProjectRight} _projectRight - les droits d'un utilisateur sur un projet 
   */
  constructor(projectRight: ProjectRight) {
    super(projectRight)
  }
  
  /**
   * Renvoie l'id du container = id de l'user concerné par les droits
   * @override
   * @returns {number} - id du container
   */
  getId(): number {
    return this._projectRight.user.id;
  }

}

/**
 * Gestionaire de contenu d'une grille des droits sur un projet pour une entity de type T (T = User | Project)
 */
export class RightsGridContentManager<T> extends DatatableBitBoxContentManager<T, RestApiService> {
  
  /** entité projet ou user dont les droits sont gérés */
  private _entity: T = undefined;

  /** @event - fermeture de la grille */
  private _close$: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @constructor
   * @param {RestApiService} restService - service REST à utliser
   * @param {string} rightsGetterMethod - nom de la méthode à appeler sur le service REST pour charger les droits 
   * @param ContainerType - Classe des conteneurs de droits
   */
  constructor(restService: RestApiService, rightsGetterMethod: string, ContainerType) {
    super(
      restService,        // service REST
      rightsGetterMethod, // nom de la méthode à appler sur le service REST pour charger/sauver
      ContainerType       // classe à utiliser pour instancier les containers
    );
  }

  /** @property {T} entity - entité (user ou project) dont les droits sont gérés par la grille */
  get entity(): T {
    return this._entity;
  }

  @Input() set entity(entity: T) {
    this.grid.clear();         // reset de la grille
    this._entity = entity;
    this.load([this._entity]); // rechargement des droits pour l'entité
  }

  /**
   * @event close - fermeture de la grille
   * @returns {EventEmitter<void>}
   */
  @Output('close')
  get close$(): EventEmitter<void> {
    return this._close$;
  }

  /**
   * Enregistre les modifications
   * @emits close - fermeture de la grille
   */
  submit(): void {
    // Récupère les droits qui ont été modifiés :
    let update: ProjectRight[] = [];
    this.grid.modifiedBits.forEach((bitsContainer) => {
      update.push(bitsContainer.getContent());
    });

    // Utilise le service REST pour mettre à jour les droits :
    let updateSub: Subscription = this._restService.setRights(update).finally(() => {
      updateSub.unsubscribe(); // Finally, quand tout est terminé : on libère les ressources
    }).subscribe(
      (res: number) => {       // OK : droits enregistrés
        this._close$.emit(); // fermeture de la grille
      },
      (error: Response) => {   // Erreur :
        // TODO : afficher une erreur (utiliser ModalService)
      }
    );
  }

  /**
   * Annule les modifications
   * @emits close - fermeture de la grille
   */
  cancel(): void {
    this._close$.emit()
  }
}
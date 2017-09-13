/**
 * Auteur : Florian
 * License : 
 */

import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { SessionService } from "app/services/session.service";
import { AppSection } from "app/shared/app-section";
import { File } from "entities/file";
import { Project } from "entities/project";
import { Version } from "entities/version";
import { WorkflowCheck } from "entities/workflow-check";

/**
 * Section des fichiers des projets
 */
@Component({
  selector: 'app-file-section',
  templateUrl: './file-section.component.html',
  styleUrls: ['./file-section.component.css']
})
export class FileSectionComponent extends AppSection {
  
  /** ref sur un proet */
  private _project: Project = undefined;
  /** ref sur un fichier */
  private _file: File = undefined;
  /** ref sur une version */
  private _version: Version = undefined;
  /** ref sur un check (contrôle ou validation) */
  private _check: WorkflowCheck = undefined;

  /** ignorer le projet de session pour afficher les fichiers ? (sert dans le panneau d'admin) */
  private _ignoreSessionProject: boolean = false;

  /**
   * @constructor
   * @param {SessionService} _session - données globales de session
   * @param {Router} _router - router pour connaitre la route courante
   */
  constructor(private _session: SessionService, private _router: Router) {
    super({
      Filelist:       0,  // Liste des fichiers
      AddFile:        1,  // Ajouter un fichier
      VersionDetails: 2,  // détail de version
      CheckVersion:   3   // Effectuer un contrôle ou une validation sur une version d'un fichier
    });
  }

  /** 
   * @property {boolean} ignoreSessionProject - indique s'il faut ignorer ou non le projet sélectionné dans
   *                                            projectlist pour afficher la liste des fichiers qui y correspond
   */
  @Input()
  set ignoreSessionProject(ignoreSessionProject: boolean) {
    this._ignoreSessionProject = ignoreSessionProject;
  }

  /**
   * Indique quel composant activer en fonction de l'état courant
   * @returns {number} - état correspondant au composant à activer
   */
  stateToActivate(): number {
    if(! this._ignoreSessionProject && this._project != this.selectedProject) {
      this.state = this.State.Filelist;
      this._project = this.selectedProject;
    }
    return this.state;
  }

  /** @property {Project} project - une reference sur un projet */
  get project(): Project {
    return this._project;
  }

  @Input()
  set project(project: Project) {
    this._project = project;
  }

  /** @property {File} file - une référence sur un fichier */
  get file(): File {
    return this._file;
  }

  set file(file: File) {
    this._file = file;
  }

  /** @property {Version} version - une référence sur une version */
  get version(): Version {
    return this._version;
  }

  set version(version: Version) {
    this._version = version;
  }

  /** @property {WorkflowCheck} check - une référence sur un contrôle ou une validation */
  get check(): WorkflowCheck {
    return this._check;
  }

  set check(check: WorkflowCheck) {
    this._check = check;
  }

  /** @property {Project} project - projet sélectionné dans la projectlist */
  get selectedProject(): Project {
    return this._session.selectedProject;
  }

  /** @property {boolean} readyForContent - indique si le composant peut commencer à charger le contenu ou non */
  get readyForContent(): boolean {
    return this._session.readyForContent;
  }

  /** @property {string} route - la route courante */
  get route(): string {
    return this._router.url;
  }

  /**
   * Assigne les paramètres state et file à la section
   * @param {number} state - le nouvel état de la section
   * @param {File} file - fichier dont un composant pourrait avoir besoin
   */
  setStateAndFile(state: number, file: File): void {
    this.state = state;
    this._file = file;
  }

  /**
   * Assigne les paramètres state et check à la section
   * @param {number} state - le nouvel état de la section
   * @param {WorkflowCheck} check - check dont un composant pourrait avoir besoin
   */
  setStateAndCheck(state: number, check: WorkflowCheck): void {
    this.state = state;
    this._check = check;
  }

}

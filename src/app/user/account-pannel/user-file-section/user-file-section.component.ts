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
import { GenericEntitySection } from "app/shared/generic-entity-section";

/**
 * Section des fichiers des projets
 */
@Component({
  selector: 'app-user-file-section',
  templateUrl: './user-file-section.component.html',
  styleUrls: ['./user-file-section.component.css']
})
export class UserFileSectionComponent extends GenericEntitySection<File> {

  /**
   * @constructor
   */
  constructor() {
    super({
      Filelist:       0,  // Liste des fichiers
      VersionDetails: 1,  // détail de version
      AddVersion:     2   // Ajout d'une nouvelle version
    });
  }
}

/**
 * Auteur : Florian
 * License :
 */

// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

// Material
import { MaterialModule } from '@angular/material';

// Autres Modules
import { GuiModule } from "app/gui/gui.module";
import { PipesModule } from "app/pipes/pipes.module";
import { ServicesModule } from "app/services/services.module";
import { UserModule } from "app/user/user.module";

// Admin
import { AdminNavListComponent } from './admin-nav-list/admin-nav-list.component';
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { ProjectlistComponent } from './projects-section/projectlist/projectlist.component';
import { ProjectRightslistComponent } from './projects-section/project-rightslist/project-rightslist.component';
import { ProjectsSectionComponent } from './projects-section/projects-section.component';
import { UserlistComponent } from "./users-section/userlist/userlist.component";
import { UserRightslistComponent } from "./users-section/user-rightslist/user-rightslist.component";
import { UserRolesComponent } from './users-section/user-roles/user-roles.component';
import { UsersSectionComponent } from './users-section/users-section.component';
import { LogsSectionComponent } from './logs-section/logs-section.component';
import { LoglistComponent } from './logs-section/loglist/loglist.component';

/**
 * Module Admin
 */
@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    AdminNavListComponent,
    AdminPanelComponent,
    ProjectlistComponent,
    ProjectRightslistComponent,
    ProjectsSectionComponent,
    UserlistComponent,
    UserRightslistComponent,
    UserRolesComponent,
    UsersSectionComponent,
    LogsSectionComponent,
    LoglistComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    GuiModule,
    PipesModule,
    ServicesModule,
    UserModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    AdminNavListComponent,
    AdminPanelComponent,
    ProjectlistComponent,
    ProjectRightslistComponent,
    ProjectsSectionComponent,
    UserlistComponent,
    UserRightslistComponent,
    UserRolesComponent,
    UsersSectionComponent,
    LogsSectionComponent
  ]
})
export class AdminModule {}
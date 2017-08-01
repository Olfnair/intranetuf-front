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

// Admin
import { AdminNavListComponent } from './admin-nav-list/admin-nav-list.component';
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { UserFormComponent } from "./users/user-form/user-form.component";
import { UserlistComponent } from "./users/userlist/userlist.component";
import { RightslistComponent } from "./users/rightslist/rightslist.component";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    AdminNavListComponent,
    AdminPanelComponent,
    UserFormComponent,
    UserlistComponent,
    RightslistComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    GuiModule,
    PipesModule,
    ServicesModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    AdminNavListComponent,
    AdminPanelComponent,
    UserFormComponent,
    UserlistComponent,
    RightslistComponent
  ]
})
export class AdminModule {}
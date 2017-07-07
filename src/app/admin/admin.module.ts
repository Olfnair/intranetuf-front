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
import { UserFormComponent } from "./user-form/user-form.component";
import { AdminPanelComponent } from "./admin-panel/admin-panel.component";
import { UserlistComponent } from "./userlist/userlist.component";
import { RightslistComponent } from "./rightslist/rightslist.component";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    UserFormComponent,
    AdminPanelComponent,
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
    UserFormComponent,
    AdminPanelComponent,
    UserlistComponent,
    RightslistComponent
  ]
})
export class AdminModule {}
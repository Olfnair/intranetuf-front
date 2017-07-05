// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

// Material
import { MaterialModule } from '@angular/material';

// Autres Modules
import { GuiModule } from "app/gui/gui.module";
import { PipesModule } from "app/pipes/pipes.module";
import { ServicesModule } from "app/services/services.module";

// User
import { HomeComponent } from "./home/home.component";
import { ProjectlistComponent } from "./projectlist/projectlist.component";
import { LoginComponent } from "./login/login.component";
import { HeaderComponent } from "./header/header.component";
import { ActivateAccountComponent } from "./activate-account/activate-account.component";
import { FilelistComponent } from "./filelist/filelist.component";
import { AddProjectComponent } from "./projectlist/add-project/add-project.component";
import { AddFileComponent } from "./add-file/add-file.component";


@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    HomeComponent,
    ProjectlistComponent,
    LoginComponent,
    HeaderComponent,
    ActivateAccountComponent,
    FilelistComponent,
    AddProjectComponent,
    AddFileComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
    AddProjectComponent
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    GuiModule,
    PipesModule,
    ServicesModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    HomeComponent,
    ProjectlistComponent,
    LoginComponent,
    HeaderComponent,
    ActivateAccountComponent,
    FilelistComponent,
    AddProjectComponent,
    AddFileComponent
  ]
})
export class UserModule {}
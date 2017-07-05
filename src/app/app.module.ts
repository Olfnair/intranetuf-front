// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";

// Material Design
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';

// Routes
import { APP_ROUTES } from './app.routes';

// Modules
import { AdminModule } from "app/admin/admin.module";
import { GuiModule } from "app/gui/gui.module";
import { PipesModule } from "app/pipes/pipes.module";
import { ServicesModule } from "app/services/services.module";

// Components
import { AppComponent } from './app.component';
import { HomeComponent } from "./user/home/home.component";
import { ProjectlistComponent } from "./user/projectlist/projectlist.component";
import { LoginComponent } from "./user/login/login.component";
import { HeaderComponent } from "./user/header/header.component";
import { ActivateAccountComponent } from "./user/activate-account/activate-account.component";
import { FilelistComponent } from './user/filelist/filelist.component';
import { AddProjectComponent } from './user/projectlist/add-project/add-project.component';
import { AddFileComponent } from './user/add-file/add-file.component';

@NgModule({
  declarations: [ // tous les composants (& pipes etc) accessibles dans l'appli
    AppComponent,
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
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    BrowserAnimationsModule,
    AdminModule,
    GuiModule,
    PipesModule,
    ServicesModule,
    APP_ROUTES
  ],
  providers: [ // services globaux pour toute l'appli qu'on peut injecter directement dans les composants
  ],
  bootstrap: [AppComponent] // composant qui sert de racine à l'appli
})
export class AppModule {}

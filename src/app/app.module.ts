// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Material Design
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';

// Routes
import { APP_ROUTES } from './app.routes';

// Modules
import { AdminModule } from "app/admin/admin.module";
import { UserModule } from "app/user/user.module";
import { GuiModule } from "app/gui/gui.module";
import { ServicesModule } from "app/services/services.module";

// Components
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ // tous les composants (& pipes etc) accessibles dans l'appli
    AppComponent,
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
  ],
  imports: [ // modules importés
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    AdminModule,
    UserModule,
    GuiModule,
    ServicesModule,
    APP_ROUTES
  ],
  providers: [ // services globaux pour toute l'appli qu'on peut injecter directement dans les composants
  ],
  bootstrap: [AppComponent] // composant qui sert de racine à l'appli
})
export class AppModule {}

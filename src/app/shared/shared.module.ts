// Angular 
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";

// Material
import { MaterialModule } from "@angular/material";

// Components
import { UnauthorizedComponent } from "app/shared/unauthorized/unauthorized.component";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    UnauthorizedComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    UnauthorizedComponent
  ]
})
export class SharedModule { }

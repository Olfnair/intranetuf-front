// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Pipes
import { CheckStatusPipe } from './check-status.pipe';
import { NumberLenPipe } from "./number-len.pipe";
import { TruncatePipe } from "./truncate.pipe";
import { VersionStatusPipe } from "./version-status.pipe";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    CheckStatusPipe,
    NumberLenPipe,
    TruncatePipe,
    VersionStatusPipe
  ],
  imports: [ // modules importés
    CommonModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    CheckStatusPipe,
    NumberLenPipe,
    TruncatePipe,
    VersionStatusPipe,
  ]
})
export class PipesModule {}
// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Pipes
import { NumberLenPipe } from "./number-len.pipe";
import { TruncatePipe } from "./truncate.pipe";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    NumberLenPipe,
    TruncatePipe
  ],
  imports: [ // modules importés
    CommonModule
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    NumberLenPipe,
    TruncatePipe
  ]
})
export class PipesModule {}
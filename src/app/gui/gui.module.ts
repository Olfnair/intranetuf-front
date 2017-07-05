// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Material
import { MaterialModule } from '@angular/material';

// Gui
import { CheckboxComponent } from "./checkbox";
import { DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter } from './datatable';
import { InfoModalComponent } from "./info-modal";
import { InputFileComponent } from "./input-file";
import { NavListComponent } from "./nav-list"
import { ProgressComponent } from "./progress";
import { SidenavLayoutComponent, SlSidenav, SlContent } from "./sidenav-layout";
import { SortButtonComponent } from "./sort-button";
import { UpDownComponent } from "./up-down";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    CheckboxComponent,
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    InfoModalComponent,
    InputFileComponent,
    NavListComponent,
    ProgressComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    SortButtonComponent,
    UpDownComponent,
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
    InfoModalComponent,
    ProgressComponent
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    CheckboxComponent,
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    InfoModalComponent,
    InputFileComponent,
    NavListComponent,
    ProgressComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    SortButtonComponent,
    UpDownComponent
  ]
})
export class GuiModule {}
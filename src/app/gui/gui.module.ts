// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

// Material
import { MaterialModule } from '@angular/material';

// Gui
import { DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter } from './datatable';
import { GuiCheckboxComponent } from "./gui-checkbox";
import { GuiFormComponent } from './gui-form';
import { GuiModalComponent } from "./gui-modal";
import { GuiProgressComponent } from "./gui-progress";
import { InputFileComponent } from "./input-file";
import { NavListComponent } from "./nav-list"
import { SidenavLayoutComponent, SlSidenav, SlContent } from "./sidenav-layout";
import { SortButtonComponent } from "./sort-button";
import { UpDownComponent } from "./up-down";
import { StatusIconComponent } from './status-icon/status-icon.component';
import { ModalService } from "app/gui/modal.service";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    GuiCheckboxComponent,
    GuiFormComponent,
    GuiModalComponent,
    GuiProgressComponent,
    InputFileComponent,
    NavListComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    SortButtonComponent,
    UpDownComponent,
    StatusIconComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
    GuiModalComponent,
    GuiProgressComponent
  ],
  imports: [ // modules importés
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [
    ModalService
  ],
  exports: [ // tous les composants, pipes, directives pour un module qui importe celui-ci
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    GuiCheckboxComponent,
    GuiFormComponent,
    GuiModalComponent,
    GuiProgressComponent,
    InputFileComponent,
    NavListComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    SortButtonComponent,
    UpDownComponent,
    StatusIconComponent
  ]
})
export class GuiModule {}
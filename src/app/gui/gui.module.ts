// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

// Material
import { MaterialModule } from '@angular/material';

// Gui Service
import { ModalService } from "app/gui/modal.service";

// Gui
import { ColumnHeaderComponent } from "./column-header";
import { DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter } from './datatable';
import { GuiCheckboxComponent } from "./gui-checkbox";
import { GuiFormComponent } from './gui-form';
import { GuiModalComponent } from "./gui-modal";
import { GuiProgressComponent } from "./gui-progress";
import { InputFileComponent } from "./input-file";
import { NavListComponent } from "./nav-list"
import { SidenavLayoutComponent, SlSidenav, SlContent } from "./sidenav-layout";
import { StatusIconComponent } from './status-icon/status-icon.component';
import { UpDownComponent } from "./up-down";

@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    ColumnHeaderComponent,
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    GuiCheckboxComponent,
    GuiFormComponent,
    GuiModalComponent,
    GuiProgressComponent,
    InputFileComponent,
    NavListComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    StatusIconComponent,
    UpDownComponent
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
    ColumnHeaderComponent,
    DatatableComponent, DatatableHeader, DatatableTitle, DatatableFooter,
    GuiCheckboxComponent,
    GuiFormComponent,
    GuiModalComponent,
    GuiProgressComponent,
    InputFileComponent,
    NavListComponent,
    SidenavLayoutComponent, SlSidenav, SlContent,
    StatusIconComponent,
    UpDownComponent
  ]
})
export class GuiModule {}
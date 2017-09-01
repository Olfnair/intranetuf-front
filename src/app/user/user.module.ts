// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
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
import { FilelistComponent } from "./file-section/filelist/filelist.component";
import { AddFileComponent } from "./file-section/add-file/add-file.component";
import { ChoseProjectNameComponent } from "./modals/chose-project-name/chose-project-name.component";
import { CheckVersionComponent } from './file-section/check-version/check-version.component';
import { VersionDetailsComponent } from './file-section/version-details/version-details.component';
import { FileSectionComponent } from './file-section/file-section.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { AccountNavListComponent } from './account-nav-list/account-nav-list.component';
import { AccountPannelComponent } from './account-pannel/account-pannel.component';
import { UserFormComponent } from "./user-form/user-form.component";
import { UserFilelistComponent } from './account-pannel/user-filelist/user-filelist.component';
import { UserFileSectionComponent } from './account-pannel/user-file-section/user-file-section.component';


@NgModule({
  declarations: [ // tous les composants, pipes, directives du module
    HomeComponent,
    ProjectlistComponent,
    LoginComponent,
    HeaderComponent,
    ActivateAccountComponent,
    FilelistComponent,
    AddFileComponent,
    ChoseProjectNameComponent,
    CheckVersionComponent,
    VersionDetailsComponent,
    FileSectionComponent,
    AddProjectComponent,
    AccountNavListComponent,
    AccountPannelComponent,
    UserFormComponent,
    UserFilelistComponent,
    UserFileSectionComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
    AddProjectComponent,
    ChoseProjectNameComponent
  ],
  imports: [ // modules importés
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
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
    AddFileComponent,
    ChoseProjectNameComponent,
    CheckVersionComponent,
    VersionDetailsComponent,
    FileSectionComponent,
    AddProjectComponent,
    AccountNavListComponent,
    AccountPannelComponent,
    UserFormComponent,
    UserFilelistComponent,
    UserFileSectionComponent
  ]
})
export class UserModule {}
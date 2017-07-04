// Material Design
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';

// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { RouterModule } from "@angular/router";

// Routes
import { APP_ROUTES } from './app.routes';

// Services
import { RestApiService } from "./shared/_services/rest-api.service";
import { FileUploadService } from "./shared/_services/file-upload.service";
import { SessionService } from "./shared/_services/session.service";

// Datatable
import { DatatableComponent } from './shared/datatable/datatable.component';
import { DatatableHeader, DatatableTitle, DatatableFooter } from './shared/datatable/datatable.component';

// Pipes
import { TruncatePipe } from './shared/_pipes/truncate.pipe';
import { NumberLenPipe } from './shared/_pipes/number-len.pipe';

// Components
import { HomeComponent } from "./user/home/home.component";
import { ProjectlistComponent } from "./user/projectlist/projectlist.component";
import { LoginComponent } from "./user/login/login.component";
import { UserFormComponent } from "./admin/user-form/user-form.component";
import { HeaderComponent } from "./user/header/header.component";
import { ActivateAccountComponent } from "./user/activate-account/activate-account.component";
import { FilelistComponent } from './user/filelist/filelist.component';
import { AddProjectComponent } from './user/projectlist/add-project/add-project.component';
import { AddFileComponent } from './user/add-file/add-file.component';
import { InputFileComponent } from './shared/input-file/input-file.component';
import { ProgressComponent } from './shared/progress/progress.component';
import { SortButtonComponent } from './shared/sort-button/sort-button.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { UserlistComponent } from './admin/userlist/userlist.component';
import { CheckboxComponent } from './shared/checkbox/checkbox.component';
import { InfoModalComponent } from './shared/info-modal/info-modal.component';
import { RightslistComponent } from './admin/rightslist/rightslist.component';
import { UpDownComponent } from './shared/up-down/up-down.component';
import { NavListComponent } from './shared/nav-list/nav-list.component';
import { SidenavLayoutComponent } from './shared/sidenav-layout/sidenav-layout.component';

@NgModule({
  declarations: [ // tous les composants (& pipes etc) accessibles dans le module (l'appli)
    AppComponent,
    HomeComponent,
    ProjectlistComponent,
    LoginComponent,
    UserFormComponent,
    HeaderComponent,
    ActivateAccountComponent,
    FilelistComponent,
    AddProjectComponent,
    AddFileComponent,
    InputFileComponent,
    TruncatePipe,
    NumberLenPipe,
    ProgressComponent,
    SortButtonComponent,
    AdminPanelComponent,
    DatatableComponent,
    DatatableHeader,
    DatatableTitle,
    DatatableFooter,
    UserlistComponent,
    CheckboxComponent,
    InfoModalComponent,
    RightslistComponent,
    UpDownComponent,
    NavListComponent,
    SidenavLayoutComponent
  ],
  entryComponents: [ // Ajouter ici tous les composants qui servent de modal
    AddProjectComponent,
    ProgressComponent,
    InfoModalComponent
  ],
  imports: [ // modules importés
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    RouterModule,
    MaterialModule,
    BrowserAnimationsModule,
    APP_ROUTES
  ],
  providers: [ // services globaux pour tout le module (l'appli) qu'on peut injecter directement dans d'autres composants
    SessionService,
    RestApiService,
    FileUploadService
  ],
  bootstrap: [AppComponent] // composant qui sert de racine à l'appli
})
export class AppModule {}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { RestApiService } from "app/shared/rest-api.service";
import { RouterModule } from "@angular/router";
import { APP_ROUTES } from './app.routes';
import { NavbuttonComponent } from './shared/navbutton/navbutton.component';
import { FileUploadService } from "app/shared/file-upload.service";
import { SessionService } from "app/shared/session.service";
import { HomeComponent } from "app/pages/home/home.component";
import { ProjectlistComponent } from "app/pages/projectlist/projectlist.component";
import { LoginComponent } from "app/pages/login/login.component";
import { UserFormComponent } from "app/pages/user-form/user-form.component";
import { HeaderComponent } from "app/pages/header/header.component";
import { ActivateAccountComponent } from "app/pages/activate-account/activate-account.component";
import { FilelistComponent } from './pages/filelist/filelist.component';
import { AddProjectComponent } from './pages/projectlist/add-project/add-project.component';
import { AddFileComponent } from './pages/add-file/add-file.component';
import { InputFileComponent } from './shared/input-file/input-file.component';
import { TruncatePipe } from './shared/truncate.pipe';
import { NumberLenPipe } from './shared/number-len.pipe';
import { ProgressComponent } from './shared/progress/progress.component';

// Material Design
import { MaterialModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import 'hammerjs';
import { SortButtonComponent } from './shared/sort-button/sort-button.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProjectlistComponent,
    NavbuttonComponent,
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
  ],
  entryComponents: [
    AddProjectComponent,
    ProgressComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    MaterialModule,
    BrowserAnimationsModule,
    APP_ROUTES
  ],
  providers: [
    SessionService,
    RestApiService,
    FileUploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

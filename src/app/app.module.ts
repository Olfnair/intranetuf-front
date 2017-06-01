import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { RestApiService } from "app/shared/rest-api.service";
import { HomeComponent } from './home/home.component';
import { RouterModule } from "@angular/router";
import { APP_ROUTES } from './app.routes';
import { ProjectlistComponent } from './projectlist/projectlist.component';
import { NavbuttonComponent } from './shared/navbutton/navbutton.component';
import { FileUploadService } from "app/shared/file-upload.service";
import { LoginComponent } from './login/login.component';
import { UserFormComponent } from './user-form/user-form.component';
import { HeaderComponent } from './header/header.component';
import { ActivateAccountComponent } from './activate-account/activate-account.component';

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
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    APP_ROUTES
  ],
  providers: [
    RestApiService,
    FileUploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

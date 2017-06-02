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
    SessionService,
    RestApiService,
    FileUploadService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

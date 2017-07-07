// Angular
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";

// Services
import { FileUploadService } from "./file-upload.service";
import { RestApiService } from "./rest-api.service";
import { SessionService } from "./session.service";

@NgModule({
  providers: [ // services providés et injectables directement depuis le module (singletons)
    FileUploadService,
    RestApiService,
    SessionService
  ],
  imports: [ // modules importés
    CommonModule,
    HttpModule,
    RouterModule,
  ]
})
export class ServicesModule {}
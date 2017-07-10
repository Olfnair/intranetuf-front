import { RouterModule, Routes } from '@angular/router';

// APP COMPONENTS
import { HomeComponent } from "./user/home/home.component";
import { ProjectlistComponent } from "./user/projectlist/projectlist.component";
import { UserFormComponent } from "./admin/user-form/user-form.component";
import { ActivateAccountComponent } from "./user/activate-account/activate-account.component";
import { AddFileComponent } from "./user/add-file/add-file.component";
import { AdminPanelComponent } from "./admin/admin-panel/admin-panel.component";
import { CheckVersionComponent } from "./user/check-version/check-version.component";
import { VersionDetailsComponent } from "app/user/version-details/version-details.component";

const ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'projectlist', component: ProjectlistComponent },
  { path: 'activate/:token', component: ActivateAccountComponent },
  { path: 'add_file/:projectId', component: AddFileComponent },
  { path: 'add_file/:projectId/:fileId', component: AddFileComponent },
  { path: 'admin', component: AdminPanelComponent },
  { path: 'check/:check', component: CheckVersionComponent },
  { path: 'version_details/:file', component: VersionDetailsComponent }
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES, { useHash: true });
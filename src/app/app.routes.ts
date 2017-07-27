import { RouterModule, Routes } from '@angular/router';

// Service droits d'accès
import { AdminRouteAccessChecker } from "app/services/route-access-checker.service";

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
  { path: 'projectlist', component: ProjectlistComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'activate/:token', component: ActivateAccountComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'add_file/:projectId', component: AddFileComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'add_file/:projectId/:fileId', component: AddFileComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'check/:check', component: CheckVersionComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'version_details/:file', component: VersionDetailsComponent, canActivate: [AdminRouteAccessChecker] }
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES, { useHash: true });
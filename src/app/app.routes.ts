import { RouterModule, Routes } from '@angular/router';

// Service droits d'accès
import {
  AddFileRouteAccessChecker,
  AdminRouteAccessChecker,
  EmptyRouteAccessChecker,
  UpdateFileVersionRouteAccessChecker
} from "app/services/route-access-checker.service";

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
  // EmptyRouteAccessChecker : ne vérifie rien, recharge juste les roles entre chaque page, pour les garder à jour
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [EmptyRouteAccessChecker] },
  { path: 'activate/:token', component: ActivateAccountComponent /* pas besoin de check d'accès à la route */ },
  { path: 'add_file/:projectId', component: AddFileComponent, canActivate: [AddFileRouteAccessChecker] },
  { path: 'add_file/:projectId/:fileId', component: AddFileComponent, canActivate: [UpdateFileVersionRouteAccessChecker] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminRouteAccessChecker] },
  { path: 'check/:check', component: CheckVersionComponent, canActivate: [EmptyRouteAccessChecker] },
  { path: 'version_details/:file', component: VersionDetailsComponent, canActivate: [EmptyRouteAccessChecker] }
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES, { useHash: true });
import { RouterModule, Routes } from '@angular/router';

// APP COMPONENTS
import { HomeComponent } from "app/pages/home/home.component";
import { ProjectlistComponent } from "app/pages/projectlist/projectlist.component";
import { UserFormComponent } from "app/pages/admin/user-form/user-form.component";
import { ActivateAccountComponent } from "app/pages/activate-account/activate-account.component";
import { AddFileComponent } from "app/pages/add-file/add-file.component";
import { AdminPanelComponent } from "app/pages/admin/admin-panel/admin-panel.component";

const ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'projectlist', component: ProjectlistComponent },
  { path: 'activate/:token', component: ActivateAccountComponent },
  { path: 'add_file/:projectId', component: AddFileComponent },
  { path: 'add_file/:projectId/:fileId', component: AddFileComponent },
  { path: 'admin', component: AdminPanelComponent }
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES, { useHash: true });
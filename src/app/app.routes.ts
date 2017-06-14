import { RouterModule, Routes } from '@angular/router';

// APP COMPONENTS
import { HomeComponent } from "app/pages/home/home.component";
import { ProjectlistComponent } from "app/pages/projectlist/projectlist.component";
import { UserFormComponent } from "app/pages/user-form/user-form.component";
import { ActivateAccountComponent } from "app/pages/activate-account/activate-account.component";
import { AddFileComponent } from "app/pages/add-file/add-file.component";

const ROUTES: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'projectlist', component: ProjectlistComponent},
    {path: 'admin/create_user', component: UserFormComponent},
    {path: 'activate', component: ActivateAccountComponent},
    {path: 'add_file/:projectId', component: AddFileComponent},
    {path: 'add_file/:projectId/:fileId', component: AddFileComponent},
    //{path: 'edit/:id', component: UpdateComponent},
    //{path: 'person/:id', component: PersonComponent}
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES,{useHash: true});
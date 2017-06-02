import { RouterModule, Routes } from '@angular/router';

// APP COMPONENTS
import { HomeComponent } from "app/pages/home/home.component";

// APP COMPONENTS
//import { PeopleComponent } from "./people";
//import { UpdateComponent } from "./update";
//import { PersonComponent } from "./person";

const ROUTES: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'projectlist', component: ProjectlistComponent},
    {path: 'admin/create_user', component: UserFormComponent},
    {path: 'activate', component: ActivateAccountComponent}
    //{path: 'edit/:id', component: UpdateComponent},
    //{path: 'person/:id', component: PersonComponent}
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES,{useHash: true});
/**
 * Auteur : Florian
 * License :
 */

import { RouterModule, Routes } from '@angular/router';

// Service droits d'accès
import {
  AdminRouteAccessChecker,
  EmptyRouteAccessChecker
} from "app/services/route-access-checker.service";

// APP COMPONENTS
import { HomeComponent } from "./user/home/home.component";
import { ActivateAccountComponent } from "./user/activate-account/activate-account.component";
import { AdminPanelComponent } from "./admin/admin-panel/admin-panel.component";

/**
 * Routes de l'application
 */
const ROUTES: Routes = [
  // EmptyRouteAccessChecker : ne vérifie rien, recharge juste les roles entre chaque page, pour les garder à jour
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [EmptyRouteAccessChecker] },
  { path: 'activate/:token', component: ActivateAccountComponent /* pas besoin de check d'accès à la route */ },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminRouteAccessChecker] }
];

export const APP_ROUTES = RouterModule.forRoot(ROUTES, { useHash: true });
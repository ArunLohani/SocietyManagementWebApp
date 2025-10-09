import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { dashboardGuard } from './core/guards/dashboard-guard';

export const routes: Routes = [

{
    path : "login",
    component:Login,
    canActivate:[dashboardGuard]
},
{
    path:"register",
    component:Register,
    canActivate:[dashboardGuard]
},
{
    path : "",
    component:Dashboard,
    canActivate:[authGuard]
}


];

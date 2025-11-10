import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { dashboardGuard } from './core/guards/dashboard-guard';
import { SuperAdminSocietyManager } from './features/super-admin-society-manager/super-admin-society-manager.component';
import { UserRoleManager } from './features/user-role-manager/user-role-manager';
import { UserRolePermissionManager } from './features/user-role-permission-manager/user-role-permission-manager';
import { SocietyRoleManager } from './features/society-role-manager/society-role-manager';
import { adminGuard } from './core/guards/admin-guard';
import { superAdminGuard } from './core/guards/super-admin-guard';
import { PageNotFound } from './shared/page-not-found/page-not-found';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

export const routes: Routes = [

    {
        path: "login",
        component: Login,
        canActivate: [dashboardGuard]
    },
    {
        path: "register",
        component: Register,
        canActivate: [dashboardGuard]
    },
    {

        path: "",
        canActivate: [authGuard],
        component: DashboardLayout,
        children: [
            {
                  path: "",
                  component : Dashboard
                
            },

            {
                path: "s_admin",
                canActivate: [superAdminGuard],
                children: [
                    {
                        path: "society",
                        component: SuperAdminSocietyManager
                    },
                ]
            }, {
                path: "admin",
                canActivate: [adminGuard],
                children: [
                    {
                        path: "role",
                        component: SocietyRoleManager
                    },
                    {
                        path: "permission",
                        component: UserRolePermissionManager
                    },
                    {
                        path: "user",
                        component: UserRoleManager
                    },
                ]
            }
        ]
    },
    {
        path: "**",
        component: PageNotFound
    }
];

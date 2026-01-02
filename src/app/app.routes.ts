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
import { EventsManagerComponent } from './features/menu/event/event';
import { EventDetailComponent } from './features/menu/event/event-detail/event-detail';
import { ComplaintsManagerComponent } from './features/menu/complaints/complaints';
import { ComplaintDetailComponent } from './features/menu/complaints/complaint-detail/complaint-detail';
import { NoticesManagerComponent } from './features/menu/notices/notices';
import { NoticeDetailComponent } from './features/menu/notices/notice-detail/notice-detail';
import { menuGuard } from './core/guards/menu-guard';
import { VehiclesManagerComponent } from './features/menu/vehicle/vehicle';
import { Parking } from './features/menu/parking/parking';
import { ParkingBooking } from './features/menu/parking-booking/parking-booking';
import { Payment } from './features/payment/payment';
import { MaintenancePricingComponent } from './features/menu/maintenance-pricing/maintenance-pricing';
import { PaymentComponent } from './features/menu/my-payments/my-payments';

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
                component: Dashboard

            },
            {
                path: "menu",
                children: [
                      {
                        path: "dashboard",
                        component: Dashboard,
                        canActivate: [menuGuard],
                        data: { menu: "Dashboard" }

                    },
                    {
                        path: "events",
                        component: EventsManagerComponent,
                        canActivate: [menuGuard],
                        data: { menu: "Events" }

                    },
                    {
                        path: "events/:id",
                        component: EventDetailComponent,
                        canActivate: [menuGuard],
                        data: { menu: "Events" }
                    },
                    {
                        path: "complaints",
                        component: ComplaintsManagerComponent,
                          canActivate: [menuGuard],
                        data: { menu: "Complaints" }

                    },
                    {
                        path: "complaints/:id",
                        component: ComplaintDetailComponent,
                          canActivate: [menuGuard],
                        data: { menu: "Complaints" }
                    },

                    {
                        path: "notices",
                        component: NoticesManagerComponent,
                          canActivate: [menuGuard],
                        data: { menu: "Notices" }
                        

                    },
                    {
                        path: "notices/:id",
                        component: NoticeDetailComponent,
                            canActivate: [menuGuard],
                        data: { menu: "Notices" }
                    },
                    {
                        path: "vehicle",
                        component: VehiclesManagerComponent,
                            canActivate: [menuGuard],
                        data: { menu: "Vehicle" }

                    }, {
                        path: "parking",
                        component: Parking,
                         canActivate: [menuGuard],
                        data: { menu: "Parking" }

                    }, {
                        path: "parking_requests",
                        component: ParkingBooking,
                        canActivate: [menuGuard],
                        data: { menu: "Parking Requests" }

                    },{
                        path:"pay",
                        component : Payment
                    },
                    {
                        path:"payments",
                        component : PaymentComponent,
                           canActivate: [menuGuard],
                        data: { menu: "Payments" }
                    },
                    {
                        path:"maintenance_pricing",
                        component : MaintenancePricingComponent,
                        //         canActivate: [menuGuard],
                        // data: { menu: "Maintenance Pricing" }

                    }
                ]

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

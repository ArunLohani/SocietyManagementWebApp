
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const superAdminGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
   const router = inject(Router)
 if(authService.isUserSuperAdmin()){
    console.log("authService.isUserSuperAdmin()",authService.isUserSuperAdmin())
    return true;
 }
 console.log("here")
 return router.navigateByUrl("/page-not-found");
};

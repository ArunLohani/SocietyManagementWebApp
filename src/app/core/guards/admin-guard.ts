import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
   const authService = inject(AuthService);
   const router = inject(Router)
 if(authService.isUserAdmin()){
   console.log("Hereh")
    return true;
 }
 return router.navigateByUrl("/page-not-found");
};

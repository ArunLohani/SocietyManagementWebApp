import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

 const authService = inject(AuthService);
 const router = inject(Router)

console.log("in guard")
 if(!authService.isAuthenticated()){
    router.navigateByUrl("/login")
    return false;
 }


 return true;

  



};

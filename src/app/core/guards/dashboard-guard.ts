import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const dashboardGuard: CanActivateFn = (route, state) => {
 const authService = inject(AuthService);
 const router = inject(Router)
 return authService.isAuthenticated$().pipe(
    map(isAuth => {
      if (isAuth) {
          return router.parseUrl('/');
     
      }
      return true;
    })
  );
};

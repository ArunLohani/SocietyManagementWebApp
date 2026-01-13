import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('in guard');

  return authService.isAuthenticated$().pipe(
    map(isAuth => {
      if (isAuth) {
        return true;
      }
      return router.parseUrl('/login');
    })
  );
};

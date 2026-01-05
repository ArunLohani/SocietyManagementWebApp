import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$().pipe(
    map(isAuth => {
      if (!isAuth) {
        router.navigateByUrl('/login');
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    })
  );
};

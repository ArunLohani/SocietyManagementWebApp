import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TenantRoleMenuService } from '../service/tenant-role-menu.service';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';

export const menuGuard: CanActivateFn = (route, state) => {
  const menu = route.data['menu'];
  const service = inject(TenantRoleMenuService);
  const router = inject(Router);

  return service.canAccess(menu).pipe(
    map(response => {
      if (response.data === true) {
        return true;
      }
      return router.parseUrl('/page-not-found');
    }),
    catchError(() => {
      return of(router.parseUrl('/page-not-found'));
    })
  );
};

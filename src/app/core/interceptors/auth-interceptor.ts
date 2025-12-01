import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: any) => {
        console.log(err)
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          authService.logout();
        }
      }
      // rethrow error so that subscriber (component) can handle it
      return throwError(() => err);
    })
  );
};

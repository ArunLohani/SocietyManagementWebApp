import { HttpErrorResponse, HttpEvent, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) : Observable<HttpEvent<unknown>> => {

    const authService = inject(AuthService)
    
return next(req)
    .pipe(catchError((err: any) => {
       
        if(err instanceof HttpErrorResponse) {
            if (err.status === 401) {
                authService.logout();
            }
        }

      return new Observable<HttpEvent<any>>();
    }));

};

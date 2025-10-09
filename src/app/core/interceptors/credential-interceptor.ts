import { HttpInterceptorFn } from '@angular/common/http';

export const credentialInterceptor: HttpInterceptorFn = (req, next) => {


  const cloneReq = req.clone({
    withCredentials : true
  })


  return next(cloneReq);
};

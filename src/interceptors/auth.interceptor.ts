import {HttpInterceptor, HttpInterceptorFn} from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const strigytoken = localStorage.getItem('auth')
  const token = strigytoken ? JSON.parse(strigytoken)?.token : null;
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
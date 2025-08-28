import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, take, switchMap, throwError, BehaviorSubject } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const isRefreshing = { value: false };
  const refreshTokenSubject = new BehaviorSubject<any>(null);

  const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const handle401Error = (req: HttpRequest<any>, nextHandler: HttpHandlerFn) => {
    if (!isRefreshing.value) {
      isRefreshing.value = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((response) => {
          isRefreshing.value = false;
          refreshTokenSubject.next(response.accessToken);
          return nextHandler(addToken(req, response.accessToken));
        }),
        catchError((error) => {
          isRefreshing.value = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => nextHandler(addToken(req, token)))
      );
    }
  };

  const token = authService.getAccessToken();
  
  if (token) {
    request = addToken(request, token);
  }

  console.log('Making request to:', request.url, 'with token:', !!token);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error:', error.status, error.url, error.error);
      if (error.status === 401 && !request.url.includes('auth/refresh')) {
        return handle401Error(request, next);
      }
      return throwError(() => error);
    })
  );
};

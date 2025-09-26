import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, take, switchMap, throwError, BehaviorSubject, of } from 'rxjs';

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

  // Skip token validation for auth endpoints
  if (request.url.includes('/auth/')) {
    return next(request);
  }

  const token = authService.getAccessToken();
  
  if (token) {
    // Check if token is expired before making request
    if (authService.isTokenExpired()) {
      console.log('🔄 Token is expired, refreshing before request...');
      
      return authService.refreshToken().pipe(
        switchMap((response) => {
          const newToken = authService.getAccessToken();
          if (newToken) {
            request = addToken(request, newToken);
          }
          return next(request);
        }),
        catchError((error) => {
          console.log('❌ Token refresh failed:', error);
          return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }));
        })
      );
    } else {
      // Token is still valid, add it to request
      request = addToken(request, token);
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('auth/refresh')) {
        return handle401Error(request, next);
      }
      return throwError(() => error);
    })
  );
};

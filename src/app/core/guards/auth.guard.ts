import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, take, switchMap, of, catchError } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this._authService.isAuthenticated$.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this._router.navigate(['/auth/login']);
          return of(false);
        }

        // Check if token is expired
        if (this._authService.isTokenExpired()) {
          
          return this._authService.refreshToken().pipe(
            map(() => true),
            catchError(() => {
              this._router.navigate(['/auth/login']);
              return of(false);
            })
          );
        }

        return of(true);
      })
    );
  }
}



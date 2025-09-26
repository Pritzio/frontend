import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, timer, fromEvent } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { IUser, IBackendAuthResponse } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {
  private _isValidating = new BehaviorSubject<boolean>(false);
  private _validationTimer: any = null;
  private _isActive = false;
  private readonly _apiUrl = `${environment.apiUrl}/auth`;

  public isValidating$ = this._isValidating.asObservable();

  constructor(
    private _router: Router,
    private _http: HttpClient
  ) {
    this._setupVisibilityListener();
  }

  /**
   * Start token validation service
   * Validates token every 5 minutes and before expiration
   */
  public startValidation(): void {
    if (this._isActive) return;
    
    this._isActive = true;
    this._scheduleNextValidation();
  }

  /**
   * Stop token validation service
   */
  public stopValidation(): void {
    this._isActive = false;
    if (this._validationTimer) {
      clearTimeout(this._validationTimer);
      this._validationTimer = null;
    }
  }

  /**
   * Validate token immediately
   */
  public validateTokenNow(): Observable<boolean> {
    this._isValidating.next(true);
    
    return this._refreshToken().pipe(
      tap(() => {
        this._isValidating.next(false);
        console.log('✅ Token refreshed successfully');
      }),
      catchError((error) => {
        this._isValidating.next(false);
        console.log('❌ Token refresh failed, logging out');
        this._handleTokenExpired();
        return [false];
      }),
      switchMap(() => [true])
    );
  }

  /**
   * Check if token is expired or will expire soon
   */
  public isTokenExpiredOrExpiringSoon(): boolean {
    const token = this._getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Consider token expired if it expires in less than 5 minutes
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return timeUntilExpiry < bufferTime;
    } catch {
      return true;
    }
  }

  /**
   * Get time until token expires in milliseconds
   */
  public getTimeUntilExpiry(): number {
    const token = this._getAccessToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      return Math.max(0, expirationTime - currentTime);
    } catch {
      return 0;
    }
  }

  /**
   * Schedule next token validation
   */
  private _scheduleNextValidation(): void {
    if (!this._isActive) return;

    const timeUntilExpiry = this.getTimeUntilExpiry();
    
    if (timeUntilExpiry <= 0) {
      // Token is already expired
      this._handleTokenExpired();
      return;
    }

    // Schedule validation 5 minutes before expiry, or in 5 minutes if more than 10 minutes remain
    const validationTime = Math.min(
      timeUntilExpiry - (5 * 60 * 1000), // 5 minutes before expiry
      5 * 60 * 1000 // or 5 minutes from now
    );

    this._validationTimer = setTimeout(() => {
      this._performValidation();
    }, Math.max(validationTime, 60000)); // At least 1 minute
  }

  /**
   * Perform token validation
   */
  private _performValidation(): void {
    if (!this._isActive) return;

    if (this.isTokenExpiredOrExpiringSoon()) {
      this.validateTokenNow().subscribe({
        next: (success) => {
          if (success) {
            this._scheduleNextValidation();
          }
        },
        error: () => {
          // Error already handled in validateTokenNow
        }
      });
    } else {
      // Token is still valid, schedule next check
      this._scheduleNextValidation();
    }
  }

  /**
   * Handle token expiration
   */
  private _handleTokenExpired(): void {
    this.stopValidation();
    this._clearAuthData();
    this._router.navigate(['/auth/login']);
  }

  /**
   * Setup visibility change listener to validate token when user returns to tab
   */
  private _setupVisibilityListener(): void {
    fromEvent(document, 'visibilitychange').subscribe(() => {
      if (!document.hidden && this._isActive) {
        // User returned to tab, validate token if it's close to expiring
        if (this.isTokenExpiredOrExpiringSoon()) {
          this.validateTokenNow().subscribe();
        }
      }
    });
  }

  /**
   * Check if validation service is active
   */
  public isActive(): boolean {
    return this._isActive;
  }

  /**
   * Get access token from localStorage
   */
  private _getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   */
  private _getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Refresh token using HTTP request
   */
  private _refreshToken(): Observable<IBackendAuthResponse> {
    const refreshToken = this._getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this._http.post<IBackendAuthResponse>(`${this._apiUrl}/refresh`, {
      refreshToken: refreshToken
    }).pipe(
      tap(response => {
        // Update tokens in localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  /**
   * Clear authentication data
   */
  private _clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

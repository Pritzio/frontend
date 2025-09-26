import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { IUser, ILoginRequest, IRegisterRequest, IAuthResponse, IRefreshTokenRequest, IBackendAuthResponse } from '../../models/user.model';
import { IApiResponse } from '../../models/api.model';
import { RegisterRequest, VerifyEmailRequest, VerifyEmailResponse, ResendVerificationRequest, ResendVerificationResponse } from '../../models/registration.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _apiUrl = `${environment.apiUrl}/auth`;
  
  private _currentUser = new BehaviorSubject<IUser | null>(null);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _isAdmin = new BehaviorSubject<boolean>(false);

  public currentUser$ = this._currentUser.asObservable();
  public isAuthenticated$ = this._isAuthenticated.asObservable();
  public isAdmin$ = this._isAdmin.asObservable();

  constructor(
    private _http: HttpClient,
    private _router: Router
  ) {
    // Delay the auth check to allow components to load first
    setTimeout(() => {
      this._checkAuthStatus();
    }, 100);
  }

  login(credentials: ILoginRequest): Observable<IBackendAuthResponse> {
    return this._http.post<IBackendAuthResponse>(`${this._apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
  
          this._handleSuccessfulAuth(response);
        })
      );
  }

  register(userData: IRegisterRequest): Observable<IBackendAuthResponse> {
    return this._http.post<IBackendAuthResponse>(`${this._apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this._handleSuccessfulAuth(response);
        })
      );
  }

  registerNewUser(userData: RegisterRequest): Observable<IBackendAuthResponse> {
    return this._http.post<IBackendAuthResponse>(`${this._apiUrl}/register`, userData);
  }

  verifyEmail(token: string): Observable<VerifyEmailResponse> {
    const request: VerifyEmailRequest = { token };
    return this._http.post<VerifyEmailResponse>(`${this._apiUrl}/verify-email`, request);
  }

  resendVerification(email: string): Observable<ResendVerificationResponse> {
    const request: ResendVerificationRequest = { email };
    return this._http.post<ResendVerificationResponse>(`${this._apiUrl}/resend-verification`, request);
  }

  logout(): void {
    this._clearAuthData();
    this._router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<IBackendAuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const request: IRefreshTokenRequest = { refreshToken: refreshToken || '' };
    
    return this._http.post<IBackendAuthResponse>(`${this._apiUrl}/refresh`, request)
      .pipe(
        tap(response => {
          this._handleSuccessfulAuth(response);
        })
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private _handleSuccessfulAuth(authData: IBackendAuthResponse): void {
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));

    this._currentUser.next(authData.user);
    this._isAuthenticated.next(true);
    this._isAdmin.next(authData.user.type === 'system');

    this._redirectAfterLogin(authData.user);
  }

  private _redirectAfterLogin(user: IUser): void {
    // Check if user is admin (system type)
    if (user.type === 'system') {
      // Check if we're on mobile view
      const isMobileView = window.innerWidth < 1024; // lg breakpoint
      
      if (isMobileView) {
        // Redirect admin users to dashboard on mobile instead of admin panel
        this._router.navigate(['/dashboard']);
      } else {
        // Redirect to admin panel on desktop
        this._router.navigate(['/admin/dashboard']);
      }
    } else {
      // Regular users always go to dashboard
      this._router.navigate(['/dashboard']);
    }
  }

  private _checkAuthStatus(): void {
    const user = localStorage.getItem('user');
    const token = this.getAccessToken();

    if (user && token && !this.isTokenExpired()) {
      const userData: IUser = JSON.parse(user);
      this._currentUser.next(userData);
      this._isAuthenticated.next(true);
      this._isAdmin.next(userData.type === 'system');
      
      // Don't redirect if we're on the verify-email page
      const currentUrl = this._router.url;
      
      if (!currentUrl.includes('/verify-email')) {
        // Check if admin user is on mobile and redirect if needed
        this._checkMobileRedirect(userData);
      }
    } else {
      this._clearAuthData();
      
      // Don't redirect if we're on the verify-email page
      const currentUrl = this._router.url;
      if (currentUrl.includes('/verify-email')) {
        return;
      }
    }
  }

  private _checkMobileRedirect(user: IUser): void {
    // Only check for admin users (system type)
    if (user.type === 'system') {
      const isMobileView = window.innerWidth < 1024; // lg breakpoint
      const currentUrl = this._router.url;
      
      // Don't redirect if we're on the verify-email page
      if (currentUrl.includes('/verify-email')) {
        return;
      }
      
      // If on mobile and trying to access admin routes, redirect to dashboard
      if (isMobileView && currentUrl.startsWith('/admin')) {
        this._router.navigate(['/dashboard']);
      }
    }
  }

  public getCurrentUser(): IUser | null {
    return this._currentUser.value;
  }

  private _clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    this._currentUser.next(null);
    this._isAuthenticated.next(false);
    this._isAdmin.next(false);
  }
}

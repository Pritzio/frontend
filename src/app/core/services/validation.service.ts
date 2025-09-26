import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  checkUsername(username: string): Observable<{ exists: boolean; message: string }> {
    if (!username || username.length < 3) {
      return of({ exists: false, message: 'Username is available' });
    }

    return this.http.post<{ exists: boolean; message: string }>(
      `${this.apiUrl}/check-username`,
      { username }
    ).pipe(
      catchError(() => of({ exists: false, message: 'Username is available' }))
    );
  }

  checkEmail(email: string): Observable<{ exists: boolean; message: string }> {
    if (!email || !this.isValidEmail(email)) {
      return of({ exists: false, message: 'Email is available' });
    }

    return this.http.post<{ exists: boolean; message: string }>(
      `${this.apiUrl}/check-email`,
      { email }
    ).pipe(
      catchError(() => of({ exists: false, message: 'Email is available' }))
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

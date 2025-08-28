import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ILoginRequest, IBackendAuthResponse } from '../../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public isLoading = false;
  public errorMessage = '';

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router
  ) {
    this.loginForm = this._formBuilder.group({
      identifier: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    this._checkAuthStatus();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this._performLogin();
    }
  }

  private _performLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const credentials: ILoginRequest = this.loginForm.value;

    this._authService.login(credentials)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: IBackendAuthResponse) => {
          this._handleSuccessfulLogin(response);
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.error?.message) {
            this.errorMessage = Array.isArray(error.error.message) 
              ? error.error.message.join(', ') 
              : error.error.message;
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid credentials. Please check your username/email and password.';
          } else if (error.status === 401) {
            this.errorMessage = 'Authentication failed. Please check your credentials.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection.';
          } else {
            this.errorMessage = 'An error occurred during login. Please try again.';
          }
        }
      });
  }

  private _handleSuccessfulLogin(authData: IBackendAuthResponse): void {
    this.loginForm.reset();
    this.errorMessage = '';
    // The redirect is handled automatically by the AuthService
  }

  private _checkAuthStatus(): void {
    this._authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this._authService.currentUser$.subscribe(user => {
          if (user?.type === 'system') {
            this._router.navigate(['/admin/dashboard']);
          } else {
            this._router.navigate(['/dashboard']);
          }
        });
      }
    });
  }
}

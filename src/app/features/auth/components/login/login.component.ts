import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ILoginRequest } from '../../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public isLoading = false;
  public errorMessage = '';
  public submitted = false;

  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this._initForm();
    
    // Check if user is already authenticated
    this._authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this._router.navigate(['/dashboard']);
      }
    });
  }

  private _initForm(): void {
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;

    const credentials: ILoginRequest = {
      identifier: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this._authService.login(credentials)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // La navegación se maneja en el AuthService
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error en login:', error);
          
          if (error.error?.error?.message) {
            this.errorMessage = error.error.error.message;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
          }
        }
      });
  }

  public debugLogin(): void {
    console.log('=== DEBUG LOGIN ===');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form values:', this.loginForm.value);
    console.log('Form errors:', this.loginForm.errors);
    
    // Test with hardcoded credentials
    const testCredentials: ILoginRequest = {
      identifier: 'test@test.com',
      password: 'password123'
    };
    
    console.log('Testing with credentials:', testCredentials);
    
    this._authService.login(testCredentials)
      .subscribe({
        next: (response) => {
          console.log('Debug login success:', response);
        },
        error: (error) => {
          console.error('Debug login error:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message
          });
        }
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ILoginRequest } from '../../../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  public isLoading = false;
  public errorMessage = '';
  public submitted = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated
    this._authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this._router.navigate(['/dashboard']);
      }
    });
  }

  public onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.loginData.email || !this.loginData.password) {
      return;
    }

    this.isLoading = true;

    const credentials: ILoginRequest = {
      identifier: this.loginData.email,
      password: this.loginData.password
    };

    this._authService.login(credentials)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this._router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        }
      });
  }
}

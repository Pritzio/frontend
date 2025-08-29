import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ILoginRequest } from '../../../../models/user.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
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
    private _formBuilder: FormBuilder,
    private _i18nService: I18nService
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
          // Navigation is handled in AuthService
        },
        error: (error) => {
          this.isLoading = false;

          
          if (error.error?.error?.message) {
            this.errorMessage = error.error.error.message;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = this._i18nService.translate('AUTH.LOGIN_INVALID_CREDENTIALS');
          }
        }
      });
  }


}

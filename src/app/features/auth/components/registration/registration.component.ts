import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

import { AuthService } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RegisterRequest } from '../../../../models/registration.model';
import { nameValidator, passwordMatchValidator } from '../../../../shared/validators/name.validator';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './registration.component.html'
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  
  // Real-time validation states
  usernameChecking = false;
  emailChecking = false;
  usernameAvailable = false;
  emailAvailable = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private validationService: ValidationService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupRealTimeValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.registrationForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        nameValidator()
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        nameValidator()
      ]],
      userType: ['CUSTOMER', [Validators.required]],
      acceptTermsAndConditions: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator() });
  }

  private setupRealTimeValidation(): void {
    // Username validation
    this.registrationForm.get('username')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(username => {
          this.usernameChecking = true;
          return this.validationService.checkUsername(username);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.usernameChecking = false;
        this.usernameAvailable = !result.exists;
        
        if (result.exists) {
          this.registrationForm.get('username')?.setErrors({ usernameExists: true });
        } else {
          const currentErrors = this.registrationForm.get('username')?.errors;
          if (currentErrors) {
            delete currentErrors['usernameExists'];
            this.registrationForm.get('username')?.setErrors(
              Object.keys(currentErrors).length > 0 ? currentErrors : null
            );
          }
        }
      });

    // Email validation
    this.registrationForm.get('email')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(email => {
          this.emailChecking = true;
          return this.validationService.checkEmail(email);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.emailChecking = false;
        this.emailAvailable = !result.exists;
        
        if (result.exists) {
          this.registrationForm.get('email')?.setErrors({ emailExists: true });
        } else {
          const currentErrors = this.registrationForm.get('email')?.errors;
          if (currentErrors) {
            delete currentErrors['emailExists'];
            this.registrationForm.get('email')?.setErrors(
              Object.keys(currentErrors).length > 0 ? currentErrors : null
            );
          }
        }
      });
  }

  onSubmit(): void {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const formData = this.registrationForm.value;
      delete formData.confirmPassword; // No enviar al backend
      
      this.authService.registerNewUser(formData as RegisterRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.showSuccess('AUTH.REGISTER_SUCCESS');
          
          // Mostrar mensaje temporal y redirigir al login
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { 
                message: 'verify-email',
                email: formData.email 
              }
            });
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.handleRegistrationError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private handleRegistrationError(error: any): void {
    if (error.status === 409) {
      if (error.error.message.includes('username')) {
        this.registrationForm.get('username')?.setErrors({ usernameExists: true });
        this.notificationService.showError('AUTH.REGISTER_USERNAME_EXISTS');
      } else if (error.error.message.includes('email')) {
        this.registrationForm.get('email')?.setErrors({ emailExists: true });
        this.notificationService.showError('AUTH.REGISTER_EMAIL_EXISTS');
      }
    } else if (error.status === 400) {
      this.notificationService.showError('VALIDATION.INVALID');
    } else {
      this.notificationService.showError('AUTH.REGISTER_ERROR');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFieldError(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'VALIDATION.REQUIRED';
      if (field.errors['email']) return 'VALIDATION.EMAIL_INVALID';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `VALIDATION.MIN_LENGTH`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `VALIDATION.MAX_LENGTH`;
      }
      if (field.errors['pattern']) return this.getPatternError(fieldName);
      if (field.errors['passwordMismatch']) return 'AUTH.REGISTER_PASSWORD_MISMATCH';
      if (field.errors['usernameExists']) return 'AUTH.REGISTER_USERNAME_EXISTS';
      if (field.errors['emailExists']) return 'AUTH.REGISTER_EMAIL_EXISTS';
      if (field.errors['nameInvalidCharacters']) return 'VALIDATION.NAME_INVALID_CHARACTERS';
      if (field.errors['nameNoNumbers']) return 'VALIDATION.NAME_NO_NUMBERS';
    }
    return '';
  }

  getFieldStatus(fieldName: string): 'checking' | 'available' | 'taken' | 'invalid' | 'neutral' {
    const field = this.registrationForm.get(fieldName);
    
    if (fieldName === 'username') {
      if (this.usernameChecking) return 'checking';
      if (field?.errors?.['usernameExists']) return 'taken';
      if (this.usernameAvailable && field?.valid) return 'available';
      if (field?.errors && field.touched) return 'invalid';
      return 'neutral';
    }
    
    if (fieldName === 'email') {
      if (this.emailChecking) return 'checking';
      if (field?.errors?.['emailExists']) return 'taken';
      if (this.emailAvailable && field?.valid) return 'available';
      if (field?.errors && field.touched) return 'invalid';
      return 'neutral';
    }
    
    return 'neutral';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'COMMON.USERNAME',
      email: 'COMMON.EMAIL',
      password: 'COMMON.PASSWORD',
      confirmPassword: 'AUTH.REGISTER_CONFIRM_PASSWORD',
      firstName: 'COMMON.FIRST_NAME',
      lastName: 'COMMON.LAST_NAME'
    };
    return labels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    const patternErrors: { [key: string]: string } = {
      username: 'AUTH.REGISTER_USERNAME_PATTERN',
      password: 'AUTH.REGISTER_PASSWORD_PATTERN'
    };
    return patternErrors[fieldName] || 'VALIDATION.INVALID';
  }
}

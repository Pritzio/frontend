import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value.toString().trim();
    
    // Check if name contains only letters, spaces, hyphens, and apostrophes
    const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    
    if (!namePattern.test(value)) {
      return { nameInvalidCharacters: true };
    }

    // Check if name contains numbers
    const numberPattern = /\d/;
    if (numberPattern.test(value)) {
      return { nameNoNumbers: true };
    }

    return null;
  };
}

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  };
}

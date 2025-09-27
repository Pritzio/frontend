import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AlertService } from '../../../../core/services/alert.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './email-verification.component.html'
})
export class EmailVerificationComponent implements OnInit {
  email: string = '';
  token: string = '';
  verificationStatus: 'pending' | 'success' | 'error' = 'pending';
  isVerifying = false;
  isResending = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      
      if (this.token) {
        this.verificationStatus = 'pending';
        setTimeout(() => {
          this.verifyEmail();
        }, 2000);
      } else {
        this.verificationStatus = 'error';
        this.errorMessage = 'Token de verificación no encontrado';
      }
    });
  }

  verifyEmail(): void {
    if (!this.token) {
      this.verificationStatus = 'error';
      this.errorMessage = 'Token de verificación no encontrado';
      return;
    }

    this.isVerifying = true;
    this.verificationStatus = 'pending';

    this.authService.verifyEmail(this.token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.verificationStatus = 'success';
        this.notificationService.showSuccess('AUTH.VERIFY_EMAIL_SUCCESS_TITLE');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { 
              message: 'email-verified',
              email: this.email 
            }
          });
        }, 3000);
      },
      error: (error) => {
        this.isVerifying = false;
        this.verificationStatus = 'error';
        this.handleVerificationError(error);
      }
    });
  }

  private handleVerificationError(error: any): void {
    if (error.status === 400) {
      this.errorMessage = 'Token de verificación inválido';
    } else if (error.status === 404) {
      this.errorMessage = 'Token de verificación no encontrado';
    } else if (error.status === 0) {
      this.errorMessage = 'Error de conexión - Backend no disponible';
    } else {
      this.errorMessage = `Error ${error.status}: ${error.message || 'Error desconocido'}`;
    }
  }

  async resendVerification(): Promise<void> {
    if (!this.email) {
      // Si no hay email, pedir al usuario que lo ingrese con un modal elegante
      const email = await this.alertService.promptEmail(
        'AUTH.VERIFY_EMAIL_RESEND',
        'AUTH.VERIFY_EMAIL_VERIFYING_DESCRIPTION',
        'AUTH.VERIFY_EMAIL_TRY_AGAIN',
        'COMMON.CANCEL'
      );
      
      if (!email) {
        // Si cancela, no mostrar error, simplemente no hacer nada
        return;
      }
      this.email = email;
    }

    this.isResending = true;
    this.authService.resendVerification(this.email).subscribe({
      next: (response) => {
        this.isResending = false;
        this.notificationService.showSuccess('AUTH.VERIFY_EMAIL_RESENT_SUCCESS');
        // Redirigir al login después del reenvío exitoso
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              message: 'verification-resent',
              email: this.email
            }
          });
        }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje
      },
      error: (error) => {
        this.isResending = false;
        this.handleResendError(error);
      }
    });
  }

  private async handleResendError(error: any): Promise<void> {
    // Extraer el mensaje real del error
    const errorMessage = error.error?.message || error.message || '';
    
    if (error.status === 400) {
      // Verificar si es el error de email ya verificado
      if (errorMessage && errorMessage.toLowerCase().includes('already verified')) {
        await this.handleEmailAlreadyVerified();
      } else {
        this.notificationService.showError('AUTH.VERIFY_EMAIL_RESEND_ERROR');
      }
    } else if (error.status === 404) {
      // Usuario no encontrado - permitir reintentar con email diferente
      await this.handleUserNotFoundError();
    } else if (error.status === 0) {
      this.notificationService.showError('AUTH.VERIFY_EMAIL_RESEND_ERROR');
    } else {
      this.notificationService.showError('AUTH.VERIFY_EMAIL_RESEND_ERROR');
    }
  }

  private async handleUserNotFoundError(): Promise<void> {
    // Mostrar mensaje de error con botón más claro
    await this.alertService.error(
      'AUTH.VERIFY_EMAIL_USER_NOT_FOUND_MESSAGE',
      'AUTH.VERIFY_EMAIL_USER_NOT_FOUND'
    );
    
    // Limpiar el email para permitir intentar de nuevo
    this.email = '';
  }

  private async handleEmailAlreadyVerified(): Promise<void> {
    // Mostrar mensaje de éxito y redirigir al login
    await this.alertService.success(
      'AUTH.VERIFY_EMAIL_ALREADY_VERIFIED_MESSAGE',
      'AUTH.VERIFY_EMAIL_ALREADY_VERIFIED'
    );
    
    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          message: 'email-already-verified',
          email: this.email 
        }
      });
    }, 2000);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}

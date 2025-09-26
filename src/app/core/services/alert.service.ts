import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { I18nService } from './i18n.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private i18nService: I18nService) {}

  /**
   * Helper method to translate text
   */
  private translate(key: string): string {
    return this.i18nService.translate(key);
  }

  /**
   * Show success message
   */
  success(message: string, title: string = '¡Éxito!'): Promise<any> {
    return Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      icon: 'success',
      confirmButtonText: this.translate('COMMON.UNDERSTOOD'),
      confirmButtonColor: '#10b981',
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show error message
   */
  error(message: string, title: string = 'Error'): Promise<any> {
    return Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      icon: 'error',
      confirmButtonText: this.translate('COMMON.UNDERSTOOD'),
      confirmButtonColor: '#ef4444',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show warning message
   */
  warning(message: string, title: string = 'Advertencia'): Promise<any> {
    return Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      icon: 'warning',
      confirmButtonText: this.translate('COMMON.UNDERSTOOD'),
      confirmButtonColor: '#f59e0b',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show info message
   */
  info(message: string, title: string = 'Información'): Promise<any> {
    return Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      icon: 'info',
      confirmButtonText: this.translate('COMMON.UNDERSTOOD'),
      confirmButtonColor: '#3b82f6',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  /**
   * Show confirmation dialog
   */
  confirm(
    message: string, 
    title: string = '¿Estás seguro?',
    confirmText: string = 'Sí, confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translate(confirmText),
      cancelButtonText: this.translate(cancelText),
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  /**
   * Show loading message
   */
  loading(message: string = 'Procesando...'): void {
    Swal.fire({
      title: this.translate(message),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Close any open alert
   */
  close(): void {
    Swal.close();
  }

  /**
   * Show toast notification (small, non-intrusive)
   */
  toast(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'top-end'
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  }

  /**
   * Show input dialog for email
   */
  async promptEmail(
    title: string = 'Reenviar Verificación',
    message: string = 'Por favor ingresa tu correo electrónico para reenviar la verificación:',
    confirmText: string = 'Reenviar',
    cancelText: string = 'Cancelar'
  ): Promise<string | null> {
    const { value: email } = await Swal.fire({
      title: this.translate(title),
      text: this.translate(message),
      input: 'email',
      inputPlaceholder: 'tu@email.com',
      inputValidator: (value) => {
        if (!value) {
          return this.translate('VALIDATION.EMAIL_REQUIRED');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return this.translate('VALIDATION.EMAIL_INVALID');
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: this.translate(confirmText),
      cancelButtonText: this.translate(cancelText),
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      focusCancel: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    return email || null;
  }
}

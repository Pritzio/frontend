import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IAdminUser } from '../../interfaces';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../../core/services/i18n.service';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss']
})
export class UserDetailModalComponent {
  @Input() user: IAdminUser | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  constructor(private _i18nService: I18nService) {}

  public onClose(): void {
    this.close.emit();
  }

  public onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  public getDisplayName(): string {
    if (!this.user) return '';
    
    const firstName = this.user.profile?.firstName;
    const lastName = this.user.profile?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (this.user.username) {
      return this.user.username;
    } else {
      return this._i18nService.translate('USERS.FALLBACKS.NO_NAME');
    }
  }

  public getUserRoles(): string {
    if (!this.user?.roles || !Array.isArray(this.user.roles) || this.user.roles.length === 0) {
      return this._i18nService.translate('USERS.FALLBACKS.NO_ROLES');
    }
    
    const displayRoles = this.user.roles.map(role => role.displayName || role.name);
    return displayRoles.join(', ');
  }

  public getStatusColor(): string {
    if (!this.user) return 'text-gray-600 bg-gray-50';
    
    switch (this.user.status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-gray-700 bg-gray-100';
      case 'suspended': return 'text-red-700 bg-red-100';
      case 'pending_verification': return 'text-yellow-700 bg-yellow-100';
      case 'deleted': return 'text-gray-500 bg-gray-200';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public getStatusText(): string {
    if (!this.user) return '';
    
    switch (this.user.status) {
      case 'active': return this._i18nService.translate('USERS.STATUSES.ACTIVE');
      case 'inactive': return this._i18nService.translate('USERS.STATUSES.INACTIVE');
      case 'suspended': return this._i18nService.translate('USERS.STATUSES.SUSPENDED');
      case 'pending_verification': return this._i18nService.translate('USERS.STATUSES.PENDING');
      case 'deleted': return this._i18nService.translate('USERS.STATUSES.DELETED');
      default: return this._i18nService.translate('USERS.FALLBACKS.NO_STATUS');
    }
  }

  public formatDate(date: string | undefined): string {
    if (!date) return this._i18nService.translate('USERS.FALLBACKS.NO_DATE');
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString();
    } catch {
      return this._i18nService.translate('USERS.FALLBACKS.NO_DATE');
    }
  }

  public getInitials(): string {
    if (!this.user) return '?';
    
    const firstName = this.user.profile?.firstName;
    const lastName = this.user.profile?.lastName;
    
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    
    if (!firstInitial && !lastInitial) {
      return '?';
    }
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
}

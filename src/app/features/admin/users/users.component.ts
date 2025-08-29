import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UsersService } from '../../../core/services/users.service';
import { IAdminUser, UserStatus, IUserRole } from './interfaces';
import { ProfileVisibility } from './enums';
import { ROLE_DISPLAY_NAMES } from './constants';
import { IApiFilters } from '../../../models/api.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public users: IAdminUser[] = [];
  public isLoading = true;
  public searchTerm = '';
  public statusFilter = '';
  public typeFilter = '';
  public currentPage = 1;
  public totalPages = 1;
  public totalUsers = 0;
  public limit = 20;
  public loginForm!: FormGroup;

  public UserStatus = UserStatus;
  public ProfileVisibility = ProfileVisibility;

  constructor(
    private _usersService: UsersService,
    private _formBuilder: FormBuilder,
    private _i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this._initForm();
    this._loadUsers();
  }

  private _initForm(): void {
    this.loginForm = this._formBuilder.group({
      searchTerm: [''],
      statusFilter: [''],
      typeFilter: ['']
    });

    this.loginForm.patchValue({
      searchTerm: this.searchTerm,
      statusFilter: this.statusFilter,
      typeFilter: this.typeFilter
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadUsers(): void {
    this.isLoading = true;
    
    const filters: IApiFilters = {
      page: this.currentPage,
      limit: this.limit,
      search: this.searchTerm || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    this._usersService.getUsers(filters)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.users && Array.isArray(response.users)) {
            this.users = response.users;
            this.totalPages = response.pagination?.pages || 1;
            this.totalUsers = response.pagination?.total || 0;
          } else if (response.success && response.data) {
            this.users = response.data.data;
            this.totalPages = response.data.meta.totalPages;
            this.totalUsers = response.data.meta.total;
          } else {
            this.users = [];
            this.totalPages = 1;
            this.totalUsers = 0;
          }
          
          this.isLoading = false;
        },
        error: (error: any) => {
          this.isLoading = false;
        }
      });
  }

  public get filteredUsers(): IAdminUser[] {
    let filtered = this.users;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const firstName = user.profile?.firstName || '';
        const lastName = user.profile?.lastName || '';
        const email = user.email || '';
        const username = user.username || '';
        
        return firstName.toLowerCase().includes(search) ||
               lastName.toLowerCase().includes(search) ||
               email.toLowerCase().includes(search) ||
               username.toLowerCase().includes(search);
      });
    }

    if (this.statusFilter) {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }

    if (this.typeFilter) {
      filtered = filtered.filter(user => {
        if (!user.roles || !Array.isArray(user.roles)) return false;
        return user.roles.some((role: IUserRole) => {
          const roleName = role.name || role.displayName || '';
          return roleName.toLowerCase() === this.typeFilter.toLowerCase();
        });
      });
    }

    return filtered;
  }

  public suspendUser(user: IAdminUser): void {
    const userName = this._getDisplayName(user);
    const message = this._i18nService.translate('ADMIN.USERS.CONFIRMATIONS.SUSPEND', { name: userName });
    if (confirm(message)) {
      this._usersService.updateUserStatus(user.id, UserStatus.SUSPENDED)
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            const errorMessage = this._i18nService.translate('ADMIN.USERS.ERRORS.SUSPEND');
            alert(errorMessage);
          }
        });
    }
  }

  public activateUser(user: IAdminUser): void {
    const userName = this._getDisplayName(user);
    const message = this._i18nService.translate('ADMIN.USERS.CONFIRMATIONS.ACTIVATE', { name: userName });
    if (confirm(message)) {
      this._usersService.updateUserStatus(user.id, UserStatus.ACTIVE)
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            const errorMessage = this._i18nService.translate('ADMIN.USERS.ERRORS.ACTIVATE');
            alert(errorMessage);
          }
        });
    }
  }

  public restoreUser(user: IAdminUser): void {
    const userName = this._getDisplayName(user);
    const message = this._i18nService.translate('ADMIN.USERS.CONFIRMATIONS.RESTORE', { name: userName });
    if (confirm(message)) {
      this._usersService.restoreUser(user.id)
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            const errorMessage = this._i18nService.translate('ADMIN.USERS.ERRORS.RESTORE');
            alert(errorMessage);
          }
        });
    }
  }

  public deleteUser(user: IAdminUser): void {
    const userName = this._getDisplayName(user);
    const message = this._i18nService.translate('ADMIN.USERS.CONFIRMATIONS.DELETE', { name: userName });
    if (confirm(message)) {
      this._usersService.deleteUser(user.id)
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            const errorMessage = this._i18nService.translate('ADMIN.USERS.ERRORS.DELETE');
            alert(errorMessage);
          }
        });
    }
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case UserStatus.ACTIVE: return 'text-success-600 bg-success-50';
      case UserStatus.INACTIVE: return 'text-gray-600 bg-gray-50';
      case UserStatus.SUSPENDED: return 'text-danger-600 bg-danger-50';
      case UserStatus.PENDING_VERIFICATION: return 'text-warning-600 bg-warning-50';
      case UserStatus.DELETED: return 'text-gray-400 bg-gray-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  }



  public getInitials(user: IAdminUser): string {
    const firstName = user.profile?.firstName;
    const lastName = user.profile?.lastName;
    
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    
    if (!firstInitial && !lastInitial) {
      return '?';
    }
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  private _getDisplayName(user: IAdminUser): string {
    const firstName = user.profile?.firstName;
    const lastName = user.profile?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else if (user.username) {
      return user.username;
    } else {
      return this._i18nService.translate('ADMIN.USERS.ROLES.USER');
    }
  }

  public getUserRoles(user: IAdminUser): string {
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return this._i18nService.translate('ADMIN.USERS.FALLBACKS.NO_ROLES');
    }
    
    const displayRoles = user.roles.map((role: IUserRole) => {
      const roleName = role.name || role.displayName || '';
      return ROLE_DISPLAY_NAMES[roleName.toLowerCase()] || roleName;
    });
    
    return displayRoles.join(', ');
  }

  public getRolesColor(user: IAdminUser): string {
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'text-gray-600 bg-gray-50';
    }
    
    if (user.roles.some((role: IUserRole) => {
      const roleName = role.name || role.displayName || '';
      return roleName.toLowerCase().includes('admin');
    })) {
      return 'text-primary-600 bg-primary-50';
    }
    
    if (user.roles.some((role: IUserRole) => {
      const roleName = role.name || role.displayName || '';
      return roleName.toLowerCase().includes('business');
    })) {
      return 'text-warning-600 bg-warning-50';
    }
    
    return 'text-success-600 bg-success-50';
  }

  public clearFilters(): void {
    this.loginForm.patchValue({
      searchTerm: '',
      statusFilter: '',
      typeFilter: ''
    });
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this._loadUsers();
  }

  public onSearch(): void {
    this.searchTerm = this.loginForm.get('searchTerm')?.value || '';
    this.currentPage = 1;
    this._loadUsers();
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this._loadUsers();
  }

  public onStatusFilterChange(): void {
    this.statusFilter = this.loginForm.get('statusFilter')?.value || '';
    this.currentPage = 1;
    this._loadUsers();
  }

  public onTypeFilterChange(): void {
    this.typeFilter = this.loginForm.get('typeFilter')?.value || '';
    this.currentPage = 1;
    this._loadUsers();
  }

  public viewUser(user: IAdminUser): void {
    // TODO: Implement view user functionality
    console.log('View user:', user);
  }

  public editUser(user: IAdminUser): void {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
  }
}

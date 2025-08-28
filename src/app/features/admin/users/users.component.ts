import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UsersService } from '../../../core/services/users.service';
import { IUser, UserType, UserStatus } from '../../../models/user.model';
import { IApiFilters } from '../../../models/api.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public users: IUser[] = [];
  public isLoading = true;
  public searchTerm = '';
  public statusFilter = '';
  public typeFilter = '';
  public currentPage = 1;
  public totalPages = 1;
  public totalUsers = 0;
  public limit = 20;
  public loginForm!: FormGroup;

  // Make enums available in template
  public UserStatus = UserStatus;
  public UserType = UserType;

  constructor(
    private _usersService: UsersService,
    private _formBuilder: FormBuilder
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

    // Set initial values
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
          if (response.success && response.data) {
            this.users = response.data.data;
            this.totalPages = response.data.meta.totalPages;
            this.totalUsers = response.data.meta.total;
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  public get filteredUsers(): IUser[] {
    let filtered = this.users;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }

    if (this.typeFilter) {
      filtered = filtered.filter(user => user.type === this.typeFilter);
    }

    return filtered;
  }

  public suspendUser(user: IUser): void {
    if (confirm(`¿Estás seguro de que quieres suspender a ${user.firstName} ${user.lastName}?`)) {
      this._usersService.updateUser(user.id, { status: UserStatus.SUSPENDED })
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            console.error('Error suspending user:', error);
            alert('Error al suspender usuario');
          }
        });
    }
  }

  public activateUser(user: IUser): void {
    if (confirm(`¿Estás seguro de que quieres activar a ${user.firstName} ${user.lastName}?`)) {
      this._usersService.updateUser(user.id, { status: UserStatus.ACTIVE })
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            console.error('Error activating user:', error);
            alert('Error al activar usuario');
          }
        });
    }
  }

  public deleteUser(user: IUser): void {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}? Esta acción no se puede deshacer.`)) {
      this._usersService.deleteUser(user.id)
        .subscribe({
          next: () => {
            this._loadUsers();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            alert('Error al eliminar usuario');
          }
        });
    }
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-success-600 bg-success-50';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50';
      case 'SUSPENDED': return 'text-danger-600 bg-danger-50';
      case 'PENDING_VERIFICATION': return 'text-warning-600 bg-warning-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public getTypeColor(type: string): string {
    switch (type) {
      case 'SYSTEM': return 'text-primary-600 bg-primary-50';
      case 'BUSINESS': return 'text-warning-600 bg-warning-50';
      case 'INDIVIDUAL': return 'text-success-600 bg-success-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  public clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this._loadUsers();
  }

  public onSearch(): void {
    this.currentPage = 1;
    this._loadUsers();
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this._loadUsers();
  }

  public onStatusFilterChange(): void {
    this.currentPage = 1;
    this._loadUsers();
  }

  public onTypeFilterChange(): void {
    this.currentPage = 1;
    this._loadUsers();
  }
}

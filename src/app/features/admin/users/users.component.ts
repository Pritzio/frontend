import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AdminService, User } from '../../../core/services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public users: User[] = [];
  public isLoading = true;
  public searchTerm = '';
  public statusFilter = '';
  public typeFilter = '';

  constructor(private _adminService: AdminService) {}

  ngOnInit(): void {
    this._loadUsers();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadUsers(): void {
    this.isLoading = true;
    this._adminService.users$
      .pipe(takeUntil(this._destroy$))
      .subscribe(users => {
        this.users = users;
        this.isLoading = false;
      });

    this._adminService.getUsers().subscribe();
  }

  public get filteredUsers(): User[] {
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

  public suspendUser(user: User): void {
    if (confirm(`¿Estás seguro de que quieres suspender a ${user.firstName} ${user.lastName}?`)) {
      this._adminService.suspendUser(user.id).subscribe({
        next: () => {
          this._loadUsers();
        },
        error: (error) => {
          console.error('Error suspending user:', error);
          alert('Error al suspender usuario');
        }
      });
    }
  }

  public activateUser(user: User): void {
    if (confirm(`¿Estás seguro de que quieres activar a ${user.firstName} ${user.lastName}?`)) {
      this._adminService.activateUser(user.id).subscribe({
        next: () => {
          this._loadUsers();
        },
        error: (error) => {
          console.error('Error activating user:', error);
          alert('Error al activar usuario');
        }
      });
    }
  }

  public deleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}? Esta acción no se puede deshacer.`)) {
      this._adminService.deleteUser(user.id).subscribe({
        next: () => {
          this._loadUsers();
        },
        error: (error) => {
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
  }
}

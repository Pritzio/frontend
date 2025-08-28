import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  public currentUser: any = null;
  public isSidebarOpen = true;
  public isMobile = false;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._getCurrentUser();
    this._checkScreenSize();
    window.addEventListener('resize', () => this._checkScreenSize());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    window.removeEventListener('resize', () => this._checkScreenSize());
  }

  private _getCurrentUser(): void {
    this._authService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private _checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  public closeSidebar(): void {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  public goToDashboard(): void {
    this._router.navigate(['/dashboard']);
  }

  public logout(): void {
    this._authService.logout();
    this._router.navigate(['/auth/login']);
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  public getUserRole(): string {
    if (!this.currentUser) return 'Usuario';
    
    switch (this.currentUser.type) {
      case 'system': return 'Administrador';
      case 'business': return 'Empresarial';
      case 'individual': return 'Individual';
      default: return 'Usuario';
    }
  }
}

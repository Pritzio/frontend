import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { AdminService, DashboardStats, User, Store, Product, ScrapingStatus } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();

  // Dashboard data
  public dashboardStats: DashboardStats | null = null;
  public recentUsers: User[] = [];
  public recentStores: Store[] = [];
  public recentProducts: Product[] = [];
  public scrapingStatus: ScrapingStatus | null = null;

  // Loading states
  public isLoading = true;
  public isScrapingActionLoading = false;

  // Current user
  public currentUser: any = null;

  constructor(
    private _adminService: AdminService,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._loadInitialData();
    this._getCurrentUser();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadInitialData(): void {
    this.isLoading = true;

    // Load all data in parallel
    combineLatest([
      this._adminService.dashboardStats$,
      this._adminService.users$,
      this._adminService.stores$,
      this._adminService.products$,
      this._adminService.scrapingStatus$
    ]).pipe(
      takeUntil(this._destroy$)
    ).subscribe(([stats, users, stores, products, scraping]) => {
      this.dashboardStats = stats;
      this.recentUsers = users.slice(0, 5); // Last 5 users
      this.recentStores = stores.slice(0, 5); // Last 5 stores
      this.recentProducts = products.slice(0, 5); // Last 5 products
      this.scrapingStatus = scraping;
      this.isLoading = false;
    });

    // Trigger initial data load
    this._adminService.refreshAllData();
  }

  private _getCurrentUser(): void {
    this._authService.currentUser$
      .pipe(takeUntil(this._destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  // Navigation methods
  public navigateToUsers(): void {
    this._router.navigate(['/admin/users']);
  }

  public navigateToStores(): void {
    this._router.navigate(['/admin/stores']);
  }

  public navigateToProducts(): void {
    this._router.navigate(['/admin/products']);
  }

  public navigateToScraping(): void {
    this._router.navigate(['/admin/scraping']);
  }

  // Scraping control methods
  public startScraping(): void {
    this.isScrapingActionLoading = true;
    this._adminService.startScraping()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.isScrapingActionLoading = false;
        },
        error: (error) => {
          console.error('Error starting scraping:', error);
          this.isScrapingActionLoading = false;
        }
      });
  }

  public stopScraping(): void {
    this.isScrapingActionLoading = true;
    this._adminService.stopScraping()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.isScrapingActionLoading = false;
        },
        error: (error) => {
          console.error('Error stopping scraping:', error);
          this.isScrapingActionLoading = false;
        }
      });
  }

  public pauseScraping(): void {
    this.isScrapingActionLoading = true;
    this._adminService.pauseScraping()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.isScrapingActionLoading = false;
        },
        error: (error) => {
          console.error('Error pausing scraping:', error);
          this.isScrapingActionLoading = false;
        }
      });
  }

  // Refresh data
  public refreshData(): void {
    this._adminService.refreshAllData();
  }

  // Utility methods
  public getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-success-600 bg-success-50';
      case 'INACTIVE': return 'text-gray-600 bg-gray-50';
      case 'SUSPENDED': return 'text-danger-600 bg-danger-50';
      case 'PENDING_VERIFICATION': return 'text-warning-600 bg-warning-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public getScrapingStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'text-success-600 bg-success-50';
      case 'PAUSED': return 'text-warning-600 bg-warning-50';
      case 'STOPPED': return 'text-danger-600 bg-danger-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }

  public formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
} 

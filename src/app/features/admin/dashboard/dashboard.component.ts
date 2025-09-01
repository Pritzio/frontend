import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { AdminService, DashboardStats, User, Store, Product } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService, SystemStatistics, UsersByRole, StoresByStatus, ProductsByCategory } from '../../../core/services/statistics.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { StatCardComponent, StatCardData } from '../../../shared/components/stat-card/stat-card.component';
import { DistributionChartComponent, DistributionData } from '../../../shared/components/distribution-chart/distribution-chart.component';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, StatCardComponent, DistributionChartComponent],
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

  // New statistics data
  public systemStatistics: SystemStatistics | null = null;
  public usersByRole: UsersByRole | null = null;
  public storesByStatus: StoresByStatus | null = null;
  public productsByCategory: ProductsByCategory | null = null;

  // Processed data for components
  public statCards: StatCardData[] = [];
  public usersDistribution: DistributionData[] = [];
  public storesDistribution: DistributionData[] = [];
  public productsDistribution: DistributionData[] = [];

  // Loading states
  public isLoading = true;
  public statisticsLoading = false;
  public statisticsError: string | null = null;

  // Current user
  public currentUser: any = null;



  constructor(
    private _adminService: AdminService,
    private _authService: AuthService,
    private _statisticsService: StatisticsService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._loadInitialData();
    this._loadStatistics();
    this._getCurrentUser();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadInitialData(): void {
    this.isLoading = true;
    
    combineLatest([
      this._adminService.users$,
      this._adminService.stores$
    ]).pipe(
      takeUntil(this._destroy$)
    ).subscribe(([users, stores]) => {
      this.recentUsers = users ? users.slice(0, 5) : [];
      this.recentStores = stores ? stores.slice(0, 5) : [];
      this.recentProducts = []; // Empty until products endpoint is implemented
      this.isLoading = false;
    });

    // Trigger initial data load without dashboard stats
    this._adminService.getUsers().subscribe();
    this._adminService.getStores().subscribe();
    // this._adminService.getProducts().subscribe(); // Commented out until endpoint is ready
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



  // Load statistics from new endpoints
  private _loadStatistics(): void {
    this.statisticsLoading = true;
    this.statisticsError = null;

    combineLatest([
      this._statisticsService.systemStatistics$,
      this._statisticsService.usersByRole$,
      this._statisticsService.storesByStatus$,
      this._statisticsService.productsByCategory$,
      this._statisticsService.isLoading$,
      this._statisticsService.error$
    ]).pipe(
      takeUntil(this._destroy$)
    ).subscribe(([systemStats, usersByRole, storesByStatus, productsByCategory, loading, error]) => {
      this.systemStatistics = systemStats;
      this.usersByRole = usersByRole;
      this.storesByStatus = storesByStatus;
      this.productsByCategory = productsByCategory;
      this.statisticsLoading = loading;
      this.statisticsError = error;

      if (systemStats) {
        this._processStatisticsData();
      }
    });

    // Load initial statistics
    this._statisticsService.loadAllStatistics().subscribe();
  }

  private _processStatisticsData(): void {
    if (!this.systemStatistics) return;

    // Process stat cards
    this.statCards = [
      {
        title: 'ADMIN.STATS.TOTAL_USERS',
        value: this.systemStatistics.users.total,
        subtitle: 'ADMIN.STATS.ACTIVE',
        subtitleValue: this.systemStatistics.users.active,
        icon: 'users',
        iconColor: 'primary'
      },
      {
        title: 'ADMIN.STATS.TOTAL_STORES',
        value: this.systemStatistics.stores.total,
        subtitle: 'ADMIN.STATS.VERIFIED',
        subtitleValue: this.systemStatistics.stores.verified,
        icon: 'stores',
        iconColor: 'success'
      },
      {
        title: 'ADMIN.STATS.TOTAL_PRODUCTS',
        value: this.systemStatistics.products.total,
        subtitle: 'ADMIN.STATS.ACTIVE',
        subtitleValue: this.systemStatistics.products.active,
        icon: 'products',
        iconColor: 'warning'
      },
      {
        title: 'ADMIN.STATS.PENDING_VERIFICATION',
        value: this.systemStatistics.users.pendingVerification + this.systemStatistics.stores.pendingVerification,
        subtitle: 'ADMIN.STATS.USERS_AND_STORES',
        subtitleValue: this.systemStatistics.users.pendingVerification,
        icon: 'pending',
        iconColor: 'info'
      }
    ];

    // Process users distribution
    this.usersDistribution = [
      {
        label: 'ADMIN.STATS.ACTIVE_USERS',
        value: this.systemStatistics.users.active,
        color: '#10b981'
      },
      {
        label: 'ADMIN.STATS.INACTIVE_USERS',
        value: this.systemStatistics.users.inactive,
        color: '#6b7280'
      },
      {
        label: 'ADMIN.STATS.PENDING_USERS',
        value: this.systemStatistics.users.pendingVerification,
        color: '#f59e0b'
      },
      {
        label: 'ADMIN.STATS.SUSPENDED_USERS',
        value: this.systemStatistics.users.suspended,
        color: '#ef4444'
      }
    ];

    // Process stores distribution
    this.storesDistribution = [
      {
        label: 'ADMIN.STATS.VERIFIED_STORES',
        value: this.systemStatistics.stores.verified,
        color: '#10b981'
      },
      {
        label: 'ADMIN.STATS.PENDING_STORES',
        value: this.systemStatistics.stores.pendingVerification,
        color: '#f59e0b'
      },
      {
        label: 'ADMIN.STATS.SUSPENDED_STORES',
        value: this.systemStatistics.stores.suspended,
        color: '#ef4444'
      }
    ];

    // Process products distribution
    this.productsDistribution = [
      {
        label: 'ADMIN.STATS.ACTIVE_PRODUCTS',
        value: this.systemStatistics.products.active,
        color: '#10b981'
      },
      {
        label: 'ADMIN.STATS.INACTIVE_PRODUCTS',
        value: this.systemStatistics.products.inactive,
        color: '#6b7280'
      }
    ];
  }

  // Refresh data
  public refreshData(): void {
    this._adminService.getUsers().subscribe();
    this._adminService.getStores().subscribe();
    // this._adminService.getProducts().subscribe(); // Commented out until endpoint is ready
    this._statisticsService.refreshStatistics();
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

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { 
  IStoreProduct
} from '../../../../../models/store-product.model';

@Component({
  selector: 'app-store-products-analytics',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './store-products-analytics.component.html',
  styleUrls: []
})
export class StoreProductsAnalyticsComponent implements OnInit, OnDestroy {
  
  // Public properties
  public analytics: any = null;
  public isLoading = false;
  public error: string | null = null;
  
  // No enums needed for v2.0 simplified API
  
  // Translation method
  public translate(key: string): string {
    if (!key) return '';
    let result = key.split('.').pop() || key;
    result = result.replace(/_/g, ' ').toLowerCase();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  }
  
  // Private properties
  private _destroy$ = new Subject<void>();
  
  constructor(@Inject(StoreProductsService) private _storeProductsService: StoreProductsService) {}
  
  ngOnInit(): void {
    this.loadAnalytics();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Refresh analytics data
   */
  public refreshAnalytics(): void {
    this.loadAnalytics();
  }
  
  /**
   * Get products by type as array
   */
  public getProductsByScrapingStatusArray(): Array<{scrapingStatus: string, count: number}> {
    if (!this.analytics?.productsByScrapingStatus) return [];
    
    return Object.entries(this.analytics.productsByScrapingStatus).map(([scrapingStatus, count]) => ({
      scrapingStatus,
      count: count as number
    }));
  }
  
  /**
   * Get products by category as array
   */
  public getProductsByAvailabilityArray(): Array<{availability: string, count: number}> {
    if (!this.analytics?.productsByAvailability) return [];
    
    return Object.entries(this.analytics.productsByAvailability).map(([availability, count]) => ({
      availability,
      count: count as number
    }));
  }
  
  /**
   * Get products by status as array
   */
  public getProductsByStatusArray(): Array<{status: string, count: number}> {
    if (!this.analytics?.productsByStatus) return [];
    
    return Object.entries(this.analytics.productsByStatus).map(([status, count]) => ({
      status: status as string,
      count: count as number
    }));
  }
  
  /**
   * Get type badge class
   */
  public getAvailabilityBadgeClass(availability: string): string {
    switch (availability) {
      case 'in_stock':
        return 'badge-success';
      case 'out_of_stock':
        return 'badge-danger';
      case 'low_stock':
        return 'badge-warning';
      case 'pre_order':
        return 'badge-info';
      case 'backorder':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
  }
  
  /**
   * Get status badge class
   */
  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'inactive':
        return 'badge-warning';
      case 'discontinued':
        return 'badge-danger';
      case 'out_of_stock':
        return 'badge-info';
      case 'coming_soon':
        return 'badge-primary';
      case 'error':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
  
  /**
   * Calculate percentage
   */
  public getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }
  
  // ===== Private Methods =====
  
  public loadAnalytics(): void {
    this.isLoading = true;
    this.error = null;
    
    // Note: getAnalytics method doesn't exist in API v2.0, using getAll as fallback
    this._storeProductsService.getAll({}).subscribe({
      next: (response: any) => {
        if (response) {
          // Create mock analytics data from the response
          this.analytics = {
            totalProducts: Array.isArray(response) ? response.length : (response.data?.length || 0),
            lastUpdated: new Date().toISOString()
          };
        } else {
          this.error = 'Error loading analytics data';
        }
      },
      error: (error: any) => {
        this.error = 'Error loading analytics data';
        console.error('Error loading analytics:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}



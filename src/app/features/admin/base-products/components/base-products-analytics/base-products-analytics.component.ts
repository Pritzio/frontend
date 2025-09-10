import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { 
  IBaseProductAnalytics
} from '../../../../../models/base-product.model';

@Component({
  selector: 'app-base-products-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-products-analytics.component.html',
  styleUrls: []
})
export class BaseProductsAnalyticsComponent implements OnInit, OnDestroy {
  
  // Public properties
  public analytics: IBaseProductAnalytics | null = null;
  public isLoading = false;
  public error: string | null = null;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  
  constructor(@Inject(BaseProductsService) private _baseProductsService: BaseProductsService) {}
  
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
   * Get products by brand as array
   */
  public getProductsByBrandArray(): Array<{brand: string, count: number}> {
    if (!this.analytics?.productsByBrand) return [];
    
    return Object.entries(this.analytics.productsByBrand).map(([brand, count]) => ({
      brand,
      count: count as number
    }));
  }
  
  /**
   * Get products by category as array
   */
  public getProductsByCategoryArray(): Array<{category: string, count: number}> {
    if (!this.analytics?.productsByCategory) return [];
    
    return Object.entries(this.analytics.productsByCategory).map(([category, count]) => ({
      category,
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
    
    this._baseProductsService.getAnalytics().subscribe({
      next: (response) => {
        if (response) {
          this.analytics = response;
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

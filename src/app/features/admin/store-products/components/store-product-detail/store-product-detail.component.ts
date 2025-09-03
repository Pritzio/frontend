import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';

import { 
  IStoreProduct
} from '../../../../../models/store-product.model';

@Component({
  selector: 'app-store-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store-product-detail.component.html',
  styleUrls: []
})
export class StoreProductDetailComponent implements OnInit, OnDestroy {
  
  // Public properties
  public storeProduct: IStoreProduct | null = null;
  public isLoading = false;
  public error: string | null = null;
  
  // Enums for template - removed as they are not used in API v2.0
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _storeProductId: string | null = null;
  
  constructor(
    @Inject(StoreProductsService) private _storeProductsService: StoreProductsService,
    private _route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this._setupRouteParams();
    this._loadProduct();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Change storeProduct status
   */
  public changeStatus(status: string): void {
    if (!this.storeProduct) return;
    
    // Note: API v2.0 doesn't have status updates, this is a placeholder
    console.log('Status change requested:', status);
  }
  
  /**
   * Delete storeProduct
   */
  public deleteStoreProduct(): void {
    if (!this.storeProduct) return;
    
    if (confirm(`Are you sure you want to delete "${this.storeProduct.name}"?`)) {
      this._storeProductsService.delete(this.storeProduct!.id).subscribe({
        next: () => {
          // Navigate back to storeProducts list
          window.history.back();
        },
        error: (error: any) => {
          console.error('Error deleting storeProduct:', error);
        }
      });
    }
  }
  
  /**
   * Get status badge class
   */
  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'discontinued':
        return 'bg-red-100 text-red-800';
      case 'out_of_stock':
        return 'bg-blue-100 text-blue-800';
      case 'coming_soon':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  /**
   * Get type badge class
   */
  public getAvailabilityBadgeClass(availability: string): string {
    switch (availability) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'pre_order':
        return 'bg-blue-100 text-blue-800';
      case 'backorder':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get priority badge class
   */
  public getScrapingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }


  
  /**
   * Format date for display
   */
  public formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Get specifications as array (filtered and formatted)
   */
  public getSpecificationsArray(): Array<{key: string, value: any}> {
    if (!this.storeProduct?.metadata) return [];
    
    // Fields to exclude from display
    const excludeFields = ['originalData', 'highResImageUrl', 'imageUrl'];
    
    return Object.entries(this.storeProduct.metadata)
      .filter(([key]) => !excludeFields.includes(key))
      .map(([key, value]) => ({
        key: this.formatFieldName(key),
        value: this.formatFieldValue(key, value)
      }));
  }

  /**
   * Format field names for display
   */
  private formatFieldName(key: string): string {
    const fieldNames: {[key: string]: string} = {
      'ppum': 'Precio por Unidad de Medida',
      'brand': 'Marca',
      'rating': 'Calificación',
      'categories': 'Categorías',
      'ratingText': 'Calificación (Texto)',
      'originalPrice': 'Precio Original'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Format field values for display
   */
  private formatFieldValue(key: string, value: any): any {
    if (key === 'ppum' && typeof value === 'string') {
      // Format PPUM to be more readable
      return value.split('$').filter((item: string) => item.trim()).map((item: string) => `$${item.trim()}`).join(', ');
    }
    
    if (key === 'categories' && Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (key === 'rating' && typeof value === 'number') {
      return `${value}/5 ⭐`;
    }
    
    if (key === 'originalPrice' && typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    
    return value;
  }
  
  /**
   * Check if storeProduct has specifications
   */
  public hasSpecifications(): boolean {
    if (!this.storeProduct) return false;
    
    return !!(this.storeProduct.metadata && Object.keys(this.storeProduct.metadata).length > 0);
  }
  
  /**
   * Get formatted price
   */
  public getFormattedPrice(price?: number): string {
    if (!price) return '-';
    
    return `${price} ${this.storeProduct?.metadata?.['currency'] || 'USD'}`;
  }
  
  /**
   * Get formatted stock
   */
  public getFormattedStock(): string {
    if (!this.storeProduct?.metadata?.['stockQuantity']) return '-';
    
    return `${this.storeProduct.metadata['stockQuantity']} units`;
  }
  
  /**
   * Reload storeProduct data
   */
  public reloadProduct(): void {
    this._loadProduct();
  }

  /**
   * Get the best available product image
   */
  public getProductImage(): string | null {
    if (!this.storeProduct) return null;
    
    // Try high resolution image from metadata first
    const highResImage = this.storeProduct.metadata?.['highResImageUrl'];
    if (highResImage && highResImage.trim() !== '') {
      return highResImage;
    }
    
    // Try high resolution image from originalData
    const originalHighResImage = this.storeProduct.metadata?.['originalData']?.['highResImageUrl'];
    if (originalHighResImage && originalHighResImage.trim() !== '') {
      return originalHighResImage;
    }
    
    // Fallback to regular image
    if (this.storeProduct.image && this.storeProduct.image.trim() !== '') {
      return this.storeProduct.image;
    }
    
    return null;
  }

  /**
   * Handle image loading errors
   */
  public onImageError(event: any): void {
    // Hide the image if it fails to load
    event.target.style.display = 'none';
  }


  
  // ===== Private Methods =====
  
  private _setupRouteParams(): void {
    this._route.params.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      this._storeProductId = params['id'];
    });
  }
  
  private _loadProduct(): void {
    if (!this._storeProductId) {
      this.error = 'Product ID not provided';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    this._storeProductsService.getById(this._storeProductId!).subscribe({
      next: (response) => {
        if (response) {
          this.storeProduct = response;
        } else {
          this.error = 'Product not found';
        }
      },
      error: (error: any) => {
        this.error = 'Error loading storeProduct';
        console.error('Error loading storeProduct:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}









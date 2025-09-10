import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';
import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { ProductSimilarityService, SimilarityResult } from '../../../../../core/services/product-similarity.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { PriceFormatPipe } from '../../../../../shared/pipes/price-format.pipe';
import { DateFormatPipe } from '../../../../../shared/pipes/date-format.pipe';

import { 
  IStoreProduct
} from '../../../../../models/store-product.model';
import { IBaseProduct } from '../../../../../models/base-product.model';

@Component({
  selector: 'app-store-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PriceFormatPipe, DateFormatPipe],
  templateUrl: './store-product-detail.component.html',
  styleUrls: []
})
export class StoreProductDetailComponent implements OnInit, OnDestroy {
  
  // Public properties
  public storeProduct: IStoreProduct | null = null;
  public isLoading = false;
  public error: string | null = null;
  
  // Base product association properties
  public associatedBaseProduct: IBaseProduct | null = null;
  public showBaseProductModal = false;
  public availableBaseProducts: IBaseProduct[] = [];
  public selectedBaseProduct: IBaseProduct | null = null;
  public baseProductSearchQuery = '';
  public isLoadingBaseProducts = false;
  public suggestedBaseProduct: SimilarityResult | null = null;
  public suggestedBaseProducts: SimilarityResult[] = [];
  public isLoadingSuggestion = false;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _storeProductId: string | null = null;
  private _searchSubject = new Subject<string>();
  
  constructor(
    @Inject(StoreProductsService) private _storeProductsService: StoreProductsService,
    private _baseProductsService: BaseProductsService,
    private _productSimilarityService: ProductSimilarityService,
    private _alertService: AlertService,
    private _route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this._setupRouteParams();
    this._loadProduct();
    this._setupSearchDebounce();
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
    const excludeFields = ['originalData', 'highResImageUrl', 'imageUrl', 'matchedBaseProduct', 'MatchedBaseProduct'];
    
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
    
    // Handle object values to prevent [object Object] display
    if (typeof value === 'object' && value !== null) {
      if (key === 'matchedBaseProduct' || key === 'MatchedBaseProduct') {
        // Special handling for base product objects
        if (value.name) {
          return `${value.name} (ID: ${value.id || 'N/A'})`;
        }
        return 'Producto base asociado';
      }
      
      // For other objects, try to extract meaningful information
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.id) return `ID: ${value.id}`;
      
      // If it's an array, join it
      if (Array.isArray(value)) {
        return value.map(item => typeof item === 'object' ? item.name || item.title || JSON.stringify(item) : item).join(', ');
      }
      
      // Last resort: return a generic message
      return 'Objeto complejo';
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

  /**
   * Get base product image
   */
  public getBaseProductImage(baseProduct: IBaseProduct): string | null {
    if (!baseProduct) return null;
    
    // Try to get image from specifications first
    if (baseProduct.specifications?.originalData?.highResImageUrl) {
      return baseProduct.specifications.originalData.highResImageUrl;
    }
    
    // Fallback to direct image property
    return baseProduct.image;
  }

  /**
   * Open base product selection modal
   */
  public openBaseProductModal(): void {
    this.showBaseProductModal = true;
    this.selectedBaseProduct = null;
    this.baseProductSearchQuery = '';
    this.suggestedBaseProduct = null;
    this._loadSuggestedBaseProduct();
    this._loadBaseProducts();
  }

  /**
   * Close base product selection modal
   */
  public closeBaseProductModal(): void {
    this.showBaseProductModal = false;
    this.selectedBaseProduct = null;
    this.baseProductSearchQuery = '';
    this.availableBaseProducts = [];
    this.suggestedBaseProduct = null;
    this.suggestedBaseProducts = [];
  }

  /**
   * Select a base product
   */
  public selectBaseProduct(baseProduct: IBaseProduct): void {
    this.selectedBaseProduct = baseProduct;
  }

  /**
   * Associate selected base product
   */
  public async associateBaseProduct(): Promise<void> {
    if (!this.selectedBaseProduct || !this.storeProduct) return;

    const confirmed = await this._alertService.confirm(
      `¿Está seguro de asociar "${this.storeProduct.name}" con "${this.selectedBaseProduct.name}"?`,
      'Confirmar Asociación',
      'Sí, asociar',
      'Cancelar'
    );

    if (confirmed) {
      this._alertService.loading('Asociando producto...');

      // Update the store product with the baseProductId
      const updateData = {
        baseProductId: this.selectedBaseProduct!.id
      };

      this._storeProductsService.update(this.storeProduct!.id, updateData).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success('Producto asociado exitosamente');
          this.associatedBaseProduct = this.selectedBaseProduct;
          this.closeBaseProductModal();
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error associating product:', error);
          this._alertService.error('Error al asociar el producto. Intente nuevamente.');
        }
      });
    }
  }

  /**
   * Disassociate base product
   */
  public async disassociateBaseProduct(): Promise<void> {
    if (!this.associatedBaseProduct || !this.storeProduct) return;

    const confirmed = await this._alertService.confirm(
      `¿Está seguro de desasociar "${this.storeProduct.name}" de "${this.associatedBaseProduct.name}"?`,
      'Confirmar Desasociación',
      'Sí, desasociar',
      'Cancelar'
    );

    if (confirmed) {
      this._alertService.loading('Desasociando producto...');

      // Update the store product to remove the baseProductId
      const updateData = {
        baseProductId: null
      };

      this._storeProductsService.update(this.storeProduct!.id, updateData).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success('Producto desasociado exitosamente');
          this.associatedBaseProduct = null;
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error disassociating product:', error);
          this._alertService.error('Error al desasociar el producto. Intente nuevamente.');
        }
      });
    }
  }

  /**
   * Handle base product search
   */
  public onBaseProductSearch(): void {
    this._searchSubject.next(this.baseProductSearchQuery);
  }

  /**
   * Load suggested base product
   */
  private _loadSuggestedBaseProduct(): void {
    if (!this.storeProduct) return;

    this.isLoadingSuggestion = true;
    
    this._productSimilarityService.getSuggestedBaseProducts(this.storeProduct).subscribe({
      next: (suggestions) => {
        this.suggestedBaseProducts = suggestions;
        this.suggestedBaseProduct = suggestions.length > 0 ? suggestions[0] : null;
        this.isLoadingSuggestion = false;
      },
      error: (error) => {
        console.error('Error loading suggested base products:', error);
        this.isLoadingSuggestion = false;
      }
    });
  }

  /**
   * Use suggested base product
   */
  public useSuggestedBaseProduct(suggestion?: SimilarityResult): void {
    const selectedSuggestion = suggestion || this.suggestedBaseProduct;
    if (selectedSuggestion) {
      // Convert SimilarityResult to IBaseProduct format
      this.selectedBaseProduct = {
        id: selectedSuggestion.id,
        name: selectedSuggestion.name,
        brand: selectedSuggestion.brand,
        image: selectedSuggestion.image,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as IBaseProduct;
    }
  }

  /**
   * Get similarity badge class
   */
  public getSimilarityBadgeClass(confidence: 'high' | 'medium' | 'low'): string {
    return this._productSimilarityService.getSimilarityBadgeClass(confidence);
  }

  /**
   * Get similarity icon
   */
  public getSimilarityIcon(confidence: 'high' | 'medium' | 'low'): string {
    return this._productSimilarityService.getSimilarityIcon(confidence);
  }

  /**
   * Format similarity percentage
   */
  public formatSimilarityPercentage(similarity: number): string {
    return this._productSimilarityService.formatSimilarityPercentage(similarity);
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
          this._loadAssociatedBaseProduct();
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

  private _loadAssociatedBaseProduct(): void {
    if (!this.storeProduct) return;

    // Check if store product has a baseProductId
    if (this.storeProduct.baseProductId) {
      this._loadBaseProductById(this.storeProduct.baseProductId);
    } else {
      this.associatedBaseProduct = null;
    }
  }

  private _loadBaseProductById(baseProductId: string): void {
    this._baseProductsService.getById(baseProductId).subscribe({
      next: (baseProduct) => {
        this.associatedBaseProduct = baseProduct;
      },
      error: (error) => {
        // If it's a 404 error, show that there's an association but the base product is not found
        if (error.status === 404) {
          this.associatedBaseProduct = {
            id: baseProductId,
            name: 'Producto base no encontrado',
            description: 'El producto base asociado no está disponible en el sistema',
            isNotFound: true
          } as IBaseProduct & { isNotFound: boolean };
        } else {
          this.associatedBaseProduct = null;
        }
      }
    });
  }

  isBaseProductNotFound(): boolean {
    return this.associatedBaseProduct && (this.associatedBaseProduct as any).isNotFound;
  }

  private _setupSearchDebounce(): void {
    this._searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this._loadBaseProducts();
    });
  }

  private _loadBaseProducts(): void {
    this.isLoadingBaseProducts = true;
    
    const searchQuery = this.baseProductSearchQuery.trim();
    const filters = searchQuery ? { search: searchQuery } : {};
    
    this._baseProductsService.getAll(filters).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.availableBaseProducts = response.data;
        } else {
          this.availableBaseProducts = [];
        }
      },
      error: (error: any) => {
        console.error('Error loading base products:', error);
        this.availableBaseProducts = [];
      },
      complete: () => {
        this.isLoadingBaseProducts = false;
      }
    });
  }

  /**
   * Get suggested base product image
   */
  public getSuggestedBaseProductImage(): string | null {
    return this.suggestedBaseProduct?.image || null;
  }

  /**
   * Get suggested base product brand
   */
  public getSuggestedBaseProductBrand(): string {
    return this.suggestedBaseProduct?.brand || 'Sin marca';
  }
}









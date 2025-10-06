import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';
import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { ProductSimilarityService, SimilarityResult } from '../../../../../core/services/product-similarity.service';
import { StoresService } from '../../../../../core/services/stores.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { I18nService } from '../../../../../core/services/i18n.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { PriceFormatPipe } from '../../../../../shared/pipes/price-format.pipe';
import { 
  IStoreProduct, 
  IStoreProductFilters
} from '../../../../../models/store-product.model';
import { IBaseProduct } from '../../../../../models/base-product.model';
import { IStore } from '../../../../../models/store.model';
import { IPaginatedResponse } from '../../../../../models/api.model';

@Component({
  selector: 'app-store-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe, PriceFormatPipe],
  templateUrl: './store-products-list.component.html',
  styleUrls: []
})
export class StoreProductsListComponent implements OnInit, OnDestroy {
  
  // Public properties
  public storeProducts: IStoreProduct[] = [];
  public isLoading = false;
  public error: string | null = null;
  public selectedStoreProducts: string[] = [];
  public showFilters = false;
  public availableStores: IStore[] = [];
  public isLoadingStores: boolean = true;
  
  // Association modal properties
  public showAssociationModal = false;
  public selectedStoreProduct: IStoreProduct | null = null;
  public availableBaseProducts: IBaseProduct[] = [];
  public selectedBaseProduct: IBaseProduct | null = null;
  public baseProductSearchQuery = '';
  public isLoadingBaseProducts = false;
  public suggestedBaseProduct: SimilarityResult | null = null;
  public suggestedBaseProducts: SimilarityResult[] = [];
  public isLoadingSuggestion = false;
  
  // Pagination
  public currentPage = 1;
  public totalPages = 1;
  public totalItems = 0;
  public itemsPerPage = 20;
  public hasNext = false;
  public hasPrev = false;
  
  // Filters form
  public filtersForm: FormGroup;
  
  // No enums needed for v2.0 simplified API
  
  // Math for template
  public Math = Math;
  

  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();
  
  constructor(
    private _storeProductsService: StoreProductsService,
    private _baseProductsService: BaseProductsService,
    private _productSimilarityService: ProductSimilarityService,
    private _storesService: StoresService,
    private _alertService: AlertService,
    private _i18nService: I18nService,
    private _formBuilder: FormBuilder
  ) {
    this.filtersForm = this._createFiltersForm();
    this._setupSearchDebounce();
  }
  
  ngOnInit(): void {
    this._loadProducts();
    this._loadStores();
    this._setupFormSubscriptions();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Load products with current filters
   */
  public loadProducts(): void {
    this._loadProducts();
  }

  /**
   * Toggle product selection
   */
  public toggleStoreProductSelection(storeProductId: string): void {
    const index = this.selectedStoreProducts.indexOf(storeProductId);
    if (index > -1) {
      this.selectedStoreProducts.splice(index, 1);
    } else {
      this.selectedStoreProducts.push(storeProductId);
    }
  }
  
  /**
   * Select all products on current page
   */
  public selectAllStoreProducts(): void {
    this.selectedStoreProducts = [...this.storeProducts.map(p => p.id)];
  }
  
  /**
   * Clear all selections
   */
  public clearSelection(): void {
    this.selectedStoreProducts = [];
  }
  
  /**
   * Toggle filters visibility
   */
  public toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.filtersForm.reset();
    this.currentPage = 1;
    this._loadProducts();
  }
  
  /**
   * Apply filters
   */
  public applyFilters(): void {
    this.currentPage = 1;
    this._loadProducts();
  }
  
  /**
   * Go to specific page
   */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this._loadProducts();
    }
  }
  
  /**
   * Change items per page
   */
  public changeItemsPerPage(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this._loadProducts();
  }
  
  /**
   * Delete a product
   */
  public async deleteStoreProduct(storeProductId: string): Promise<void> {
    const product = this.storeProducts.find(p => p.id === storeProductId);
    const productName = product?.name || 'este producto';
    
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación',
      'Sí, eliminar',
      this._i18nService.translate('BASE_PRODUCTS.CANCEL')
    );
    
    if (confirmed) {
      this._alertService.loading('Eliminando producto...');
      
      this._storeProductsService.delete(storeProductId).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success(this._i18nService.translate('BASE_PRODUCTS.SUCCESS.PRODUCT_DELETED'));
          this._loadProducts();
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error deleting product:', error);
          this._alertService.error('Error al eliminar el producto. Intente nuevamente.');
        }
      });
    }
  }

  /**
   * Open association modal
   */
  public openAssociationModal(storeProduct: IStoreProduct): void {
    this.selectedStoreProduct = storeProduct;
    this.showAssociationModal = true;
    this.selectedBaseProduct = null;
    this.baseProductSearchQuery = '';
    this.suggestedBaseProduct = null;
    this._loadSuggestedBaseProduct();
    this._loadAvailableBaseProducts();
  }

  /**
   * Close association modal
   */
  public closeAssociationModal(): void {
    this.showAssociationModal = false;
    this.selectedStoreProduct = null;
    this.selectedBaseProduct = null;
    this.availableBaseProducts = [];
    this.baseProductSearchQuery = '';
    this.suggestedBaseProduct = null;
    this.suggestedBaseProducts = [];
  }

  /**
   * Load suggested base product
   */
  private _loadSuggestedBaseProduct(): void {
    if (!this.selectedStoreProduct) return;

    this.isLoadingSuggestion = true;
    
    this._productSimilarityService.getSuggestedBaseProducts(this.selectedStoreProduct).subscribe({
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
   * Load available base products
   */
  private _loadAvailableBaseProducts(): void {
    this.isLoadingBaseProducts = true;
    const filters: any = { 
      limit: 50, 
      isActive: true 
    };
    
    if (this.baseProductSearchQuery) {
      filters.search = this.baseProductSearchQuery;
    }
    
    this._baseProductsService.getAll(filters).subscribe({
      next: (response) => {
        this.availableBaseProducts = response.data || [];
        this.isLoadingBaseProducts = false;
      },
      error: (error) => {
        console.error('Error loading base products:', error);
        this._alertService.error(this._i18nService.translate('BASE_PRODUCTS.ERRORS.LOAD_PRODUCTS'));
        this.isLoadingBaseProducts = false;
      }
    });
  }

  /**
   * Search base products
   */
  public onBaseProductSearch(): void {
    this._loadAvailableBaseProducts();
  }

  /**
   * Select base product
   */
  public selectBaseProduct(baseProduct: IBaseProduct): void {
    this.selectedBaseProduct = baseProduct;
  }

  /**
   * Associate store product to base product
   */
  public associateToBaseProduct(): void {
    if (!this.selectedStoreProduct || !this.selectedBaseProduct) return;

    this._baseProductsService.associateStoreProduct(this.selectedStoreProduct.id, this.selectedBaseProduct.id).subscribe({
      next: () => {
        this._alertService.success(this._i18nService.translate('BASE_PRODUCTS.SUCCESS.PRODUCT_ASSOCIATED'));
        this._loadProducts(); // Refresh the list to update association status
        this.closeAssociationModal();
      },
      error: (error) => {
        console.error('Error associating store product:', error);
        this._alertService.error(this._i18nService.translate('BASE_PRODUCTS.ERRORS.LOAD_PRODUCTS'));
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
    return this.suggestedBaseProduct?.brand || this._i18nService.translate('BASE_PRODUCTS.STATUS_VALUES.NO_BRAND');
  }

  /**
   * Get base product image
   */
  public getBaseProductImage(baseProduct: IBaseProduct): string | null {
    if (baseProduct.specifications?.originalData?.highResImageUrl) {
      return baseProduct.specifications.originalData.highResImageUrl;
    }
    
    if (baseProduct.image) {
      return baseProduct.image;
    }
    
    return null;
  }

  /**
   * Get association status class
   */
  public getAssociationStatusClass(storeProduct: IStoreProduct): string {
    if (storeProduct.baseProductId) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get association status icon
   */
  public getAssociationStatusIcon(storeProduct: IStoreProduct): string {
    if (storeProduct.baseProductId) {
      return 'icon-link';
    } else {
      return 'icon-unlink';
    }
  }

  /**
   * Get association status text
   */
  public getAssociationStatusText(storeProduct: IStoreProduct): string {
    if (storeProduct.baseProductId) {
      return this._i18nService.translate('BASE_PRODUCTS.STATUS_VALUES.ASSOCIATED');
    } else {
      return this._i18nService.translate('BASE_PRODUCTS.STATUS_VALUES.NOT_ASSOCIATED');
    }
  }
  
  /**
   * Track by function for ngFor
   */
  public trackByStoreProductId(index: number, storeProduct: IStoreProduct): string {
    return storeProduct.id;
  }
  
  /**
   * Toggle select all products
   */
  public toggleSelectAll(): void {
    if (this.selectedStoreProducts.length === this.storeProducts.length && this.storeProducts.length > 0) {
      this.clearSelection();
    } else {
      this.selectAllStoreProducts();
    }
  }
  
  /**
   * Handle items per page change
   */
  public onItemsPerPageChange(): void {
    this.changeItemsPerPage(this.itemsPerPage);
  }
  
  /**
   * Get page numbers for pagination
   */
  public getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  

  
  // ===== Private Methods =====
  
  private _createFiltersForm(): FormGroup {
    return this._formBuilder.group({
      search: [''],
      storeId: [''],
      createdBy: [''],
      dateFrom: [''],
      dateTo: [''],
      unassociated: [false]
    });
  }
  
  private _setupSearchDebounce(): void {
    this._searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this._loadProducts();
    });
  }
  
  private _setupFormSubscriptions(): void {
    // Subscribe to search field changes
    this.filtersForm.get('search')?.valueChanges.pipe(
      takeUntil(this._destroy$)
    ).subscribe(value => {
      this._searchSubject.next(value);
    });
    
    // Subscribe to other filter changes
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this._loadProducts();
    });
  }
  
  private _loadStores(): void {
    this.isLoadingStores = true;
    
    this._storesService.getStores({ limit: 100 }).subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.availableStores = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          this.availableStores = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          this.availableStores = response.data;
        } else {
          this._loadStoresFromProducts();
          return;
        }
        
        this.isLoadingStores = false;
      },
      error: () => {
        this._loadStoresFromProducts();
      }
    });
  }

  private _loadStoresFromProducts(): void {
    this._storeProductsService.getAll({ limit: 200 }).subscribe({
      next: (response) => {
        if (response && response.data) {
          const storesMap = new Map();
          
          response.data.forEach((product) => {
            if (product.store && product.store.id) {
              storesMap.set(product.store.id, {
                id: product.store.id,
                name: product.store.name || product.store.displayName,
                displayName: product.store.displayName || product.store.name,
                website: product.store.website,
                isVerified: product.store.isVerified
              });
            }
          });
          
          this.availableStores = Array.from(storesMap.values());
        } else {
          this.availableStores = [];
        }
        
        this.isLoadingStores = false;
      },
      error: () => {
        this.availableStores = [];
        this.isLoadingStores = false;
      }
    });
  }


  private _loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const formFilters = this._getFormFilters();
    
    const filters: IStoreProductFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...formFilters
    };
    
    const isUnassociatedFilter = filters.unassociated;
    const backendFilters = { ...filters };
    
    if (isUnassociatedFilter) {
      delete backendFilters.unassociated;
    }
    
    const serviceCall = isUnassociatedFilter 
      ? this._storeProductsService.getUnassociated(backendFilters)
      : this._storeProductsService.getAll(backendFilters);
    
    serviceCall.subscribe({
      next: (response: any) => {
        if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            this.storeProducts = response.data;
            this.totalItems = response.total || response.data.length;
            this.totalPages = Math.ceil(this.totalItems / (response.limit || this.itemsPerPage));
            this.hasNext = (response.page || 1) < this.totalPages;
            this.hasPrev = (response.page || 1) > 1;
          } 
          else if (Array.isArray(response)) {
            this.storeProducts = response;
            this.totalItems = response.length;
            this.totalPages = 1;
            this.hasNext = false;
            this.hasPrev = false;
          }
          else if (response.data && Array.isArray(response.data)) {
            this.storeProducts = response.data as IStoreProduct[];
            this.totalItems = response.total || (response.data as IStoreProduct[]).length;
            this.totalPages = Math.ceil(this.totalItems / (response.limit || this.itemsPerPage));
            this.hasNext = (response.page || 1) < this.totalPages;
            this.hasPrev = (response.page || 1) > 1;
          }
          else {
            this.storeProducts = [];
            this.totalItems = 0;
            this.totalPages = 1;
            this.hasNext = false;
            this.hasPrev = false;
          }
        } else {
          this.storeProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.hasNext = false;
          this.hasPrev = false;
        }
        
        // Apply client-side filtering for unassociated products if needed
        if (isUnassociatedFilter) {
          this.storeProducts = this.storeProducts.filter(product => !product.baseProductId);
          this.totalItems = this.storeProducts.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.hasNext = this.currentPage < this.totalPages;
          this.hasPrev = this.currentPage > 1;
        }
      },
      error: (error: any) => {
        console.error('Error loading store products:', error);
        
        if (error.status === 404) {
          this.error = 'PRODUCTS.ENDPOINT_NOT_AVAILABLE';
        } else if (error.status === 401) {
          this.error = 'PRODUCTS.AUTHENTICATION_REQUIRED';
        } else if (error.status === 403) {
          this.error = 'PRODUCTS.INSUFFICIENT_PERMISSIONS';
        } else if (error.status === 0) {
          this.error = 'PRODUCTS.NETWORK_ERROR';
        } else {
          this.error = 'PRODUCTS.GENERAL_ERROR';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  private _getFormFilters(): Partial<IStoreProductFilters> {
    const formValue = this.filtersForm.value;
    const filters: Partial<IStoreProductFilters> = {};
    
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'dateFrom' || key === 'dateTo') {
          (filters as any)[key] = new Date(value);
        } else {
          filters[key as keyof IStoreProductFilters] = value;
        }
      }
    });
    
    if (formValue.unassociated === true) {
      filters.unassociated = true;
    }

    return filters;
  }

  /**
   * Check if a date is valid for display
   */
  public isValidDate(date: any): boolean {
    return date && !isNaN(new Date(date).getTime());
  }

  /**
   * Check if a store product has promotional price in metadata
   */
  public hasPromotionalPrice(storeProduct: IStoreProduct): boolean {
    return !!(storeProduct.metadata?.['originalData']?.['promotions']?.['price']);
  }

  /**
   * Get promotional price from metadata
   */
  public getPromotionalPrice(storeProduct: IStoreProduct): string {
    const promotionalPrice = storeProduct.metadata?.['originalData']?.['promotions']?.['price'];
    return promotionalPrice || '';
  }

  /**
   * Check if a store product is out of stock from metadata
   */
  public isOutOfStock(storeProduct: IStoreProduct): boolean {
    return !!(storeProduct.metadata?.['is_out_of_stock']);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { StoreProductsService } from '../../../../../core/services/store-products.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { PriceFormatPipe } from '../../../../../shared/pipes/price-format.pipe';
import { 
  IStoreProduct, 
  IStoreProductFilters
} from '../../../../../models/store-product.model';
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
    private _alertService: AlertService,
    private _formBuilder: FormBuilder
  ) {
    this.filtersForm = this._createFiltersForm();
    this._setupSearchDebounce();
  }
  
  ngOnInit(): void {
    this._loadProducts();
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
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading('Eliminando producto...');
      
      this._storeProductsService.delete(storeProductId).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success('Producto eliminado exitosamente');
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
      storeName: [''],
      createdBy: [''],
      dateFrom: [''],
      dateTo: ['']
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
      // Auto-apply filters when they change (except search which has its own debounce)
      const searchValue = this.filtersForm.get('search')?.value;
      if (!searchValue) {
        this.currentPage = 1;
        this._loadProducts();
      }
    });
  }
  
  private _loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: IStoreProductFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this._getFormFilters()
    };
    
    this._storeProductsService.getAll(filters).subscribe({
      next: (response) => {

        
        // Handle different response structures
        if (response && typeof response === 'object') {
          // Check if response has the expected structure
          if (response.data && Array.isArray(response.data)) {
            this.storeProducts = response.data;
            this.totalItems = response.total || response.data.length;
            this.totalPages = Math.ceil(this.totalItems / (response.limit || this.itemsPerPage));
            this.hasNext = (response.page || 1) < this.totalPages;
            this.hasPrev = (response.page || 1) > 1;
          } 
          // Check if response is directly an array (fallback)
          else if (Array.isArray(response)) {
            this.storeProducts = response;
            this.totalItems = response.length;
            this.totalPages = 1;
            this.hasNext = false;
            this.hasPrev = false;
          }
          // Check if response has a different structure
          else if (response.data && Array.isArray(response.data)) {
            this.storeProducts = response.data as IStoreProduct[];
            this.totalItems = response.total || (response.data as IStoreProduct[]).length;
            this.totalPages = Math.ceil(this.totalItems / (response.limit || this.itemsPerPage));
            this.hasNext = (response.page || 1) < this.totalPages;
            this.hasPrev = (response.page || 1) > 1;
          }
          else {
            console.warn('Unexpected response structure:', response);
            this.storeProducts = [];
            this.totalItems = 0;
            this.totalPages = 1;
            this.hasNext = false;
            this.hasPrev = false;
          }
        } else {
          console.warn('Invalid response:', response);
          this.storeProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.hasNext = false;
          this.hasPrev = false;
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
    

    
    // Only include non-empty values
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        // Handle date conversion for dateFrom and dateTo
        if (key === 'dateFrom' || key === 'dateTo') {
          (filters as any)[key] = new Date(value);
        } else {
          filters[key as keyof IStoreProductFilters] = value;
        }
      }
    });
    

    return filters;
  }
}





import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { ProductSimilarityService, DuplicateGroup } from '../../../../../core/services/product-similarity.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { 
  IBaseProduct, 
  IBaseProductFilters
} from '../../../../../models/base-product.model';

@Component({
  selector: 'app-base-products-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './base-products-list.component.html',
  styleUrls: []
})
export class BaseProductsListComponent implements OnInit, OnDestroy {
  
  // Public properties
  public baseProducts: IBaseProduct[] = [];
  public isLoading = false;
  public error: string | null = null;
  public selectedBaseProducts: string[] = [];
  public showFilters = false;
  
  // Duplicates properties
  public showDuplicatesModal = false;
  public duplicateGroups: DuplicateGroup[] = [];
  public isLoadingDuplicates = false;
  public duplicateFilters = {
    threshold: 0.8,
    limit: 50,
    brand: '',
    includeInactive: false
  };
  
  // Pagination
  public currentPage = 1;
  public totalPages = 1;
  public totalItems = 0;
  public itemsPerPage = 20;
  public hasNext = false;
  public hasPrev = false;
  
  // Filters form
  public filtersForm: FormGroup;
  
  // Math for template
  public Math = Math;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();
  
  constructor(
    private _baseProductsService: BaseProductsService,
    private _productSimilarityService: ProductSimilarityService,
    private _alertService: AlertService,
    private _formBuilder: FormBuilder
  ) {
    this.filtersForm = this._createFiltersForm();
    this._setupSearchDebounce();
  }
  
  ngOnInit(): void {
    this._loadBaseProducts();
    this._setupFormSubscriptions();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Load base products with current filters
   */
  public loadBaseProducts(): void {
    this._loadBaseProducts();
  }
  
  /**
   * Toggle base product selection
   */
  public toggleBaseProductSelection(baseProductId: string): void {
    const index = this.selectedBaseProducts.indexOf(baseProductId);
    if (index > -1) {
      this.selectedBaseProducts.splice(index, 1);
    } else {
      this.selectedBaseProducts.push(baseProductId);
    }
  }
  
  /**
   * Select all base products on current page
   */
  public selectAllBaseProducts(): void {
    this.selectedBaseProducts = [...this.baseProducts.map(p => p.id)];
  }
  
  /**
   * Clear all selections
   */
  public clearSelection(): void {
    this.selectedBaseProducts = [];
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
    this._loadBaseProducts();
  }
  
  /**
   * Apply filters
   */
  public applyFilters(): void {
    this.currentPage = 1;
    this._loadBaseProducts();
  }
  
  /**
   * Go to specific page
   */
  public goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this._loadBaseProducts();
    }
  }
  
  /**
   * Change items per page
   */
  public changeItemsPerPage(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this._loadBaseProducts();
  }
  
  /**
   * Toggle base product active status
   */
  public async toggleActive(baseProductId: string, currentStatus: boolean): Promise<void> {
    const action = currentStatus ? 'desactivar' : 'activar';
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de ${action} este producto base?`,
      `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Sí, ${action}`,
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} producto...`);
      
      this._baseProductsService.toggleActive(baseProductId, !currentStatus).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success(`Producto ${action} exitosamente`);
          this._loadBaseProducts();
          this._updateDuplicateGroupsAfterToggle(baseProductId, !currentStatus);
        },
        error: (error: any) => {
          this._alertService.close();
          console.error(`Error ${action} product:`, error);
          this._alertService.error(`Error al ${action} el producto. Intente nuevamente.`);
        }
      });
    }
  }
  
  /**
   * Delete a base product (hard delete)
   */
  public async deleteBaseProduct(baseProductId: string): Promise<void> {
    const product = this.baseProducts.find(p => p.id === baseProductId);
    const productName = product?.name || 'este producto';
    
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de eliminar permanentemente "${productName}"? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación',
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading('Eliminando producto...');
      
      this._baseProductsService.hardDelete(baseProductId).subscribe({
        next: (response: any) => {
          this._alertService.close();
          this._alertService.success(`Producto eliminado exitosamente. ${response.disassociatedStoreProducts || 0} productos de tienda desasociados.`);
          this._loadBaseProducts();
          this._updateDuplicateGroupsAfterDeletion(baseProductId);
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
   * Hard delete a base product (permanent deletion)
   */
  public async hardDeleteBaseProduct(baseProductId: string): Promise<void> {
    const product = this.baseProducts.find(p => p.id === baseProductId);
    const productName = product?.name || 'este producto';
    
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de eliminar permanentemente "${productName}"? Esta acción NO se puede deshacer y eliminará todos los datos asociados.`,
      'Confirmar Eliminación Permanente',
      'Sí, eliminar permanentemente',
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading('Eliminando producto permanentemente...');
      
      this._baseProductsService.hardDelete(baseProductId).subscribe({
        next: (response: any) => {
          this._alertService.close();
          this._alertService.success(`Producto eliminado permanentemente. ${response.disassociatedStoreProducts || 0} productos de tienda desasociados.`);
          this._loadBaseProducts();
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error hard deleting product:', error);
          this._alertService.error('Error al eliminar el producto. Intente nuevamente.');
        }
      });
    }
  }
  

  /**
   * Open duplicates modal
   */
  public openDuplicatesModal(): void {
    this.showDuplicatesModal = true;
    this._loadDuplicateGroups();
  }

  /**
   * Close duplicates modal
   */
  public closeDuplicatesModal(): void {
    this.showDuplicatesModal = false;
    this.duplicateGroups = [];
  }

  /**
   * Apply duplicate filters
   */
  public applyDuplicateFilters(): void {
    this._loadDuplicateGroups();
  }

  /**
   * Reset duplicate filters
   */
  public resetDuplicateFilters(): void {
    this.duplicateFilters = {
      threshold: 0.8,
      limit: 50,
      brand: '',
      includeInactive: false
    };
    this._loadDuplicateGroups();
  }

  /**
   * Update duplicate groups after product deletion
   */
  private _updateDuplicateGroupsAfterDeletion(deletedProductId: string): void {
    // Remove the deleted product from all groups
    this.duplicateGroups = this.duplicateGroups.map(group => ({
      ...group,
      products: group.products.filter(product => product.id !== deletedProductId)
    })).filter(group => group.products.length >= 2); // Keep only groups with 2+ products

    // If no groups left, close the modal
    if (this.duplicateGroups.length === 0) {
      this.closeDuplicatesModal();
    }
  }

  /**
   * Update duplicate groups after product toggle
   */
  private _updateDuplicateGroupsAfterToggle(productId: string, newActiveStatus: boolean): void {
    // Update the product status in all groups
    this.duplicateGroups = this.duplicateGroups.map(group => ({
      ...group,
      products: group.products.map(product => 
        product.id === productId ? { ...product, isActive: newActiveStatus } : product
      )
    }));

    // If we're only showing active products and this was deactivated, remove it
    if (!newActiveStatus) {
      this.duplicateGroups = this.duplicateGroups.map(group => ({
        ...group,
        products: group.products.filter(product => product.id !== productId)
      })).filter(group => group.products.length >= 2);
    }

    // If no groups left, close the modal
    if (this.duplicateGroups.length === 0) {
      this.closeDuplicatesModal();
    }
  }

  /**
   * Load duplicate groups
   */
  private _loadDuplicateGroups(): void {
    this.isLoadingDuplicates = true;
    
    const filters = {
      threshold: this.duplicateFilters.threshold,
      limit: this.duplicateFilters.limit,
      includeInactive: this.duplicateFilters.includeInactive,
      brand: this.duplicateFilters.brand || undefined
    };
    
    this._productSimilarityService.findDuplicateBaseProducts(filters).subscribe({
      next: (groups) => {
        this.duplicateGroups = groups;
        this.isLoadingDuplicates = false;
      },
      error: (error) => {
        console.error('Error loading duplicate groups:', error);
        this._alertService.error('Error al cargar productos duplicados');
        this.isLoadingDuplicates = false;
      }
    });
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
   * Format average similarity percentage for display
   */
  public formatAvgSimilarityPercentage(group: any): string {
    return this._productSimilarityService.formatAvgSimilarityPercentage(group);
  }

  /**
   * Get product image
   */
  public getProductImage(baseProduct: IBaseProduct): string | null {
    if (baseProduct.specifications?.originalData?.highResImageUrl) {
      return baseProduct.specifications.originalData.highResImageUrl;
    }
    
    if (baseProduct.image) {
      return baseProduct.image;
    }
    
    return null;
  }

  /**
   * Get product summary image
   */
  public getProductSummaryImage(product: any): string | null {
    // According to the API documentation, ProductSummary has an image property
    if (product.image) {
      return product.image;
    }
    
    return null;
  }

  /**
   * Get product URL from store products
   */
  public getProductUrl(product: any): string | null {
    // First check if the product itself has a URL
    if (product.url) {
      return product.url;
    }
    
    // Fallback: Check store products for URL
    if (product.storeProducts && product.storeProducts.length > 0) {
      const storeProductWithUrl = product.storeProducts.find((sp: any) => sp.url);
      if (storeProductWithUrl) {
        return storeProductWithUrl.url;
      }
    }
    
    return null;
  }

  
  /**
   * Handle image error
   */
  public onImageError(event: any): void {
    event.target.style.display = 'none';
  }
  
  /**
   * Track by function for ngFor
   */
  public trackByBaseProductId(index: number, baseProduct: IBaseProduct): string {
    return baseProduct.id;
  }
  
  /**
   * Toggle select all base products
   */
  public toggleSelectAll(): void {
    if (this.selectedBaseProducts.length === this.baseProducts.length && this.baseProducts.length > 0) {
      this.clearSelection();
    } else {
      this.selectAllBaseProducts();
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

  /**
   * Get status filter text
   */
  public getStatusFilterText(): string {
    const isActiveValue = this.filtersForm.get('isActive')?.value;
    if (isActiveValue === true || isActiveValue === 'true') {
      return 'Solo Activos';
    } else if (isActiveValue === false || isActiveValue === 'false') {
      return 'Solo Inactivos';
    } else {
      return 'Todos';
    }
  }

  /**
   * Get status filter CSS classes
   */
  public getStatusFilterClass(): string {
    const isActiveValue = this.filtersForm.get('isActive')?.value;
    if (isActiveValue === true || isActiveValue === 'true') {
      return 'bg-green-100 text-green-800';
    } else if (isActiveValue === false || isActiveValue === 'false') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get status filter icon
   */
  public getStatusFilterIcon(): string {
    const isActiveValue = this.filtersForm.get('isActive')?.value;
    if (isActiveValue === true || isActiveValue === 'true') {
      return 'icon-check-circle';
    } else if (isActiveValue === false || isActiveValue === 'false') {
      return 'icon-x-circle';
    } else {
      return 'icon-list';
    }
  }
  
  // ===== Private Methods =====
  
  private _createFiltersForm(): FormGroup {
    return this._formBuilder.group({
      search: [''],
      brand: [''],
      category: [''],
      isActive: [true], // Default to active products only
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
      this._loadBaseProducts();
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
        this._loadBaseProducts();
      }
    });
  }
  
  private _loadBaseProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: IBaseProductFilters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ...this._getFormFilters()
    };
    
    this._baseProductsService.getAll(filters).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.baseProducts = response.data;
          this.totalItems = response.total || response.data.length;
          this.totalPages = Math.ceil(this.totalItems / (response.limit || this.itemsPerPage));
          this.hasNext = response.hasNext || false;
          this.hasPrev = response.hasPrev || false;
        } else {
          this.baseProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.hasNext = false;
          this.hasPrev = false;
        }
      },
      error: (error: any) => {
        console.error('Error loading base products:', error);
        
        if (error.status === 404) {
          this.error = 'Los endpoints de productos base aún no están implementados en el backend';
        } else if (error.status === 401) {
          this.error = 'Autenticación requerida';
        } else if (error.status === 403) {
          this.error = 'Permisos insuficientes';
        } else if (error.status === 0) {
          this.error = 'Error de conexión';
        } else {
          this.error = 'Error al cargar los productos base';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  private _getFormFilters(): Partial<IBaseProductFilters> {
    const formValue = this.filtersForm.value;
    const filters: Partial<IBaseProductFilters> = {};
    
    // Only include non-empty values
    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== null && value !== undefined && value !== '') {
        // Handle date conversion for dateFrom and dateTo
        if (key === 'dateFrom' || key === 'dateTo') {
          (filters as any)[key] = new Date(value);
        } else if (key === 'isActive') {
          // Handle boolean conversion properly
          if (value === true || value === 'true') {
            (filters as any)[key] = true;
          } else if (value === false || value === 'false') {
            (filters as any)[key] = false;
          }
          // If value is empty string, don't include the filter (show all)
        } else {
          filters[key as keyof IBaseProductFilters] = value;
        }
      }
    });
    
    return filters;
  }
}

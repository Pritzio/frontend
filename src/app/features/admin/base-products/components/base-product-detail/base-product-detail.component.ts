import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { BaseProductsService } from '../../../../../core/services/base-products.service';
import { AlertService } from '../../../../../core/services/alert.service';
import { TranslatePipe } from '../../../../../shared/pipes/translate.pipe';
import { 
  IBaseProduct
} from '../../../../../models/base-product.model';

@Component({
  selector: 'app-base-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './base-product-detail.component.html',
  styleUrls: []
})
export class BaseProductDetailComponent implements OnInit, OnDestroy {
  
  // Public properties
  public baseProduct: IBaseProduct | null = null;
  public isLoading = false;
  public error: string | null = null;
  
  // Private properties
  private _destroy$ = new Subject<void>();
  private _baseProductId: string | null = null;
  
  constructor(
    @Inject(BaseProductsService) private _baseProductsService: BaseProductsService,
    private _alertService: AlertService,
    private _route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this._setupRouteParams();
    this._loadBaseProduct();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  // ===== Public Methods =====
  
  /**
   * Toggle base product active status
   */
  public async toggleActive(): Promise<void> {
    if (!this.baseProduct) return;
    
    const action = this.baseProduct.isActive ? 'desactivar' : 'activar';
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de ${action} este producto base?`,
      `Confirmar ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Sí, ${action}`,
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} producto...`);
      
      this._baseProductsService.toggleActive(this.baseProduct.id, !this.baseProduct.isActive).subscribe({
        next: (response) => {
          this._alertService.close();
          this._alertService.success(`Producto ${action} exitosamente`);
          this.baseProduct = response;
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
   * Delete base product
   */
  public async deleteBaseProduct(): Promise<void> {
    if (!this.baseProduct) return;
    
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de eliminar "${this.baseProduct.name}"? Esta acción no se puede deshacer.`,
      'Confirmar Eliminación',
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading('Eliminando producto...');
      
      this._baseProductsService.delete(this.baseProduct.id).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success('Producto eliminado exitosamente');
          // Navigate back to base products list
          window.history.back();
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error deleting base product:', error);
          this._alertService.error('Error al eliminar el producto. Intente nuevamente.');
        }
      });
    }
  }
  
  /**
   * Get the best available product image
   */
  public getProductImage(): string | null {
    if (!this.baseProduct) return null;
    
    // Try high resolution image from specifications first
    const highResImage = this.baseProduct.specifications?.originalData?.highResImageUrl;
    if (highResImage && highResImage.trim() !== '') {
      return highResImage;
    }
    
    // Fallback to regular image
    if (this.baseProduct.image && this.baseProduct.image.trim() !== '') {
      return this.baseProduct.image;
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
   * Get specifications as array (filtered and formatted)
   */
  public getSpecificationsArray(): Array<{key: string, value: any}> {
    if (!this.baseProduct?.specifications) return [];
    
    // Fields to exclude from display
    const excludeFields = ['originalData', 'highResImageUrl', 'imageUrl'];
    
    return Object.entries(this.baseProduct.specifications)
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
      'rating': 'Calificación',
      'categories': 'Categorías'
    };
    
    return fieldNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  /**
   * Format field values for display
   */
  private formatFieldValue(key: string, value: any): any {
    if (key === 'categories' && Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (key === 'rating' && typeof value === 'number') {
      return `${value}/5 ⭐`;
    }
    
    return value;
  }
  
  /**
   * Check if base product has specifications
   */
  public hasSpecifications(): boolean {
    if (!this.baseProduct) return false;
    
    return !!(this.baseProduct.specifications && Object.keys(this.baseProduct.specifications).length > 0);
  }
  
  /**
   * Reload base product data
   */
  public reloadBaseProduct(): void {
    this._loadBaseProduct();
  }

  /**
   * Disassociate store product from base product
   */
  public async disassociateStoreProduct(storeProductId: string, storeProductName: string): Promise<void> {
    const confirmed = await this._alertService.confirm(
      `¿Está seguro de desasociar "${storeProductName}" de este producto base?`,
      'Confirmar Desasociación',
      'Sí, desasociar',
      'Cancelar'
    );
    
    if (confirmed) {
      this._alertService.loading('Desasociando producto...');
      
      this._baseProductsService.disassociateStoreProduct(storeProductId).subscribe({
        next: () => {
          this._alertService.close();
          this._alertService.success('Producto desasociado exitosamente');
          this._loadBaseProduct(); // Reload to update the list and counters
        },
        error: (error: any) => {
          this._alertService.close();
          console.error('Error disassociating store product:', error);
          this._alertService.error('Error al desasociar el producto. Intente nuevamente.');
        }
      });
    }
  }

  /**
   * Get unique stores from associated products
   */
  public getUniqueStores(): string[] {
    if (!this.baseProduct?.storeProducts) return [];
    
    const storeNames = this.baseProduct.storeProducts.map(sp => sp.store.name);
    return [...new Set(storeNames)];
  }

  /**
   * Get store products by store name
   */
  public getStoreProductsByStore(storeName: string): any[] {
    if (!this.baseProduct?.storeProducts) return [];
    
    return this.baseProduct.storeProducts.filter(sp => sp.store.name === storeName);
  }
  
  // ===== Private Methods =====
  
  private _setupRouteParams(): void {
    this._route.params.pipe(
      takeUntil(this._destroy$)
    ).subscribe(params => {
      this._baseProductId = params['id'];
    });
  }
  
  private _loadBaseProduct(): void {
    if (!this._baseProductId) {
      this.error = 'Product ID not provided';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    this._baseProductsService.getWithStoreProducts(this._baseProductId!).subscribe({
      next: (response) => {
        if (response) {
          this.baseProduct = response;
        } else {
          this.error = 'Product not found';
        }
      },
      error: (error: any) => {
        if (error.message === 'Producto no encontrado') {
          this.error = 'El producto base no existe o no está disponible';
        } else {
          this.error = 'Error al cargar el producto base. Verifique que el backend esté implementado.';
        }
        console.error('Error loading base product:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

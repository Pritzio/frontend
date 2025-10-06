import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, StoreProductInfo } from '../../../../models/product-comparison.interface';
import { ImagePlaceholderService } from '../../../../core/services/image-placeholder.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() viewDetails = new EventEmitter<string>();

  constructor(private imagePlaceholderService: ImagePlaceholderService) {}

  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }

  getStoreCountText(): string {
    const count = this.product.storeCount;
    return count === 1 ? '1 tienda' : `${count} tiendas`;
  }

  getVariantsText(): string {
    const count = this.product.totalVariants;
    return count === 1 ? '1 variante' : `${count} variantes`;
  }

  getPlaceholderImage(): string | null {
    return this.imagePlaceholderService.generateBrandPlaceholder(this.product.brand || '');
  }

  getBrandColor(): string {
    return this.imagePlaceholderService.getBrandColor(this.product.brand || '');
  }

  getProductImage(): string | null {
    // First check for high-res image in specifications
    if (this.product.specifications?.originalData?.['highResImageUrl']) {
      return this.product.specifications.originalData['highResImageUrl'];
    }
    
    // Then check for basic image
    if (this.product.image) {
      return this.product.image;
    }
    
    // Return null to show placeholder
    return null;
  }

  onImageError(event: any): void {
    // Hide the image and show placeholder when image fails to load
    event.target.style.display = 'none';
    const placeholder = event.target.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }

  onImageLoad(event: any): void {
    // Check if image is very small and add a class for better styling
    const img = event.target;
    if (img.naturalWidth < 100 || img.naturalHeight < 100) {
      img.classList.add('small-image');
    }
  }

  hasStoreInfo(): boolean {
    return !!(this.product?.storeCount || this.product?.totalVariants || this.product?.priceRange || (this.product?.stores && this.product.stores.length > 0));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  getTopStores(): StoreProductInfo[] {
    if (!this.product.stores || this.product.stores.length === 0) {
      return [];
    }
    
    // Sort by price (ascending) and return top 3 stores
    return this.product.stores
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  trackByStoreId(index: number, store: StoreProductInfo): string {
    return store.store.id;
  }

  isOutOfStock(store: StoreProductInfo): boolean {
    return !!store.product.metadata?.['is_out_of_stock'];
  }
}

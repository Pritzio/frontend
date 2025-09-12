import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductComparisonResponse } from '../../../../models/product-comparison.interface';
import { StoreCardComponent } from '../store-card/store-card.component';
import { ImagePlaceholderService } from '../../../../core/services/image-placeholder.service';

@Component({
  selector: 'app-product-comparison',
  templateUrl: './product-comparison.component.html',
  styleUrls: ['./product-comparison.component.scss'],
  standalone: true,
  imports: [CommonModule, StoreCardComponent]
})
export class ProductComparisonComponent {
  @Input() comparison: ProductComparisonResponse | null = null;

  constructor(private imagePlaceholderService: ImagePlaceholderService) {}

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getStoresCountText(): string {
    if (!this.comparison?.stores) return '0 tiendas';
    const count = this.comparison.totalStores || this.comparison.stores.length;
    return count === 1 ? '1 tienda' : `${count} tiendas`;
  }

  getPriceRangeText(): string {
    if (!this.comparison?.priceRange) return '$0 - $0';
    const { min, max } = this.comparison.priceRange;
    return `${this.formatPrice(min)} - ${this.formatPrice(max)}`;
  }

  getAveragePriceText(): string {
    if (!this.comparison?.priceRange) return 'Precio promedio: $0';
    return `Precio promedio: ${this.formatPrice(this.comparison.priceRange.avg)}`;
  }

  trackByStoreId(index: number, store: any): string {
    return store.store.id;
  }

  getBrandColor(brand: string): string {
    return this.imagePlaceholderService.getBrandColor(brand);
  }

  getProductImage(): string | null {
    if (!this.comparison?.product) return null;
    // Try highResImageUrl from originalData first, then fallback to image property
    return this.comparison.product.specifications?.originalData?.['highResImageUrl'] || this.comparison.product.image;
  }
}

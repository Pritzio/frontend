import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../models/product-comparison.interface';
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
    return this.imagePlaceholderService.generateBrandPlaceholder(this.product.brand);
  }

  getBrandColor(): string {
    return this.imagePlaceholderService.getBrandColor(this.product.brand);
  }

  getProductImage(): string | null {
    console.log('=== IMAGE DEBUG ===');
    console.log('Product:', this.product.name);
    console.log('Product.image:', this.product.image);
    console.log('Product.specifications:', this.product.specifications);
    console.log('Product.specifications?.originalData:', this.product.specifications?.originalData);
    console.log('Product.specifications?.originalData?.highResImageUrl:', this.product.specifications?.originalData?.highResImageUrl);
    
    // First check for high-res image in specifications
    if (this.product.specifications?.originalData?.highResImageUrl) {
      console.log('✅ Using high-res image:', this.product.specifications.originalData.highResImageUrl);
      return this.product.specifications.originalData.highResImageUrl;
    }
    
    // Then check for basic image
    if (this.product.image) {
      console.log('✅ Using basic image:', this.product.image);
      return this.product.image;
    }
    
    // Debug: Check if there are any other image fields
    console.log('❌ No image found. Full product object:', this.product);
    
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
}

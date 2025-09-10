import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../models/product-comparison.interface';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  standalone: true,
  imports: [CommonModule, ProductCardComponent]
})
export class ProductListComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Input() total = 0;
  @Input() query = '';
  @Output() productSelect = new EventEmitter<string>();

  onProductSelect(productId: string): void {
    this.productSelect.emit(productId);
  }

  getResultsText(): string {
    if (this.loading) return '';
    if (this.products.length === 0) return 'No se encontraron productos';
    return `Mostrando ${this.products.length} de ${this.total} resultados`;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}

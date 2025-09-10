import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreComparison } from '../../../../models/product-comparison.interface';

@Component({
  selector: 'app-store-card',
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StoreCardComponent {
  @Input() store!: StoreComparison;

  onVisitStore(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  }

  onImageError(event: any): void {
    // Hide the image and show placeholder when image fails to load
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement.nextElementSibling;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }
}

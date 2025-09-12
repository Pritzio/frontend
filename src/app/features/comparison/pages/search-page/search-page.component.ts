import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductComparisonService } from '../../../../core/services/product-comparison.service';
import { Product, SearchFilters } from '../../../../models/product-comparison.interface';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { ProductListComponent } from '../../components/product-list/product-list.component';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  standalone: true,
  imports: [CommonModule, SearchBarComponent, ProductListComponent]
})
export class SearchPageComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  query = '';
  total = 0;
  brands: string[] = [];
  filters: SearchFilters = {};

  constructor(
    private productComparisonService: ProductComparisonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Brands endpoint not fully implemented, skip loading
    // this.loadBrands();
  }

  onSearch(searchQuery: string): void {
    this.query = searchQuery;
    this.performSearch();
  }

  onFilterChange(newFilters: SearchFilters): void {
    this.filters = { ...this.filters, ...newFilters };
    if (this.query) {
      this.performSearch();
    }
  }

  onBrandFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onFilterChange({ brand: target.value || undefined });
  }


  onProductSelect(productId: string): void {
    this.router.navigate(['/comparison/product', productId]);
  }

  private performSearch(): void {
    this.loading = true;
    this.productComparisonService.searchProducts(this.query, this.filters)
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.total = response.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching products:', error);
          this.loading = false;
        }
      });
  }

  private loadBrands(): void {
    this.productComparisonService.getAvailableBrands()
      .subscribe({
        next: (brands) => {
          this.brands = brands;
        }
      });
  }
}

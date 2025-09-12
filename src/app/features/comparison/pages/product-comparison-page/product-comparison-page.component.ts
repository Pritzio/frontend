import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductComparisonService } from '../../../../core/services/product-comparison.service';
import { ProductComparisonResponse } from '../../../../models/product-comparison.interface';
import { ProductComparisonComponent } from '../../components/product-comparison/product-comparison.component';

@Component({
  selector: 'app-product-comparison-page',
  templateUrl: './product-comparison-page.component.html',
  styleUrls: ['./product-comparison-page.component.scss'],
  standalone: true,
  imports: [CommonModule, ProductComparisonComponent]
})
export class ProductComparisonPageComponent implements OnInit {
  comparison: ProductComparisonResponse | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productComparisonService: ProductComparisonService
  ) {}

  ngOnInit(): void {
    this.loadProductComparison();
  }

  onBackToSearch(): void {
    this.router.navigate(['/comparison/search']);
  }

  private loadProductComparison(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    
    if (!productId) {
      console.error('No product ID provided');
      this.error = true;
      this.loading = false;
      return;
    }

    this.productComparisonService.getProductComparison(productId)
      .subscribe({
        next: (response) => {
          this.comparison = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product comparison:', error);
          this.error = true;
          this.loading = false;
        }
      });
  }
}

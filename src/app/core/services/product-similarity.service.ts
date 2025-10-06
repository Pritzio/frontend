import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IBaseProduct } from '../../models/base-product.model';
import { IStoreProduct } from '../../models/store-product.model';

export interface SimilarityResult {
  id: string;
  name: string;
  brand: string | null;
  image: string | null;
  url: string | null;
  similarity: number;
  storeCount: number;
  totalVariants: number;
  storeProducts: StoreProductSummary[];
  confidence?: 'high' | 'medium' | 'low';
  matchReason?: string;
}

export interface SimilarityFilters {
  threshold?: number; // 0-1, default 0.85
  limit?: number; // default 10
  excludeIds?: string[]; // IDs to exclude from results
  includeInactive?: boolean; // default false
  brand?: string; // Filter by specific brand
}

export interface StoreProductSummary {
  id: string;
  name: string;
  price: number;
  image: string;
  url: string | null;            // Store product URL
  store: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  brand: string | null;
  image: string;
  url: string | null;            // Product URL (from first store product)
  storeName?: string;            // Store name (from first store product)
  storeCount: number;
  totalVariants: number;
  createdAt: string;
  storeProducts: StoreProductSummary[];
  isActive?: boolean; // Added for frontend logic
}

export interface DuplicateGroup {
  id: string;
  avgSimilarity: number;
  threshold: number;
  count: number;
  brand: string;
  image: string;
  totalStores: number;
  totalVariants: number;
  products: ProductSummary[];
  confidence?: 'high' | 'medium' | 'low'; // Added by frontend
}

@Injectable({
  providedIn: 'root'
})
export class ProductSimilarityService {
  private readonly apiUrl = environment.apiUrl; // Updated to fix URL duplication

  constructor(private http: HttpClient) {}

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Find similar products for a given product
   */
  findSimilarProducts(
    product: IBaseProduct | IStoreProduct, 
    filters: SimilarityFilters = {}
  ): Observable<SimilarityResult[]> {
    const preparedProduct = this._prepareProductForComparison(product);

    const requestBody = {
      name: preparedProduct.name,
      brand: preparedProduct.brand,
      threshold: filters.threshold || 0.5,
      limit: filters.limit || 10
    };

    return this.http.post<{success: boolean, data: SimilarityResult[], total: number, threshold: number}>(
      `${this.apiUrl}/products/similarity/find-similar`,
      requestBody,
      { 
        headers: this.getAuthHeaders()
      }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return this._enrichSimilarityResults(response.data);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error finding similar products:', error);
        return of([]);
      })
    );
  }

  /**
   * Find similar base products for association suggestions
   */
  findAssociationSuggestions(
    storeProduct: IStoreProduct,
    filters: SimilarityFilters = {}
  ): Observable<SimilarityResult[]> {
    const defaultFilters: SimilarityFilters = {
      threshold: 0.5,
      limit: 5,
      includeInactive: false,
      ...filters
    };

    return this.findSimilarProducts(storeProduct, defaultFilters);
  }

  /**
   * Find duplicate base products for cleanup
   */
  findDuplicateBaseProducts(
    filters: SimilarityFilters = {}
  ): Observable<DuplicateGroup[]> {
    let params = new HttpParams();
    
    // Add filters as query parameters
    if (filters.threshold !== undefined) {
      params = params.set('threshold', filters.threshold.toString());
    }
    if (filters.limit !== undefined) {
      params = params.set('limit', filters.limit.toString());
    }
    if (filters.includeInactive !== undefined) {
      params = params.set('includeInactive', filters.includeInactive.toString());
    }
    if (filters.brand) {
      params = params.set('brand', filters.brand);
    }

    return this.http.get<DuplicateGroup[]>(
      `${this.apiUrl}/product-comparison/duplicates`,
      { 
        headers: this.getAuthHeaders(),
        params
      }
    ).pipe(
      map(response => {
        // Handle different response structures
        let groups = response;
        if (response && typeof response === 'object' && 'data' in response) {
          groups = (response as any).data;
        } else if (response && typeof response === 'object' && 'groups' in response) {
          groups = (response as any).groups;
        }
        
        return this._enrichDuplicateGroups(groups);
      }),
      catchError(error => {
        console.error('Error finding duplicate products:', error);
        return of([]);
      })
    );
  }

  /**
   * Get similarity score between two products
   */
  calculateSimilarity(
    product1: IBaseProduct | IStoreProduct,
    product2: IBaseProduct | IStoreProduct
  ): Observable<number> {
    return this.http.post<{ similarity: number }>(
      `${this.apiUrl}/products/similarity/calculate`,
      {
        product1: this._prepareProductForComparison(product1),
        product2: this._prepareProductForComparison(product2)
      },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => response.similarity),
      catchError(error => {
        console.error('Error calculating similarity:', error);
        return of(0);
      })
    );
  }

  /**
   * Get suggested base product for a store product
   */
  getSuggestedBaseProduct(storeProduct: IStoreProduct): Observable<SimilarityResult | null> {
    return this.findAssociationSuggestions(storeProduct, { threshold: 0.5, limit: 1 }).pipe(
      map(results => results.length > 0 ? results[0] : null)
    );
  }

  getSuggestedBaseProducts(storeProduct: IStoreProduct): Observable<SimilarityResult[]> {
    return this.findAssociationSuggestions(storeProduct, { threshold: 0.5, limit: 3 });
  }

  /**
   * Prepare product data for comparison
   */
  private _prepareProductForComparison(product: IBaseProduct | IStoreProduct): any {
    // Extract brand from product name if not available
    let brand = 'brand' in product ? product.brand : null;
    
    // If brand is null, try to extract it from the product name
    if (!brand && product.name) {
      const nameLower = product.name.toLowerCase();
      if (nameLower.includes('nova')) {
        brand = 'nova';
      } else if (nameLower.includes('favorita')) {
        brand = 'favorita';
      } else if (nameLower.includes('home care')) {
        brand = 'home care';
      }
    }

    return {
      id: product.id,
      name: product.name,
      brand: brand,
      model: 'model' in product ? product.model : null,
      sku: 'sku' in product ? product.sku : null,
      fullName: 'fullName' in product ? product.fullName : product.name,
      specifications: 'specifications' in product ? product.specifications : null
    };
  }

  /**
   * Enrich similarity results with confidence levels and match reasons
   */
  private _enrichSimilarityResults(results: SimilarityResult[]): SimilarityResult[] {
    return results.map(result => ({
      ...result,
      confidence: this._getConfidenceLevel(result.similarity),
      matchReason: this._getMatchReason(result)
    }));
  }

  /**
   * Enrich duplicate groups with confidence levels
   */
  private _enrichDuplicateGroups(groups: DuplicateGroup[]): DuplicateGroup[] {
    // Ensure groups is an array before mapping
    if (!Array.isArray(groups)) {
      return [];
    }
    
    return groups.map(group => ({
      ...group,
      confidence: this._getConfidenceLevel(group.avgSimilarity)
    }));
  }

  /**
   * Get confidence level based on similarity score
   */
  private _getConfidenceLevel(similarity: number | string | null | undefined): 'high' | 'medium' | 'low' {
    const numSimilarity = typeof similarity === 'string' ? parseFloat(similarity) : Number(similarity);
    
    if (isNaN(numSimilarity) || numSimilarity < 0 || numSimilarity > 1) {
      return 'low';
    }
    
    if (numSimilarity >= 0.9) return 'high';
    if (numSimilarity >= 0.8) return 'medium';
    return 'low';
  }

  /**
   * Get match reason based on similarity result
   */
  private _getMatchReason(result: SimilarityResult): string {
    const similarity = result.similarity;
    
    if (similarity >= 0.95) {
      return 'Productos prácticamente idénticos';
    } else if (similarity >= 0.9) {
      return 'Productos muy similares';
    } else if (similarity >= 0.85) {
      return 'Productos similares con pequeñas diferencias';
    } else if (similarity >= 0.8) {
      return 'Productos con similitud moderada';
    } else {
      return 'Productos con similitud baja';
    }
  }

  /**
   * Get similarity badge class based on confidence level
   */
  getSimilarityBadgeClass(confidence: 'high' | 'medium' | 'low'): string {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get similarity icon based on confidence level
   */
  getSimilarityIcon(confidence: 'high' | 'medium' | 'low'): string {
    switch (confidence) {
      case 'high':
        return 'icon-check-circle';
      case 'medium':
        return 'icon-alert-circle';
      case 'low':
        return 'icon-info';
      default:
        return 'icon-info';
    }
  }

  /**
   * Format similarity percentage for display
   */
  formatSimilarityPercentage(similarity: number | string | null | undefined): string {
    const numSimilarity = typeof similarity === 'string' ? parseFloat(similarity) : Number(similarity);
    
    if (isNaN(numSimilarity) || numSimilarity < 0 || numSimilarity > 1) {
      return 'N/A';
    }
    
    return `${Math.round(numSimilarity * 100)}%`;
  }

  /**
   * Format similarity percentage for display (alias for avgSimilarity)
   */
  formatAvgSimilarityPercentage(group: DuplicateGroup): string {
    return this.formatSimilarityPercentage(group.avgSimilarity);
  }

  /**
   * Check if similarity is above threshold
   */
  isSimilarityAboveThreshold(similarity: number, threshold: number = 0.85): boolean {
    return similarity >= threshold;
  }
}

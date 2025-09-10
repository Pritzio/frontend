import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ProductSearchResponse, 
  ProductComparisonResponse, 
  SearchFilters 
} from '../../models/product-comparison.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductComparisonService {
  private readonly apiUrl = `${environment.apiUrl}/product-comparison`;

  constructor(private http: HttpClient) {}

  /**
   * Search for products by query
   * @param query Search term (minimum 2 characters)
   * @param filters Optional search filters
   * @returns Observable with search results
   */
  searchProducts(query: string, filters?: SearchFilters): Observable<ProductSearchResponse> {
    if (query.trim().length < 2) {
      throw new Error('Query must be at least 2 characters long');
    }

    let params = `q=${encodeURIComponent(query.trim())}`;
    
    if (filters?.brand) {
      params += `&brand=${encodeURIComponent(filters.brand)}`;
    }
    
    if (filters?.availability) {
      params += `&availability=${encodeURIComponent(filters.availability)}`;
    }

    return this.http.get<ProductSearchResponse>(`${this.apiUrl}/search?${params}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get detailed product comparison
   * @param baseProductId Product ID to compare
   * @returns Observable with product comparison data
   */
  getProductComparison(baseProductId: string): Observable<ProductComparisonResponse> {
    console.log('Requesting product comparison for ID:', baseProductId);
    console.log('API URL:', `${this.apiUrl}/${baseProductId}`);
    
    return this.http.get<ProductComparisonResponse>(`${this.apiUrl}/${baseProductId}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get available brands for filtering
   * @returns Observable with list of brands
   */
  getAvailableBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.warn('Brands endpoint not available:', error);
        return of([]); // Return empty array if endpoint fails
      })
    );
  }

  /**
   * Get authentication headers
   * @returns HttpHeaders with authorization token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}

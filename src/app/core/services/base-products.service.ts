import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  IBaseProduct, 
  IBaseProductFilters, 
  ICreateBaseProductRequest, 
  IUpdateBaseProductRequest,
  IBaseProductResponse,
  IBaseProductAnalytics
} from '../../models/base-product.model';

@Injectable({
  providedIn: 'root'
})
export class BaseProductsService {
  private readonly apiUrl = `${environment.apiUrl}/admin/products`;

  constructor(private http: HttpClient) {}

  /**
   * Get all base products with optional filters
   */
  getAll(filters?: IBaseProductFilters): Observable<IBaseProductResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<IBaseProductResponse>(`${this.apiUrl}/base-products`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          // Backend endpoint not implemented yet, return empty response
          const emptyResponse: IBaseProductResponse = {
            data: [],
            total: 0,
            page: filters?.page || 1,
            limit: filters?.limit || 20,
            hasNext: false,
            hasPrev: false
          };
          return of(emptyResponse);
        }
        throw error;
      })
    );
  }

  /**
   * Get base product by ID
   */
  getById(id: string): Observable<IBaseProduct> {
    return this.http.get<IBaseProduct>(`${this.apiUrl}/base-product/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw error;
      })
    );
  }

  /**
   * Create new base product
   */
  create(baseProduct: ICreateBaseProductRequest): Observable<IBaseProduct> {
    return this.http.post<IBaseProduct>(`${this.apiUrl}/base-product`, baseProduct, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Update base product
   */
  update(id: string, baseProduct: IUpdateBaseProductRequest): Observable<IBaseProduct> {
    return this.http.put<IBaseProduct>(`${this.apiUrl}/base-product/${id}`, baseProduct, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Delete base product (soft delete)
   */
  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/base-product/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Hard delete base product (permanent deletion)
   */
  hardDelete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/base-product/${id}/hard`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get base product analytics
   */
  getAnalytics(): Observable<IBaseProductAnalytics> {
    return this.http.get<IBaseProductAnalytics>(`${this.apiUrl}/base-products/analytics`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Search base products
   */
  search(query: string, filters?: Partial<IBaseProductFilters>): Observable<IBaseProductResponse> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          if (value instanceof Date) {
            params = params.set(key, value.toISOString());
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<IBaseProductResponse>(`${this.apiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Get available brands
   */
  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/brands`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get base product with store products
   */
  getWithStoreProducts(id: string): Observable<IBaseProduct> {
    return this.http.get<IBaseProduct>(`${this.apiUrl}/base-product/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          throw new Error('Producto no encontrado');
        }
        throw error;
      })
    );
  }

  /**
   * Toggle base product active status
   */
  toggleActive(id: string, isActive: boolean): Observable<IBaseProduct> {
    return this.http.put<IBaseProduct>(`${this.apiUrl}/base-product/${id}`, { isActive }, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get unassociated store products
   */
  getUnassociatedStoreProducts(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/store-products/unassociated`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Associate store product to base product
   */
  associateStoreProduct(storeProductId: string, baseProductId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/associate-store-product`, {
      storeProductId,
      baseProductId
    }, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Disassociate store product
   */
  disassociateStoreProduct(storeProductId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/disassociate-store-product`, {
      storeProductId
    }, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get product duplicates
   */
  getDuplicates(threshold?: number, limit?: number): Observable<any> {
    let params = new HttpParams();
    
    if (threshold !== undefined) {
      params = params.set('threshold', threshold.toString());
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/duplicates`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Merge duplicate products
   */
  mergeProducts(targetProductId: string, duplicateProductIds: string[], mergeData?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/merge`, {
      targetProductId,
      duplicateProductIds,
      mergeData
    }, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Get association suggestions
   */
  getAssociationSuggestions(storeProductId?: string, limit?: number, threshold?: number): Observable<any> {
    let params = new HttpParams();
    
    if (storeProductId) {
      params = params.set('storeProductId', storeProductId);
    }
    if (limit !== undefined) {
      params = params.set('limit', limit.toString());
    }
    if (threshold !== undefined) {
      params = params.set('threshold', threshold.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/suggest-associations`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Get unassociated store products with suggestions
   */
  getUnassociatedStoreProductsWithSuggestions(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.apiUrl}/store-products/unassociated-with-suggestions`, {
      headers: this.getAuthHeaders(),
      params
    });
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

}

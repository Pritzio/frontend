import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { 
  IStoreProduct,
  ICreateStoreProductRequest,
  IUpdateStoreProductRequest,
  IStoreProductFilters,
  IStoreProductsResponse,
  IStoreProductResponse,
  IScrapedProduct,
  IBulkScrapingResponse
} from '../../models/store-product.model';
import { IApiResponse, IPaginatedResponse } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class StoreProductsService {
  
  private readonly _baseUrl = `${environment.apiUrl}/store-products`;
  
  // State management
  private _storeProducts = new BehaviorSubject<IStoreProduct[]>([]);
  private _currentStoreProduct = new BehaviorSubject<IStoreProduct | null>(null);
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  // Public observables
  public storeProducts$ = this._storeProducts.asObservable();
  public currentStoreProduct$ = this._currentStoreProduct.asObservable();
  public isLoading$ = this._isLoading.asObservable();
  public error$ = this._error.asObservable();

  constructor(private _http: HttpClient) {}

  /**
   * Get all store products with optional filters
   */
  getAll(filters?: IStoreProductFilters): Observable<IStoreProductsResponse> {
    this._setLoading(true);
    this._clearError();
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
      if (filters.storeId) params = params.set('storeId', filters.storeId);
      if (filters.storeName) params = params.set('storeName', filters.storeName);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
      if (filters.unassociated !== undefined) params = params.set('unassociated', filters.unassociated.toString());
    }
    

    
    return this._http.get<IStoreProductsResponse>(this._baseUrl, { params }).pipe(
      tap(response => {
        if (response && response.data) {
          this._storeProducts.next(response.data);
        } else {
          this._storeProducts.next([]);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Get store product by ID
   */
  getById(id: string): Observable<IStoreProduct> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.get<IStoreProduct>(`${this._baseUrl}/${id}`).pipe(
      tap(storeProduct => {
        this._currentStoreProduct.next(storeProduct);
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Create new store product
   */
  create(storeProductData: ICreateStoreProductRequest): Observable<IStoreProduct> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IStoreProduct>(this._baseUrl, storeProductData).pipe(
      tap(newStoreProduct => {
        // Add to current list
        const currentStoreProducts = this._storeProducts.value;
        this._storeProducts.next([newStoreProduct, ...currentStoreProducts]);
        this._currentStoreProduct.next(newStoreProduct);
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Update store product
   */
  update(id: string, storeProductData: IUpdateStoreProductRequest): Observable<IStoreProduct> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.put<IStoreProduct>(`${this._baseUrl}/${id}`, storeProductData).pipe(
      tap(updatedStoreProduct => {
        // Update in current list
        const currentStoreProducts = this._storeProducts.value;
        const index = currentStoreProducts.findIndex(sp => sp.id === id);
        if (index !== -1) {
          currentStoreProducts[index] = updatedStoreProduct;
          this._storeProducts.next([...currentStoreProducts]);
        }
        this._currentStoreProduct.next(updatedStoreProduct);
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Delete store product
   */
  delete(id: string): Observable<{ message: string }> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.delete<{ message: string }>(`${this._baseUrl}/${id}`).pipe(
      tap(() => {
        // Remove from current list
        const currentStoreProducts = this._storeProducts.value;
        const filteredStoreProducts = currentStoreProducts.filter(sp => sp.id !== id);
        this._storeProducts.next(filteredStoreProducts);
        
        // Clear current store product if it was deleted
        const currentStoreProduct = this._currentStoreProduct.value;
        if (currentStoreProduct && currentStoreProduct.id === id) {
          this._currentStoreProduct.next(null);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Get admin store products (with admin-level information)
   */
  getAdminStoreProducts(filters?: IStoreProductFilters): Observable<IStoreProductsResponse> {
    this._setLoading(true);
    this._clearError();
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
      if (filters.storeId) params = params.set('storeId', filters.storeId);
      if (filters.storeName) params = params.set('storeName', filters.storeName);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
    }
    
    return this._http.get<IStoreProductsResponse>(`${this._baseUrl}/admin`, { params }).pipe(
      tap(response => {
        this._storeProducts.next(response.data);
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Get unassociated store products (products without base product association)
   */
  getUnassociated(filters?: Partial<IStoreProductFilters>): Observable<IStoreProductsResponse> {
    this._setLoading(true);
    this._clearError();
    
    let params = new HttpParams();
    
    if (filters) {
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.search) params = params.set('search', filters.search);
      if (filters.createdBy) params = params.set('createdBy', filters.createdBy);
      if (filters.storeId) params = params.set('storeId', filters.storeId);
      if (filters.storeName) params = params.set('storeName', filters.storeName);
      if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom.toISOString());
      if (filters.dateTo) params = params.set('dateTo', filters.dateTo.toISOString());
    }
    
    return this._http.get<IStoreProductsResponse>(`${environment.apiUrl}/admin/products/store-products/unassociated`, { params }).pipe(
      tap(response => {
        if (response && response.data) {
          this._storeProducts.next(response.data);
        } else {
          console.warn('StoreProductsService - No data in unassociated response:', response);
          this._storeProducts.next([]);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  /**
   * Refresh store products list
   */
  refresh(): void {
    this.getAll();
  }

  /**
   * Clear current store product
   */
  clearCurrentStoreProduct(): void {
    this._currentStoreProduct.next(null);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._clearError();
  }

  /**
   * Add scraped products (bulk import with duplicate detection)
   */
  addScrapedProducts(products: IScrapedProduct[]): Observable<IBulkScrapingResponse> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IBulkScrapingResponse>(`${this._baseUrl}/scraping/add-products`, products).pipe(
      tap(response => {
        // Refresh the list to show new products
        this.refresh();
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }

  // Private methods
  private _setLoading(loading: boolean): void {
    this._isLoading.next(loading);
  }

  private _clearError(): void {
    this._error.next(null);
  }

  private _handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    this._error.next(errorMessage);
    console.error('StoreProductsService Error:', error);
    
    return throwError(() => error);
  }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap, finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { 
  IProduct, 
  ICreateProductRequest, 
  IUpdateProductRequest,
  IBulkCreateProductsRequest,
  IBulkOperationRequest,
  IBulkOperationResponse,
  IProductFilters,
  IProductAnalytics,
  IScrapingFilters,
  IUpdateScrapingRequest,
  ProductType,
  ProductStatus,
  ProductCondition,
  ScrapingPriority
} from '../../models/product.model';
import { IApiResponse, IPaginatedResponse } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  
  private readonly _baseUrl = `${environment.apiUrl}/products`;
  
  // State management
  private _products = new BehaviorSubject<IProduct[]>([]);
  private _currentProduct = new BehaviorSubject<IProduct | null>(null);
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);
  
  // Public observables
  public products$ = this._products.asObservable();
  public currentProduct$ = this._currentProduct.asObservable();
  public isLoading$ = this._isLoading.asObservable();
  public error$ = this._error.asObservable();

  constructor(private _http: HttpClient) {}
  
  // ===== CRUD Operations =====

  /**
   * Get all products with optional filters
   */
  getAll(filters?: IProductFilters): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    this._setLoading(true);
    this._clearError();
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof IProductFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(this._baseUrl, { params }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._products.next(response.data.data || []);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Get product by ID
   */
  getById(id: string): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.get<IApiResponse<IProduct>>(`${this._baseUrl}/${id}`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._currentProduct.next(response.data);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Get product by code
   */
  getByCode(code: string): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.get<IApiResponse<IProduct>>(`${this._baseUrl}/code/${code}`).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._currentProduct.next(response.data);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Create a new product
   */
  create(productData: ICreateProductRequest): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IApiResponse<IProduct>>(this._baseUrl, productData).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this._products.value;
          this._products.next([...currentProducts, response.data]);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Update an existing product
   */
  update(id: string, productData: IUpdateProductRequest): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.put<IApiResponse<IProduct>>(`${this._baseUrl}/${id}`, productData).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this._products.value;
          const updatedProducts = currentProducts.map(p => 
            p.id === id ? response.data : p
          );
          this._products.next(updatedProducts);
          this._currentProduct.next(response.data);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Delete a product
   */
  delete(id: string): Observable<IApiResponse<void>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.delete<IApiResponse<void>>(`${this._baseUrl}/${id}`).pipe(
      tap(response => {
        if (response.success) {
          const currentProducts = this._products.value;
          const filteredProducts = currentProducts.filter(p => p.id !== id);
          this._products.next(filteredProducts);
          
          if (this._currentProduct.value?.id === id) {
            this._currentProduct.next(null);
          }
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Change product status
   */
  changeStatus(id: string, status: ProductStatus): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.put<IApiResponse<IProduct>>(`${this._baseUrl}/${id}/status`, { status }).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this._products.value;
          const updatedProducts = currentProducts.map(p => 
            p.id === id ? response.data : p
          );
          this._products.next(updatedProducts);
          this._currentProduct.next(response.data);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  // ===== Bulk Operations =====
  
  /**
   * Bulk create products
   */
  bulkCreate(request: IBulkCreateProductsRequest): Observable<IApiResponse<IBulkOperationResponse>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IApiResponse<IBulkOperationResponse>>(`${this._baseUrl}/bulk/create`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Refresh products list after bulk creation
          this.getAll().subscribe();
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Bulk activate products
   */
  bulkActivate(productIds: string[]): Observable<IApiResponse<IBulkOperationResponse>> {
    return this._bulkOperation('activate', productIds);
  }
  
  /**
   * Bulk deactivate products
   */
  bulkDeactivate(productIds: string[]): Observable<IApiResponse<IBulkOperationResponse>> {
    return this._bulkOperation('deactivate', productIds);
  }
  
  /**
   * Bulk discontinue products
   */
  bulkDiscontinue(productIds: string[]): Observable<IApiResponse<IBulkOperationResponse>> {
    return this._bulkOperation('discontinue', productIds);
  }
  
  /**
   * Bulk delete products
   */
  bulkDelete(productIds: string[]): Observable<IApiResponse<IBulkOperationResponse>> {
    return this._bulkOperation('delete', productIds);
  }
  
  /**
   * Bulk update products
   */
  bulkUpdate(request: IBulkOperationRequest): Observable<IApiResponse<IBulkOperationResponse>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IApiResponse<IBulkOperationResponse>>(`${this._baseUrl}/bulk/update`, request).pipe(
      tap(response => {
        if (response.success) {
          // Refresh products list after bulk update
          this.getAll().subscribe();
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  // ===== Scraping Operations =====
  
  /**
   * Get products ready for scraping
   */
  getProductsForScraping(filters?: IScrapingFilters): Observable<IApiResponse<IProduct[]>> {
    this._setLoading(true);
    this._clearError();
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof IScrapingFilters];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this._http.get<IApiResponse<IProduct[]>>(`${this._baseUrl}/scraping/ready`, { params }).pipe(
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  /**
   * Update scraping metadata
   */
  updateScrapingMetadata(request: IUpdateScrapingRequest): Observable<IApiResponse<IProduct>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IApiResponse<IProduct>>(`${this._baseUrl}/scraping/update`, request).pipe(
      tap(response => {
        if (response.success && response.data) {
          const currentProducts = this._products.value;
          const updatedProducts = currentProducts.map(p => 
            p.id === request.productId ? response.data : p
          );
          this._products.next(updatedProducts);
          this._currentProduct.next(response.data);
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  // ===== Analytics =====
  
  /**
   * Get product analytics
   */
  getAnalytics(): Observable<IApiResponse<IProductAnalytics>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.get<IApiResponse<IProductAnalytics>>(`${this._baseUrl}/analytics`).pipe(
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
  // ===== Utility Methods =====
  
  /**
   * Refresh products list
   */
  refreshProducts(filters?: IProductFilters): void {
    this.getAll(filters).subscribe();
  }
  
  /**
   * Clear current product
   */
  clearCurrentProduct(): void {
    this._currentProduct.next(null);
  }
  
  /**
   * Clear error state
   */
  clearError(): void {
    this._clearError();
  }
  
  // ===== Private Methods =====
  
  private _bulkOperation(operation: string, productIds: string[]): Observable<IApiResponse<IBulkOperationResponse>> {
    this._setLoading(true);
    this._clearError();
    
    return this._http.post<IApiResponse<IBulkOperationResponse>>(`${this._baseUrl}/bulk/${operation}`, { productIds }).pipe(
      tap(response => {
        if (response.success) {
          // Refresh products list after bulk operation
          this.getAll().subscribe();
        }
      }),
      catchError(error => this._handleError(error)),
      finalize(() => this._setLoading(false))
    );
  }
  
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
    console.error('ProductsService Error:', error);
    
    return throwError(() => error);
  }
}

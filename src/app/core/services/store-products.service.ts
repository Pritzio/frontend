import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IStoreProduct } from '../../models/store-product.model';
import { IApiResponse, IPaginatedResponse, IApiFilters } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class StoreProductsService {
  private readonly _apiUrl = `${environment.apiUrl}/store-products`;

  constructor(private _http: HttpClient) {}

  /**
   * Listar productos de tienda con filtros y paginación
   */
  getStoreProducts(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}`, { params });
  }

  /**
   * Crear un nuevo producto de tienda
   */
  createStoreProduct(productData: Partial<IStoreProduct>): Observable<IApiResponse<IStoreProduct>> {
    return this._http.post<IApiResponse<IStoreProduct>>(`${this._apiUrl}`, productData);
  }

  /**
   * Obtener un producto de tienda por ID
   */
  getStoreProductById(id: string): Observable<IApiResponse<IStoreProduct>> {
    return this._http.get<IApiResponse<IStoreProduct>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Actualizar un producto de tienda por ID
   */
  updateStoreProduct(id: string, productData: Partial<IStoreProduct>): Observable<IApiResponse<IStoreProduct>> {
    return this._http.put<IApiResponse<IStoreProduct>>(`${this._apiUrl}/${id}`, productData);
  }

  /**
   * Eliminar un producto de tienda por ID
   */
  deleteStoreProduct(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Buscar productos de tienda por término de búsqueda
   */
  searchStoreProducts(query: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams().set('q', query);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/search`, { params });
  }

  /**
   * Obtener productos de tienda por tienda específica
   */
  getStoreProductsByStore(storeId: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams().set('storeId', storeId);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/store/${storeId}`, { params });
  }

  /**
   * Obtener productos de tienda por producto maestro
   */
  getStoreProductsByProduct(productId: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams().set('productId', productId);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/product/${productId}`, { params });
  }

  /**
   * Obtener productos de tienda por disponibilidad
   */
  getStoreProductsByAvailability(availability: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams().set('availability', availability);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/availability/${availability}`, { params });
  }

  /**
   * Obtener productos de tienda por rango de precios
   */
  getStoreProductsByPriceRange(minPrice: number, maxPrice: number, currency: string = 'USD', filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString())
      .set('currency', currency);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/price-range`, { params });
  }

  /**
   * Obtener productos de tienda con stock disponible
   */
  getStoreProductsInStock(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStoreProduct>>> {
    let params = new HttpParams().set('inStock', 'true');
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStoreProduct>>>(`${this._apiUrl}/in-stock`, { params });
  }
}

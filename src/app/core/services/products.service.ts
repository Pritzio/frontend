import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IProduct } from '../../models/product.model';
import { IApiResponse, IPaginatedResponse, IApiFilters } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly _apiUrl = `${environment.apiUrl}/products`;

  constructor(private _http: HttpClient) {}

  /**
   * Listar productos con filtros y paginación
   */
  getProducts(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}`, { params });
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(productData: Partial<IProduct>): Observable<IApiResponse<IProduct>> {
    return this._http.post<IApiResponse<IProduct>>(`${this._apiUrl}`, productData);
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: string): Observable<IApiResponse<IProduct>> {
    return this._http.get<IApiResponse<IProduct>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Actualizar un producto por ID
   */
  updateProduct(id: string, productData: Partial<IProduct>): Observable<IApiResponse<IProduct>> {
    return this._http.put<IApiResponse<IProduct>>(`${this._apiUrl}/${id}`, productData);
  }

  /**
   * Eliminar un producto por ID
   */
  deleteProduct(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Buscar productos por término de búsqueda
   */
  searchProducts(query: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('q', query);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/search`, { params });
  }

  /**
   * Obtener productos por categoría
   */
  getProductsByCategory(category: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('category', category);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/category/${category}`, { params });
  }

  /**
   * Obtener productos por marca
   */
  getProductsByBrand(brand: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('brand', brand);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/brand/${brand}`, { params });
  }

  /**
   * Obtener productos por estado
   */
  getProductsByStatus(status: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('status', status);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/status/${status}`, { params });
  }

  /**
   * Obtener productos por tipo
   */
  getProductsByType(type: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('type', type);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/type/${type}`, { params });
  }

  /**
   * Obtener productos por condición
   */
  getProductsByCondition(condition: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IProduct>>> {
    let params = new HttpParams().set('condition', condition);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IProduct>>>(`${this._apiUrl}/condition/${condition}`, { params });
  }
}

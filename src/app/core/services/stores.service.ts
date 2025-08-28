import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IStore } from '../../models/store.model';
import { IApiResponse, IPaginatedResponse, IApiFilters } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private readonly _apiUrl = `${environment.apiUrl}/stores`;

  constructor(private _http: HttpClient) {}

  /**
   * Listar tiendas con filtros y paginación
   */
  getStores(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStore>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStore>>>(`${this._apiUrl}`, { params });
  }

  /**
   * Crear una nueva tienda
   */
  createStore(storeData: Partial<IStore>): Observable<IApiResponse<IStore>> {
    return this._http.post<IApiResponse<IStore>>(`${this._apiUrl}`, storeData);
  }

  /**
   * Obtener una tienda por ID
   */
  getStoreById(id: string): Observable<IApiResponse<IStore>> {
    return this._http.get<IApiResponse<IStore>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Actualizar una tienda por ID
   */
  updateStore(id: string, storeData: Partial<IStore>): Observable<IApiResponse<IStore>> {
    return this._http.put<IApiResponse<IStore>>(`${this._apiUrl}/${id}`, storeData);
  }

  /**
   * Eliminar una tienda por ID
   */
  deleteStore(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Obtener productos de una tienda específica
   */
  getStoreProducts(storeId: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<any>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<any>>>(`${this._apiUrl}/${storeId}/products`, { params });
  }

  /**
   * Buscar tiendas por término de búsqueda
   */
  searchStores(query: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStore>>> {
    let params = new HttpParams().set('q', query);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStore>>>(`${this._apiUrl}/search`, { params });
  }

  /**
   * Obtener tiendas por categoría
   */
  getStoresByCategory(category: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStore>>> {
    let params = new HttpParams().set('category', category);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStore>>>(`${this._apiUrl}/category/${category}`, { params });
  }

  /**
   * Obtener tiendas verificadas
   */
  getVerifiedStores(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStore>>> {
    let params = new HttpParams().set('verified', 'true');
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IStore>>>(`${this._apiUrl}/verified`, { params });
  }
}

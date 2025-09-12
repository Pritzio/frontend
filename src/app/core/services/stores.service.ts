import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IStore, IStoreLocation, IStoreAnalytics, IStoreFilters } from '../../models/store.model';
import { IApiResponse, IPaginatedResponse } from '../../models/api.model';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  private readonly _apiUrl = `${environment.apiUrl}/stores`;

  constructor(
    private _http: HttpClient,
    private _alertService: AlertService
  ) {}

  // ===== Store Management =====

  /**
   * Get all stores with filters and pagination
   */
  getStores(filters: IStoreFilters = {}): Observable<IApiResponse<IPaginatedResponse<IStore>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.country) params = params.set('country', filters.country);
    if (filters.isVerified !== undefined) params = params.set('isVerified', filters.isVerified.toString());
    if (filters.hasPhysicalLocations !== undefined) params = params.set('hasPhysicalLocations', filters.hasPhysicalLocations.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.createdAfter) params = params.set('createdAfter', filters.createdAfter.toISOString());
    if (filters.createdBefore) params = params.set('createdBefore', filters.createdBefore.toISOString());

    return this._http.get<IApiResponse<IPaginatedResponse<IStore>>>(`${this._apiUrl}`, { 
      params,
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Create a new store
   */
  createStore(storeData: Partial<IStore>): Observable<IApiResponse<IStore>> {
    return this._http.post<IApiResponse<IStore>>(`${this._apiUrl}`, storeData, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Get store by ID
   */
  getStoreById(id: string): Observable<IApiResponse<IStore>> {
    return this._http.get<IApiResponse<IStore>>(`${this._apiUrl}/${id}`, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Get store by ID for admin purposes
   */
  getAdminStoreById(id: string): Observable<any> {
    return this._http.get<any>(`${this._apiUrl}/${id}`, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Update store by ID
   */
  updateStore(id: string, storeData: Partial<IStore>): Observable<IApiResponse<IStore>> {
    return this._http.put<IApiResponse<IStore>>(`${this._apiUrl}/${id}`, storeData, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Delete store by ID
   */
  deleteStore(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  // ===== Store Locations Management =====

  /**
   * Add physical location to store
   */
  addStoreLocation(storeId: string, locationData: Partial<IStoreLocation>): Observable<IApiResponse<IStoreLocation>> {
    return this._http.post<IApiResponse<IStoreLocation>>(`${this._apiUrl}/${storeId}/locations`, locationData, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Update physical location
   */
  updateStoreLocation(locationId: string, locationData: Partial<IStoreLocation>): Observable<IApiResponse<IStoreLocation>> {
    return this._http.put<IApiResponse<IStoreLocation>>(`${this._apiUrl}/locations/${locationId}`, locationData, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Delete physical location
   */
  deleteStoreLocation(locationId: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/locations/${locationId}`, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  // ===== Analytics =====

  /**
   * Get store analytics
   */
  getStoreAnalytics(storeId: string): Observable<IApiResponse<IStoreAnalytics>> {
    return this._http.get<IApiResponse<IStoreAnalytics>>(`${this._apiUrl}/${storeId}/analytics`, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  // ===== Admin Functions =====

  /**
   * Get stores for admin purposes
   */
  getAdminStores(filters: IStoreFilters = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.isVerified !== undefined) params = params.set('isVerified', filters.isVerified.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.country) params = params.set('country', filters.country);

    return this._http.get<any>(`${this._apiUrl}/admin`, { 
      params,
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Verify store
   */
  verifyStore(storeId: string): Observable<IApiResponse<IStore>> {
    const url = `${this._apiUrl}/admin/${storeId}/verify`;
    console.log('🔍 Verifying store with URL:', url);
    console.log('🔍 Store ID:', storeId);
    console.log('🔍 Headers:', this._getAuthHeaders());
    
    return this._http.put<IApiResponse<IStore>>(url, {}, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Error in verifyStore:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error URL:', error.url);
        return this._handleError(error);
      })
    );
  }

  /**
   * Suspend store
   */
  suspendStore(storeId: string): Observable<IApiResponse<IStore>> {
    return this._http.put<IApiResponse<IStore>>(`${this._apiUrl}/admin/${storeId}/suspend`, {}, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  /**
   * Reactivate store
   */
  reactivateStore(storeId: string): Observable<IApiResponse<IStore>> {
    return this._http.put<IApiResponse<IStore>>(`${this._apiUrl}/admin/${storeId}/reactivate`, {}, {
      headers: this._getAuthHeaders()
    }).pipe(
      catchError(error => this._handleError(error))
    );
  }

  // ===== Private Methods =====

  /**
   * Get authentication headers
   */
  private _getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.error('No access token found in localStorage');
      return new HttpHeaders();
    }
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Handle HTTP errors
   */
  private _handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    this._alertService.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

// Interfaces based on backend documentation
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  totalStores: number;
  verifiedStores: number;
  pendingStores: number;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  type: 'INDIVIDUAL' | 'BUSINESS' | 'SYSTEM';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  website: string;
  logo?: string;
  type: 'ONLINE' | 'PHYSICAL' | 'HYBRID';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  category: string;
  phone?: string;
  email?: string;
  country?: string;
  timezone?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  code: string;
  sku?: string;
  barcode?: string;
  image?: string;
  brand?: string;
  category: string;
  subcategory?: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE' | 'SUBSCRIPTION';
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK' | 'COMING_SOON';
  condition: 'NEW' | 'USED' | 'REFURBISHED' | 'OPEN_BOX';
  model?: string;
  manufacturer?: string;
  country?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  dimensionsUnit?: string;
  createdAt: Date;
  updatedAt: Date;
}



@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly _apiUrl = environment.apiUrl; // Removido el /api/v1 duplicado
  
  private _dashboardStats = new BehaviorSubject<DashboardStats | null>(null);
  private _users = new BehaviorSubject<User[]>([]);
  private _stores = new BehaviorSubject<Store[]>([]);
  private _products = new BehaviorSubject<Product[]>([]);

  public dashboardStats$ = this._dashboardStats.asObservable();
  public users$ = this._users.asObservable();
  public stores$ = this._stores.asObservable();
  public products$ = this._products.asObservable();

  constructor(private _http: HttpClient) {}

  // Dashboard Statistics (deprecated - use StatisticsService instead)
  getDashboardStats(): Observable<DashboardStats> {
    console.warn('getDashboardStats is deprecated. Use StatisticsService instead.');
    const fallbackStats: DashboardStats = {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      suspendedUsers: 0,
      totalStores: 0,
      verifiedStores: 0,
      pendingStores: 0,
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0
    };
    this._dashboardStats.next(fallbackStats);
    return of(fallbackStats);
  }

  // Users Management
  getUsers(filters?: any): Observable<User[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this._http.get<{ success: boolean; data: User[] }>(`${this._apiUrl}/users`, { params })
      .pipe(
        map(response => response.data),
        tap(users => this._users.next(users))
      );
  }

  getUserById(id: string): Observable<User> {
    return this._http.get<{ success: boolean; data: User }>(`${this._apiUrl}/users/${id}`)
      .pipe(map(response => response.data));
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this._http.put<{ success: boolean; data: User }>(`${this._apiUrl}/users/${id}`, userData)
      .pipe(map(response => response.data));
  }

  deleteUser(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/users/${id}`);
  }

  suspendUser(id: string): Observable<User> {
    return this.updateUser(id, { status: 'SUSPENDED' });
  }

  activateUser(id: string): Observable<User> {
    return this.updateUser(id, { status: 'ACTIVE' });
  }

  // Stores Management
  getStores(filters?: any): Observable<Store[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this._http.get<{ success: boolean; data: Store[] }>(`${this._apiUrl}/stores`, { params })
      .pipe(
        map(response => response.data),
        tap(stores => this._stores.next(stores))
      );
  }

  getStoreById(id: string): Observable<Store> {
    return this._http.get<{ success: boolean; data: Store }>(`${this._apiUrl}/stores/${id}`)
      .pipe(map(response => response.data));
  }

  createStore(storeData: Partial<Store>): Observable<Store> {
    return this._http.post<{ success: boolean; data: Store }>(`${this._apiUrl}/stores`, storeData)
      .pipe(map(response => response.data));
  }

  updateStore(id: string, storeData: Partial<Store>): Observable<Store> {
    return this._http.put<{ success: boolean; data: Store }>(`${this._apiUrl}/stores/${id}`, storeData)
      .pipe(map(response => response.data));
  }

  deleteStore(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/stores/${id}`);
  }

  verifyStore(id: string): Observable<Store> {
    return this.updateStore(id, { 
      status: 'ACTIVE', 
      isVerified: true, 
      verifiedAt: new Date() 
    });
  }

  // Products Management
  getProducts(filters?: any): Observable<Product[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this._http.get<{ success: boolean; data: Product[] }>(`${this._apiUrl}/products`, { params })
      .pipe(
        map(response => response.data),
        tap(products => this._products.next(products))
      );
  }

  getProductById(id: string): Observable<Product> {
    return this._http.get<{ success: boolean; data: Product }>(`${this._apiUrl}/products/${id}`)
      .pipe(map(response => response.data));
  }

  createProduct(productData: Partial<Product>): Observable<Product> {
    return this._http.post<{ success: boolean; data: Product }>(`${this._apiUrl}/products`, productData)
      .pipe(map(response => response.data));
  }

  updateProduct(id: string, productData: Partial<Product>): Observable<Product> {
    return this._http.put<{ success: boolean; data: Product }>(`${this._apiUrl}/products/${id}`, productData)
      .pipe(map(response => response.data));
  }

  deleteProduct(id: string): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/products/${id}`);
  }



  // Refresh all data (deprecated - dashboard stats removed)
  refreshAllData(): void {
    console.warn('refreshAllData is deprecated. Call individual methods or use StatisticsService.');
    this.getUsers().subscribe();
    this.getStores().subscribe();
    this.getProducts().subscribe();
  }
}

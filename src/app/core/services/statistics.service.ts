import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  pendingVerification: number;
  suspended: number;
  deleted: number;
}

export interface StoreStatistics {
  total: number;
  verified: number;
  pendingVerification: number;
  suspended: number;
  deleted: number;
}

export interface ProductStatistics {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}

export interface StoreProductStatistics {
  total: number;
  withCategories: number;
  withoutCategories: number;
  lastScraped: number;
}

export interface CategoryStatistics {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
  withoutProducts: number;
}

export interface SystemStatistics {
  users: UserStatistics;
  stores: StoreStatistics;
  products: ProductStatistics;
  storeProducts: StoreProductStatistics;
  categories: CategoryStatistics;
  lastUpdated: string;
}

export interface UsersByRole {
  [key: string]: number;
}

export interface StoresByStatus {
  [key: string]: number;
}

export interface ProductsByCategory {
  [key: string]: number;
}

export interface StoreProductsByCategory {
  [key: string]: number;
}

export interface CategoriesByStatus {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly _apiUrl = `${environment.apiUrl}/statistics`;
  
  private _userStatistics = new BehaviorSubject<UserStatistics | null>(null);
  private _storeStatistics = new BehaviorSubject<StoreStatistics | null>(null);
  private _productStatistics = new BehaviorSubject<ProductStatistics | null>(null);
  private _storeProductStatistics = new BehaviorSubject<StoreProductStatistics | null>(null);
  private _categoryStatistics = new BehaviorSubject<CategoryStatistics | null>(null);
  private _systemStatistics = new BehaviorSubject<SystemStatistics | null>(null);
  private _usersByRole = new BehaviorSubject<UsersByRole | null>(null);
  private _storesByStatus = new BehaviorSubject<StoresByStatus | null>(null);
  private _productsByCategory = new BehaviorSubject<ProductsByCategory | null>(null);
  private _storeProductsByCategory = new BehaviorSubject<StoreProductsByCategory | null>(null);
  private _categoriesByStatus = new BehaviorSubject<CategoriesByStatus | null>(null);
  
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _error = new BehaviorSubject<string | null>(null);

  public userStatistics$ = this._userStatistics.asObservable();
  public storeStatistics$ = this._storeStatistics.asObservable();
  public productStatistics$ = this._productStatistics.asObservable();
  public storeProductStatistics$ = this._storeProductStatistics.asObservable();
  public categoryStatistics$ = this._categoryStatistics.asObservable();
  public systemStatistics$ = this._systemStatistics.asObservable();
  public usersByRole$ = this._usersByRole.asObservable();
  public storesByStatus$ = this._storesByStatus.asObservable();
  public productsByCategory$ = this._productsByCategory.asObservable();
  public storeProductsByCategory$ = this._storeProductsByCategory.asObservable();
  public categoriesByStatus$ = this._categoriesByStatus.asObservable();
  
  public isLoading$ = this._isLoading.asObservable();
  public error$ = this._error.asObservable();

  constructor(private _http: HttpClient) {}

  getUserStatistics(): Observable<UserStatistics> {
    return this._http.get<UserStatistics>(`${this._apiUrl}/users`).pipe(
      tap(stats => this._userStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching user statistics:', error);
        this._error.next('Error loading user statistics');
        return of({
          total: 0,
          active: 0,
          inactive: 0,
          pendingVerification: 0,
          suspended: 0,
          deleted: 0
        });
      })
    );
  }

  getStoreStatistics(): Observable<StoreStatistics> {
    return this._http.get<StoreStatistics>(`${this._apiUrl}/stores`).pipe(
      tap(stats => this._storeStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching store statistics:', error);
        this._error.next('Error loading store statistics');
        return of({
          total: 0,
          verified: 0,
          pendingVerification: 0,
          suspended: 0,
          deleted: 0
        });
      })
    );
  }

  getProductStatistics(): Observable<ProductStatistics> {
    return this._http.get<ProductStatistics>(`${this._apiUrl}/products`).pipe(
      tap(stats => this._productStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching product statistics:', error);
        this._error.next('Error loading product statistics');
        return of({
          total: 0,
          active: 0,
          inactive: 0,
          deleted: 0
        });
      })
    );
  }

  getSystemStatistics(): Observable<SystemStatistics> {
    return this._http.get<SystemStatistics>(`${this._apiUrl}/system`).pipe(
      tap(stats => this._systemStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching system statistics:', error);
        this._error.next('Error loading system statistics');
        const fallbackStats: SystemStatistics = {
          users: {
            total: 0,
            active: 0,
            inactive: 0,
            pendingVerification: 0,
            suspended: 0,
            deleted: 0
          },
          stores: {
            total: 0,
            verified: 0,
            pendingVerification: 0,
            suspended: 0,
            deleted: 0
          },
          products: {
            total: 0,
            active: 0,
            inactive: 0,
            deleted: 0
          },
          storeProducts: {
            total: 0,
            withCategories: 0,
            withoutCategories: 0,
            lastScraped: 0
          },
          categories: {
            total: 0,
            active: 0,
            inactive: 0,
            withProducts: 0,
            withoutProducts: 0
          },
          lastUpdated: new Date().toISOString()
        };
        return of(fallbackStats);
      })
    );
  }

  getUsersByRole(): Observable<UsersByRole> {
    return this._http.get<UsersByRole>(`${this._apiUrl}/users/by-role`).pipe(
      tap(stats => this._usersByRole.next(stats)),
      catchError(error => {
        console.error('Error fetching users by role:', error);
        this._error.next('Error loading users by role');
        return of({});
      })
    );
  }

  getStoresByStatus(): Observable<StoresByStatus> {
    return this._http.get<StoresByStatus>(`${this._apiUrl}/stores/by-status`).pipe(
      tap(stats => this._storesByStatus.next(stats)),
      catchError(error => {
        console.error('Error fetching stores by status:', error);
        this._error.next('Error loading stores by status');
        return of({});
      })
    );
  }

  getProductsByCategory(): Observable<ProductsByCategory> {
    return this._http.get<ProductsByCategory>(`${this._apiUrl}/products/by-category`).pipe(
      tap(stats => this._productsByCategory.next(stats)),
      catchError(error => {
        console.error('Error fetching products by category:', error);
        this._error.next('Error loading products by category');
        return of({});
      })
    );
  }

  getStoreProductStatistics(): Observable<StoreProductStatistics> {
    return this._http.get<StoreProductStatistics>(`${this._apiUrl}/store-products`).pipe(
      tap(stats => this._storeProductStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching store product statistics:', error);
        this._error.next('Error loading store product statistics');
        return of({
          total: 0,
          withCategories: 0,
          withoutCategories: 0,
          lastScraped: 0
        });
      })
    );
  }

  getCategoryStatistics(): Observable<CategoryStatistics> {
    return this._http.get<CategoryStatistics>(`${this._apiUrl}/categories`).pipe(
      tap(stats => this._categoryStatistics.next(stats)),
      catchError(error => {
        console.error('Error fetching category statistics:', error);
        this._error.next('Error loading category statistics');
        return of({
          total: 0,
          active: 0,
          inactive: 0,
          withProducts: 0,
          withoutProducts: 0
        });
      })
    );
  }

  getStoreProductsByCategory(): Observable<StoreProductsByCategory> {
    return this._http.get<StoreProductsByCategory>(`${this._apiUrl}/store-products/by-category`).pipe(
      tap(stats => this._storeProductsByCategory.next(stats)),
      catchError(error => {
        console.error('Error fetching store products by category:', error);
        this._error.next('Error loading store products by category');
        return of({});
      })
    );
  }

  getCategoriesByStatus(): Observable<CategoriesByStatus> {
    return this._http.get<CategoriesByStatus>(`${this._apiUrl}/categories/by-status`).pipe(
      tap(stats => this._categoriesByStatus.next(stats)),
      catchError(error => {
        console.error('Error fetching categories by status:', error);
        this._error.next('Error loading categories by status');
        return of({});
      })
    );
  }

  loadAllStatistics(): Observable<SystemStatistics> {
    this._isLoading.next(true);
    this._error.next(null);

    return combineLatest([
      this.getUserStatistics(),
      this.getStoreStatistics(),
      this.getProductStatistics(),
      this.getStoreProductStatistics(),
      this.getCategoryStatistics(),
      this.getUsersByRole(),
      this.getStoresByStatus(),
      this.getProductsByCategory(),
      this.getStoreProductsByCategory(),
      this.getCategoriesByStatus()
    ]).pipe(
      map(([users, stores, products, storeProducts, categories, usersByRole, storesByStatus, productsByCategory, storeProductsByCategory, categoriesByStatus]) => {
        const systemStats: SystemStatistics = {
          users,
          stores,
          products,
          storeProducts,
          categories,
          lastUpdated: new Date().toISOString()
        };
        this._systemStatistics.next(systemStats);
        return systemStats;
      }),
      tap(() => this._isLoading.next(false)),
      catchError(error => {
        console.error('Error loading all statistics:', error);
        this._error.next('Error loading statistics');
        this._isLoading.next(false);
        const fallbackStats: SystemStatistics = {
          users: {
            total: 0,
            active: 0,
            inactive: 0,
            pendingVerification: 0,
            suspended: 0,
            deleted: 0
          },
          stores: {
            total: 0,
            verified: 0,
            pendingVerification: 0,
            suspended: 0,
            deleted: 0
          },
          products: {
            total: 0,
            active: 0,
            inactive: 0,
            deleted: 0
          },
          storeProducts: {
            total: 0,
            withCategories: 0,
            withoutCategories: 0,
            lastScraped: 0
          },
          categories: {
            total: 0,
            active: 0,
            inactive: 0,
            withProducts: 0,
            withoutProducts: 0
          },
          lastUpdated: new Date().toISOString()
        };
        return of(fallbackStats);
      })
    );
  }

  refreshStatistics(): void {
    this.loadAllStatistics().subscribe();
  }

  clearError(): void {
    this._error.next(null);
  }
}


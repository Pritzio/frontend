import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ICategoryResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
}

export interface ICreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface IUpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Get all active categories
   */
  getAll(): Observable<ICategoryResponse[]> {
    return this.http.get<ICategoryResponse[]>(this.baseUrl);
  }

  /**
   * Get categories with product counts
   */
  getWithCounts(): Observable<ICategoryResponse[]> {
    return this.http.get<ICategoryResponse[]>(`${this.baseUrl}/with-counts`);
  }

  /**
   * Get category by ID
   */
  getById(id: string): Observable<ICategoryResponse> {
    return this.http.get<ICategoryResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create new category
   */
  create(categoryData: ICreateCategoryDto): Observable<ICategoryResponse> {
    return this.http.post<ICategoryResponse>(this.baseUrl, categoryData);
  }

  /**
   * Update category
   */
  update(id: string, categoryData: IUpdateCategoryDto): Observable<ICategoryResponse> {
    return this.http.put<ICategoryResponse>(`${this.baseUrl}/${id}`, categoryData);
  }

  /**
   * Delete category (soft delete)
   */
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}


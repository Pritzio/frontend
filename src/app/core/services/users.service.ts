import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IUser } from '../../models/user.model';
import { IApiResponse, IPaginatedResponse, IApiFilters } from '../../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly _apiUrl = `${environment.apiUrl}/users`;

  constructor(private _http: HttpClient) {}

  /**
   * Get authenticated user profile
   */
  getProfile(): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._apiUrl}/profile`);
  }

  /**
   * Update authenticated user profile
   */
  updateProfile(userData: Partial<IUser>): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/profile`, userData);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Update user by ID
   */
  updateUser(id: string, userData: Partial<IUser>): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/${id}`, userData);
  }

  /**
   * Delete user by ID (soft delete)
   */
  deleteUser(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`);
  }

  /**
   * List users with filters and pagination (Admin)
   */
  getUsers(filters: IApiFilters = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<any>(`${this._apiUrl}/admin/users`, { params });
  }

  /**
   * Search users by search term
   */
  searchUsers(query: string, filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IUser>>> {
    let params = new HttpParams().set('q', query);
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IUser>>>(`${this._apiUrl}/search`, { params });
  }

  /**
   * Verify user email
   */
  verifyEmail(token: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/verify-email`, { token });
  }

  /**
   * Change authenticated user password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Get user profile by ID
   */
  getUserProfileById(userId: string): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._apiUrl}/profile/${userId}`);
  }

  /**
   * Get user activity
   */
  getUserActivity(): Observable<IApiResponse<any>> {
    return this._http.get<IApiResponse<any>>(`${this._apiUrl}/activity`);
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<IApiResponse<any>> {
    return this._http.get<IApiResponse<any>>(`${this._apiUrl}/stats`);
  }

  /**
   * Update own profile for authenticated user
   */
  updateOwnProfile(userData: Partial<IUser>): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/profile`, userData);
  }

  /**
   * Delete own profile for authenticated user
   */
  deleteOwnProfile(): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/profile`);
  }

  /**
   * Update user status (active, suspended, etc.)
   */
  updateUserStatus(id: string, status: string): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/${id}/status`, { status });
  }

  /**
   * Restore deleted user (soft delete)
   */
  restoreUser(id: string): Observable<IApiResponse<IUser>> {
    return this._http.post<IApiResponse<IUser>>(`${this._apiUrl}/${id}/restore`, {});
  }
}

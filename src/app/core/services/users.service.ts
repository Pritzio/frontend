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
   * Obtener el perfil del usuario autenticado
   */
  getProfile(): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._apiUrl}/profile`);
  }

  /**
   * Actualizar el perfil del usuario autenticado
   */
  updateProfile(userData: Partial<IUser>): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/profile`, userData);
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: string): Observable<IApiResponse<IUser>> {
    return this._http.get<IApiResponse<IUser>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Actualizar un usuario por ID
   */
  updateUser(id: string, userData: Partial<IUser>): Observable<IApiResponse<IUser>> {
    return this._http.put<IApiResponse<IUser>>(`${this._apiUrl}/${id}`, userData);
  }

  /**
   * Eliminar un usuario por ID
   */
  deleteUser(id: string): Observable<IApiResponse<void>> {
    return this._http.delete<IApiResponse<void>>(`${this._apiUrl}/${id}`);
  }

  /**
   * Listar usuarios con filtros y paginación
   */
  getUsers(filters: IApiFilters = {}): Observable<IApiResponse<IPaginatedResponse<IUser>>> {
    let params = new HttpParams();
    
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params = params.set('sortOrder', filters.sortOrder);

    return this._http.get<IApiResponse<IPaginatedResponse<IUser>>>(`${this._apiUrl}`, { params });
  }

  /**
   * Buscar usuarios por término de búsqueda
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
   * Verificar email del usuario
   */
  verifyEmail(token: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/verify-email`, { token });
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  changePassword(currentPassword: string, newPassword: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  forgotPassword(email: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/forgot-password`, { email });
  }

  /**
   * Restablecer contraseña con token
   */
  resetPassword(token: string, newPassword: string): Observable<IApiResponse<{ message: string }>> {
    return this._http.post<IApiResponse<{ message: string }>>(`${this._apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }
}

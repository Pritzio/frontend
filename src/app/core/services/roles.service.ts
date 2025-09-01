import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { IRole } from '../../features/admin/users/interfaces';
import { IApiResponse } from '../../models/api.model';
import { UserRoles } from '../../features/admin/users/enums';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly _apiUrl = `${environment.apiUrl}/auth/roles`;
  private _rolesCache$ = new BehaviorSubject<IRole[]>([]);
  private _rolesLoaded = false;

  constructor(private _http: HttpClient) {}

  /**
   * Get all available roles from backend using multiple strategies
   */
  getAllRoles(): Observable<IRole[]> {
    if (this._rolesLoaded) {
      return this._rolesCache$.asObservable();
    }

    // Strategy 1: Try dedicated roles endpoint (/auth/roles/all)
    const rolesAllUrl = `${this._apiUrl}/all`;
    return this._http.get<IApiResponse<IRole[]>>(rolesAllUrl)
      .pipe(
        map(response => {
          // The /auth/roles/all endpoint returns the roles directly or in a data property
          const roles = response.data || response || [];
          
          // Convert backend role format to frontend IRole format
          const formattedRoles: IRole[] = roles.map((role: any) => ({
            id: role.id,
            name: role.name,
            displayName: role.displayName || role.name,
            description: role.description || `Role: ${role.name}`,
            isActive: true // All roles from backend are considered active
          }));
          
          return formattedRoles;
        }),
        tap(roles => {
          if (roles.length > 0) {
            this._rolesCache$.next(roles);
            this._rolesLoaded = true;
          }
        }),
        switchMap(roles => {
          if (roles.length > 0) {
            return of(roles);
          } else {
            throw new Error('No roles found in dedicated endpoint');
          }
        }),
        catchError((error) => {
          // Strategy 2: Extract roles from existing users
          return this.getRolesFromUsers().pipe(
            tap(roles => {
              this._rolesCache$.next(roles);
              this._rolesLoaded = true;
            }),
            catchError((userError) => {
              // Strategy 3: Try to get roles from auth profile
              return this._http.get<any>(`${environment.apiUrl}/auth/profile`).pipe(
                map(response => {
                  const user = response.data || response;
                  const rolesFromProfile: IRole[] = [];
                  
                  if (user.roles && Array.isArray(user.roles)) {
                    user.roles.forEach((role: any) => {
                      if (role.id && role.name) {
                        rolesFromProfile.push({
                          id: role.id,
                          name: role.name,
                          displayName: role.displayName || role.name,
                          description: role.description,
                          isActive: true
                        });
                      }
                    });
                  }
                  
                  if (rolesFromProfile.length > 0) {
                    return rolesFromProfile;
                  } else {
                    throw new Error('No roles found in auth profile');
                  }
                }),
                catchError(() => {
                  return of(this._getMockRoles());
                })
              );
            })
          );
        })
      );
  }

  /**
   * Get role by name
   */
  getRoleByName(roleName: string): Observable<IRole | null> {
    return this.getAllRoles().pipe(
      map(roles => roles.find(role => role.name.toLowerCase() === roleName.toLowerCase()) || null)
    );
  }

  /**
   * Get role by ID
   */
  getRoleById(roleId: string): Observable<IRole | null> {
    return this.getAllRoles().pipe(
      map(roles => roles.find(role => role.id === roleId) || null)
    );
  }

  /**
   * Get roles by names array
   */
  getRolesByNames(roleNames: string[]): Observable<IRole[]> {
    return this.getAllRoles().pipe(
      map(roles => roles.filter(role => 
        roleNames.some(name => name.toLowerCase() === role.name.toLowerCase())
      ))
    );
  }

  /**
   * Clear roles cache - useful when roles might have changed
   */
  clearCache(): void {
    this._rolesLoaded = false;
    this._rolesCache$.next([]);
  }

  /**
   * Get roles from existing users in the system
   * This is a workaround to get real role UUIDs from the backend
   */
  getRolesFromUsers(): Observable<IRole[]> {
    // Try to get roles from multiple users to extract all possible role UUIDs
    return this._http.get<any>(`${environment.apiUrl}/users/admin/users?limit=50`)
      .pipe(
        map(response => {
          const users = response.users || response.data || [];
          const rolesMap = new Map<string, IRole>();
          
          // Extract unique roles from users
          users.forEach((user: any) => {
            if (user.roles && Array.isArray(user.roles)) {
              user.roles.forEach((role: any) => {
                if (role.id && role.name && !rolesMap.has(role.name)) {
                  rolesMap.set(role.name, {
                    id: role.id,
                    name: role.name,
                    displayName: role.displayName || this._getRoleDisplayName(role.name),
                    description: role.description || `Role: ${role.name}`,
                    isActive: true
                  });
                }
              });
            }
          });
          
          const extractedRoles = Array.from(rolesMap.values());
          
          if (extractedRoles.length > 0) {
            return extractedRoles;
          } else {
            return this._getMockRoles();
          }
        }),
        catchError((error) => {
          return of(this._getMockRoles());
        })
      );
  }

  private _getRoleDisplayName(roleName: string): string {
    const roleDisplayNames: { [key: string]: string } = {
      'super_admin': 'Super Administrator',
      'admin': 'Administrator',
      'store_admin': 'Store Administrator',
      'store_manager': 'Store Manager',
      'store_employee': 'Store Employee',
      'customer': 'Customer',
      'guest': 'Guest'
    };
    
    return roleDisplayNames[roleName.toLowerCase()] || roleName;
  }

  /**
   * Mock roles data for development/fallback
   * In production, this should be replaced with real backend data
   */
  private _getMockRoles(): IRole[] {
    const mockRoles = [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: UserRoles.SUPER_ADMIN,
        displayName: 'Super Administrator',
        description: 'Full system access',
        isActive: true
      },
      {
        id: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
        name: UserRoles.ADMIN,
        displayName: 'Administrator',
        description: 'Administrative access',
        isActive: true
      },
      {
        id: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
        name: UserRoles.STORE_ADMIN,
        displayName: 'Store Administrator',
        description: 'Store management access',
        isActive: true
      },
      {
        id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
        name: UserRoles.STORE_MANAGER,
        displayName: 'Store Manager',
        description: 'Store operations management',
        isActive: true
      },
      {
        id: 'e5f6g7h8-i9j0-1234-efgh-567890123456',
        name: UserRoles.STORE_EMPLOYEE,
        displayName: 'Store Employee',
        description: 'Store operations access',
        isActive: true
      },
      {
        id: 'f6g7h8i9-j0k1-2345-fghi-678901234567',
        name: UserRoles.CUSTOMER,
        displayName: 'Customer',
        description: 'Customer access',
        isActive: true
      },
      {
        id: 'g7h8i9j0-k1l2-3456-ghij-789012345678',
        name: UserRoles.GUEST,
        displayName: 'Guest',
        description: 'Limited guest access',
        isActive: true
      }
    ];
    
    return mockRoles;
  }
}
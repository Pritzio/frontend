import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { IAdminUser } from '../../features/admin/users/interfaces';
import { UserRoles, ROLE_HIERARCHY, ADMIN_ROLES } from '../../features/admin/users/enums';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

  constructor(private _authService: AuthService) {}

  /**
   * Check if current user can edit another user
   */
  public canEditUser(targetUser: IAdminUser): boolean {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser || !targetUser) return false;

    const currentUserRole = this._getCurrentUserRole(currentUser);
    const targetUserRole = this._getHighestRole(targetUser);

    // Super admin can edit anyone except other super admins (unless they are the same user)
    if (currentUserRole === UserRoles.SUPER_ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN || currentUser.id === targetUser.id;
    }

    // Admin can edit users but not super admin or other admins
    if (currentUserRole === UserRoles.ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN && targetUserRole !== UserRoles.ADMIN;
    }

    return false;
  }

  /**
   * Check if current user can delete another user
   */
  public canDeleteUser(targetUser: IAdminUser): boolean {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser || !targetUser) return false;

    const currentUserRole = this._getCurrentUserRole(currentUser);
    const targetUserRole = this._getHighestRole(targetUser);

    // Super admin can delete anyone except other super admins
    if (currentUserRole === UserRoles.SUPER_ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN;
    }

    // Admin can delete users but not super admin or other admins
    if (currentUserRole === UserRoles.ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN && targetUserRole !== UserRoles.ADMIN;
    }

    return false;
  }

  /**
   * Check if current user can change roles of another user
   */
  public canChangeUserRoles(targetUser: IAdminUser): boolean {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser || !targetUser) return false;

    const currentUserRole = this._getCurrentUserRole(currentUser);
    const targetUserRole = this._getHighestRole(targetUser);

    // Super admin can change roles of anyone except other super admins
    if (currentUserRole === UserRoles.SUPER_ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN;
    }

    // Admin can change roles but not for super admin or other admins
    if (currentUserRole === UserRoles.ADMIN) {
      return targetUserRole !== UserRoles.SUPER_ADMIN && targetUserRole !== UserRoles.ADMIN;
    }

    return false;
  }

  /**
   * Get available roles that current user can assign
   */
  public getAssignableRoles(targetUser?: IAdminUser): UserRoles[] {
    const currentUser = this._authService.getCurrentUser();
    if (!currentUser) {
      console.warn('🚫 No current user found for role assignment');
      return [];
    }

    const currentUserRole = this._getCurrentUserRole(currentUser);
    let availableRoles: UserRoles[] = [];

    // Role assignment logic
    if (currentUserRole === UserRoles.SUPER_ADMIN) {
      // Super admin can assign any role EXCEPT super_admin unless transferring
      availableRoles = Object.values(UserRoles).filter(role => {
        if (role === UserRoles.SUPER_ADMIN) {
          // Only allow super_admin assignment if target user is not already super_admin
          // This allows for role transfer
          if (targetUser) {
            const targetUserHighestRole = this._getHighestRole(targetUser);
            return targetUserHighestRole !== UserRoles.SUPER_ADMIN;
          }
          return false; // No target user, don't allow super_admin assignment
        }
        return true;
      });
    } else if (currentUserRole === UserRoles.ADMIN) {
      // Admin can assign most roles but not super admin
      availableRoles = Object.values(UserRoles).filter(role => 
        role !== UserRoles.SUPER_ADMIN
      );
    } else {
      // For other roles, allow basic role assignment
      availableRoles = [UserRoles.CUSTOMER, UserRoles.GUEST, UserRoles.STORE_EMPLOYEE];
    }

    return availableRoles;
  }

  /**
   * Check if a role can be assigned considering the "only one super admin" rule
   */
  public canAssignRole(role: UserRoles, targetUser: IAdminUser, allUsers: IAdminUser[]): Observable<boolean> {
    // For super admin role, check if there's already one
    if (role === UserRoles.SUPER_ADMIN) {
      const existingSuperAdmin = allUsers.find(user => 
        user.id !== targetUser.id && this._getHighestRole(user) === UserRoles.SUPER_ADMIN
      );
      return of(!existingSuperAdmin);
    }

    return of(true);
  }

  /**
   * Get the highest role of a user
   */
  public getHighestRole(user: IAdminUser): UserRoles {
    return this._getHighestRole(user);
  }

  /**
   * Check if user has admin privileges
   */
  public isAdmin(user: IAdminUser): boolean {
    const highestRole = this._getHighestRole(user);
    return ADMIN_ROLES.includes(highestRole);
  }

  /**
   * Check if user is super admin
   */
  public isSuperAdmin(user: IAdminUser): boolean {
    return this._getHighestRole(user) === UserRoles.SUPER_ADMIN;
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): any {
    return this._authService.getCurrentUser();
  }

  private _getCurrentUserRole(user: any): UserRoles {
    // For now, map user.type to roles
    // This should be updated when the backend provides proper role information
    switch (user.type) {
      case 'system': return UserRoles.SUPER_ADMIN;
      case 'business': return UserRoles.CUSTOMER;
      case 'individual': return UserRoles.CUSTOMER;
      default: return UserRoles.GUEST;
    }
  }

  private _getHighestRole(user: IAdminUser): UserRoles {
    if (!user.roles || user.roles.length === 0) {
      return UserRoles.GUEST;
    }

    let highestRole = UserRoles.GUEST;
    let highestLevel = ROLE_HIERARCHY[UserRoles.GUEST];

    for (const role of user.roles) {
      const roleName = role.name.toLowerCase() as UserRoles;
      const roleLevel = ROLE_HIERARCHY[roleName];
      
      if (roleLevel && roleLevel > highestLevel) {
        highestLevel = roleLevel;
        highestRole = roleName;
      }
    }

    return highestRole;
  }
}

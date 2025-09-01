export enum UserRoles {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STORE_ADMIN = 'store_admin',
  STORE_MANAGER = 'store_manager',
  STORE_EMPLOYEE = 'store_employee',
  CUSTOMER = 'customer',
  GUEST = 'guest'
}

export const ROLE_HIERARCHY = {
  [UserRoles.SUPER_ADMIN]: 100,
  [UserRoles.ADMIN]: 90,
  [UserRoles.STORE_ADMIN]: 80,
  [UserRoles.STORE_MANAGER]: 70,
  [UserRoles.STORE_EMPLOYEE]: 60,
  [UserRoles.CUSTOMER]: 40,
  [UserRoles.GUEST]: 20
};

export const ADMIN_ROLES = [UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.STORE_ADMIN];

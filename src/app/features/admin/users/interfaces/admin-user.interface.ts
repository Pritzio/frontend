import { IUserProfile } from './user-profile.interface';
import { IUserRole } from './user-role.interface';

export interface IAdminUser {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'deleted';
  profile: IUserProfile;
  roles: IUserRole[];
  createdAt: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  updatedAt?: string;
}

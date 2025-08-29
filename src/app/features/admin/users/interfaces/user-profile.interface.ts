export interface IUserProfile {
  firstName: string;
  lastName: string;
  isVerified: boolean;
  isActive: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
}

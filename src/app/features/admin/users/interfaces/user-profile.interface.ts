import { ProfileVisibility } from '../enums/profile-visibility.enum';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export interface IUserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  profileVisibility: ProfileVisibility;
  isVerified: boolean;
  isActive: boolean;
}

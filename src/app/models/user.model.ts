export enum UserType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  SYSTEM = 'system'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted'
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: UserStatus;
  type: UserType;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginRequest {
  identifier: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  type?: UserType;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

// Backend actual response structure
export interface IBackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: IUser;
}

export enum StoreType {
  ONLINE = 'online',
  PHYSICAL = 'physical',
  HYBRID = 'hybrid'
}

export enum StoreStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

export enum StoreCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME_AND_GARDEN = 'home_and_garden',
  SPORTS = 'sports',
  BEAUTY = 'beauty',
  BOOKS = 'books',
  AUTOMOTIVE = 'automotive',
  FOOD_AND_BEVERAGES = 'food_and_beverages',
  HEALTH = 'health',
  TOYS = 'toys',
  OTHER = 'other'
}

export interface IStore {
  id: string;
  name: string;
  description?: string;
  website: string;
  logo?: string;
  type: StoreType;
  status: StoreStatus;
  category: StoreCategory;
  phone?: string;
  email?: string;
  country?: string;
  timezone?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

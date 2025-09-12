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
  displayName?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from API
  storeProductsCount?: number;
  physicalLocationsCount?: number;
  creator?: {
    id: string;
    username: string;
    email: string;
    roles: Array<{
      id: string;
      name: string;
      displayName: string;
    }>;
  };
  verificationStatus?: string;
}

export interface IStoreLocation {
  id: string;
  storeId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreAnalytics {
  id: string;
  name: string;
  totalProducts: number;
  activeProducts: number;
  totalLocations: number;
  activeLocations: number;
  averageOnlinePrice: number;
  averagePhysicalPrice: number;
  priceComparison: {
    onlineOnly: number;
    physicalOnly: number;
    both: number;
    priceDifference: number;
  };
  lastActivity: Date;
  scrapingStatus: {
    lastScraped: Date;
    productsNeedingScraping: number;
    scrapingErrors: number;
  };
}

export interface IStoreFilters {
  page?: number;
  limit?: number;
  type?: StoreType;
  status?: StoreStatus;
  category?: StoreCategory;
  country?: string;
  isVerified?: boolean;
  hasPhysicalLocations?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

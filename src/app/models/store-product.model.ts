// Store Products API v2.1 - Updated Models

// Category Interface (from Categories API)
export interface ICategoryResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
}

// Core Store Product Interface (v2.1 - With Categories)
export interface IStoreProduct {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  metadata?: Record<string, any>;
  lastScraped?: Date;
  notes?: string;
  displayName: string;
  createdBy: string;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  updatedAt: Date;
  categories?: ICategoryResponse[]; // New in v2.1
}

// Create Store Product DTO
export interface ICreateStoreProductRequest {
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  metadata?: Record<string, any>;
  notes?: string;
}

// Update Store Product DTO
export interface IUpdateStoreProductRequest {
  name?: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  metadata?: Record<string, any>;
  notes?: string;
}

// Store Product Filters
export interface IStoreProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Store Product Summary (for lists)
export interface IStoreProductSummary {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  lastScraped?: Date;
  createdAt: Date;
  creatorName: string;
  categories?: ICategoryResponse[]; // New in v2.1
}

// Store Product Response (full details)
export interface IStoreProductResponse {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  metadata?: Record<string, any>;
  lastScraped?: Date;
  notes?: string;
  displayName: string;
  createdBy: string;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  updatedAt: Date;
  categories?: ICategoryResponse[]; // New in v2.1
}

// Paginated Response
export interface IStoreProductsResponse {
  data: IStoreProduct[];
  total: number;
  page: number;
  limit: number;
}

// Common metadata structure for scraped products
export interface IStoreProductMetadata {
  brand?: string;
  rating?: number;
  ratingText?: string;
  ppum?: string;
  highResImageUrl?: string;
  categories?: string[];
  scrapedAt?: string;
  source?: string;
  [key: string]: any;
}

// Legacy enums (kept for backward compatibility if needed)
export enum StoreProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  COMING_SOON = 'coming_soon',
  ERROR = 'error'
}

export enum Availability {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  PRE_ORDER = 'pre_order',
  BACKORDER = 'backorder'
}

export enum ScrapingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SCHEDULED = 'scheduled'
}

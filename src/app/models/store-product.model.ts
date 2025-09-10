// Store Products API v2.2 - Updated Models

// Store Interface (from Store API)
export interface IStoreResponse {
  id: string;
  name: string;
  website?: string;
  type: string; // ONLINE, PHYSICAL, HYBRID
  status: string; // ACTIVE, INACTIVE, SUSPENDED
  category: string; // Store category
  isVerified: boolean;
  displayName: string;
}

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

// Core Store Product Interface (v2.2 - With Store and Price)
export interface IStoreProduct {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  price?: number; // New in v2.2 - Price as integer (no decimals)
  metadata?: Record<string, any>;
  lastScraped?: Date;
  notes?: string;
  displayName: string;
  createdBy: string;
  creatorId: string;
  creatorName: string;
  storeId?: string; // New in v2.2
  store?: IStoreResponse; // New in v2.2
  baseProductId?: string | null; // Base product association
  createdAt: Date;
  updatedAt: Date;
  categories?: ICategoryResponse[];
}

// Create Store Product DTO (v2.2)
export interface ICreateStoreProductRequest {
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  price?: number; // New in v2.2 - Price as integer
  metadata?: Record<string, any>;
  notes?: string;
  // Store association (optional)
  storeName?: string; // For auto-creation
  storeWebsite?: string; // For auto-creation
}

// Update Store Product DTO (v2.2)
export interface IUpdateStoreProductRequest {
  name?: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  price?: number; // New in v2.2 - Price as integer
  metadata?: Record<string, any>;
  notes?: string;
  baseProductId?: string | null; // Base product association
}

// Store Product Filters (v2.2)
export interface IStoreProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  createdBy?: string;
  storeId?: string; // New in v2.2
  storeName?: string; // New in v2.2
  dateFrom?: Date;
  dateTo?: Date;
  unassociated?: boolean; // Filter for products without base product association
}

// Store Product Summary (for lists) - v2.2
export interface IStoreProductSummary {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  price?: number; // New in v2.2
  lastScraped?: Date;
  createdAt: Date;
  creatorName: string;
  storeId?: string; // New in v2.2
  store?: IStoreResponse; // New in v2.2
  categories?: ICategoryResponse[];
}

// Store Product Response (full details) - v2.2
export interface IStoreProductResponse {
  id: string;
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  storeProductId?: string;
  image?: string;
  price?: number; // New in v2.2
  metadata?: Record<string, any>;
  lastScraped?: Date;
  notes?: string;
  displayName: string;
  createdBy: string;
  creatorId: string;
  creatorName: string;
  storeId?: string; // New in v2.2
  store?: IStoreResponse; // New in v2.2
  createdAt: Date;
  updatedAt: Date;
  categories?: ICategoryResponse[];
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
  originalPrice?: number; // New in v2.2
  originalData?: Record<string, any>; // New in v2.2
  [key: string]: any;
}

// Scraped Product Interface (for bulk import)
export interface IScrapedProduct {
  id: string; // Store product ID from scraping
  name: string;
  description?: string;
  url?: string;
  sku?: string;
  imageUrl?: string;
  brand?: string;
  rating?: number;
  ratingText?: string;
  ppum?: string;
  highResImageUrl?: string;
  categories?: string[];
  price?: number;
  storeName?: string;
  storeWebsite?: string;
}

// Bulk Scraping Response
export interface IBulkScrapingResponse {
  message: string;
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  errors: number;
  results: IScrapingResult[];
  logs: {
    endpoint: string;
    timestamp: string;
    user: string;
  };
}

// Individual Scraping Result
export interface IScrapingResult {
  success: boolean;
  originalId: string;
  createdProduct?: IStoreProduct;
  error?: string;
  errorDetails?: {
    reason: string;
    existingProductId?: string;
    duplicateBy?: string;
    duplicateValue?: string;
  };
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

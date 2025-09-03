export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription'
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
  COMING_SOON = 'coming_soon'
}

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  OPEN_BOX = 'open_box'
}

export enum ScrapingPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ScrapingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface IProductSpecifications {
  [key: string]: any;
}

export interface IProductMetadata {
  scrapingPriority?: ScrapingPriority;
  scrapingSource?: string;
  originalUrl?: string;
  [key: string]: any;
}

export interface IScrapingMetadata {
  price?: number;
  availability?: string;
  rating?: number;
  reviews?: number;
  [key: string]: any;
}

export interface IScrapingData {
  lastScraped?: string;
  scrapingSource?: string;
  scrapingStatus?: ScrapingStatus;
  scrapingMetadata?: IScrapingMetadata;
  scrapingErrors?: string[];
}

export interface IProductCreator {
  id: string;
  username: string;
}

export interface IProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  type: ProductType;
  status: ProductStatus;
  condition: ProductCondition;
  model?: string;
  manufacturer?: string;
  country?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  warrantyMonths?: number;
  specifications?: IProductSpecifications;
  features?: string[];
  tags?: string[];
  metadata?: IProductMetadata;
  scrapingData?: IScrapingData;
  createdAt: string;
  updatedAt: string;
  creator?: IProductCreator;
}

export interface ICreateProductRequest {
  name: string;
  code: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  type: ProductType;
  status?: ProductStatus;
  condition?: ProductCondition;
  model?: string;
  manufacturer?: string;
  country?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  warrantyMonths?: number;
  specifications?: IProductSpecifications;
  features?: string[];
  tags?: string[];
  metadata?: IProductMetadata;
}

export interface IUpdateProductRequest extends Partial<ICreateProductRequest> {}

export interface IBulkCreateProductsRequest {
  products: ICreateProductRequest[];
  options?: {
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  };
}

export interface IBulkOperationRequest {
  productIds: string[];
  data?: Partial<IUpdateProductRequest>;
}

export interface IBulkOperationResult {
  id: string;
  success: boolean;
  error?: string;
}

export interface IBulkOperationResponse {
  updated?: number;
  created?: number;
  failed?: number;
  total: number;
  results: IBulkOperationResult[];
}

export interface IProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  type?: ProductType;
  status?: ProductStatus;
  condition?: ProductCondition;
  hasWarranty?: boolean;
  hasDimensions?: boolean;
  hasWeight?: boolean;
  minWeight?: number;
  maxWeight?: number;
  minWarranty?: number;
  maxWarranty?: number;
  tags?: string;
  features?: string;
  createdBy?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface IProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  productsByType: Record<ProductType, number>;
  productsByCategory: Record<string, number>;
  productsByStatus: Record<ProductStatus, number>;
  recentActivity: {
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
    createdThisYear: number;
  };
}

export interface IScrapingFilters {
  limit?: number;
  priority?: ScrapingPriority | 'all';
  category?: string;
  lastScrapedBefore?: string;
}

export interface IUpdateScrapingRequest {
  productId: string;
  scrapingData: IScrapingData;
}



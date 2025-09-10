export interface IBaseProduct {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  sku: string | null;
  fullName: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  specifications?: IBaseProductSpecifications;
  categories?: IBaseProductCategory[];
  storeProducts?: IBaseProductStoreProduct[];
  totalStores?: number;
  totalVariants?: number;
}

export interface IBaseProductSpecifications {
  rating: number | null;
  categories: string[];
  originalData: {
    brand?: string;
    categories?: string[];
    highResImageUrl?: string | null;
    [key: string]: any;
  };
}

export interface IBaseProductCategory {
  id: string;
  name: string;
  color?: string;
  productCount?: number;
}

export interface IBaseProductStoreProduct {
  id: string;
  name: string;
  price: number;
  url: string;
  image: string | null;
  store: {
    id: string;
    name: string;
    logo: string;
  };
}

export interface IBaseProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  isActive?: boolean;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ICreateBaseProductRequest {
  name: string;
  brand?: string;
  model?: string;
  sku?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  specifications?: IBaseProductSpecifications;
  categoryIds?: string[];
}

export interface IUpdateBaseProductRequest {
  name?: string;
  brand?: string;
  model?: string;
  sku?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  specifications?: IBaseProductSpecifications;
  categoryIds?: string[];
}

export interface IBaseProductResponse {
  data: IBaseProduct[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IBaseProductAnalytics {
  totalBaseProducts: number;
  activeBaseProducts: number;
  inactiveBaseProducts: number;
  productsWithImages: number;
  productsWithoutImages: number;
  averageStoresPerProduct: number;
  averageVariantsPerProduct: number;
  productsByBrand: { [brand: string]: number };
  productsByCategory: { [category: string]: number };
  productsByStatus: { [status: string]: number };
  lastUpdated: string;
}

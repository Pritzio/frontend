export interface Product {
  id: string;
  name: string;
  brand: string | null;
  model?: string | null;
  fullName?: string;
  storeCount: number;
  totalVariants: number;
  image?: string | null;
  specifications?: {
    rating: number | null;
    categories: string[];
    originalData: Record<string, any>;
  };
  createdAt?: string;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  stores: StoreProductInfo[];
}

export interface StoreProductInfo {
  store: {
    id: string;
    name: string;
    website: string;
    type: string;
    isVerified: boolean;
  };
  product: {
    id: string;
    name: string;
    price: number;
    url: string;
    image: string | null;
    lastScraped: string;
    metadata?: Record<string, any>;
  };
  price: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  url: string;
  image: string | null;
  store: Store;
}

export interface StoreComparison {
  store: Store;
  product: {
    id: string;
    name: string;
    price: number;
    url: string;
    image: string | null;
  };
  price: number;
}

export interface PriceRange {
  min: number;
  max: number;
  avg: number;
}

export interface ProductSearchResponse {
  data: Product[];
  total: number;
  query: string;
}

export interface ProductComparisonResponse {
  product: Product;
  priceRange: PriceRange;
  stores: StoreComparison[];
  totalStores: number;
  lastUpdated: string;
}

export interface SearchFilters {
  brand?: string;
  availability?: string;
}

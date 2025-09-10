export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  fullName: string;
  storeCount: number;
  totalVariants: number;
  image: string | null;
  description: string | null;
  specifications: {
    rating: number | null;
    categories: string[];
    originalData: {
      brand?: string;
      categories?: string[];
      highResImageUrl?: string | null;
      [key: string]: any;
    };
  };
  createdAt?: string;
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

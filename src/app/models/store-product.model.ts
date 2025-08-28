export enum AvailabilityStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
  COMING_SOON = 'coming_soon',
  DISCONTINUED = 'discontinued'
}

export interface IStoreProduct {
  id: string;
  storeId: string;
  productId: string;
  price: number;
  originalPrice?: number;
  currency: string;
  stockQuantity?: number;
  availability: AvailabilityStatus;
  lastScrapedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreProductWithDetails extends IStoreProduct {
  store?: {
    id: string;
    name: string;
    logo?: string;
    website: string;
  };
  product?: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    brand?: string;
    category: string;
  };
}

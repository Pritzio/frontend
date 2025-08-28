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

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  code: string;
  sku?: string;
  barcode?: string;
  image?: string;
  brand?: string;
  category: string;
  subcategory?: string;
  type: ProductType;
  status: ProductStatus;
  condition: ProductCondition;
  model?: string;
  manufacturer?: string;
  country?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: string;
  dimensionsUnit?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}



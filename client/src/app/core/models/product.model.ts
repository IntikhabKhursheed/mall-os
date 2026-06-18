export interface Product {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  department?: string;
  sellingPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  reorderLevel?: number;
  status?: "healthy" | "low_stock" | "out_of_stock";
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  department?: string;
  sellingPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  reorderLevel?: number;
  status?: "healthy" | "low_stock" | "out_of_stock";
  image?: string;
}

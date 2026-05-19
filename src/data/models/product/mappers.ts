import type { ID, ISODateString, Money } from "@core/types";
import type { Product } from "@domain/entities";

import type { ProductRow } from "./ProductRow";

export const productRowToEntity = (row: ProductRow): Product => ({
  id: row.id as ID,
  storeId: row.store_id as ID,
  name: row.name,
  sku: row.sku ?? undefined,
  barcode: row.barcode ?? undefined,
  unit: row.unit,
  price: row.price as Money,
  cost: row.cost as Money,
  stock: row.stock,
  reorderLevel: row.reorder_level ?? undefined,
  createdAt: row.created_at as ISODateString,
  updatedAt: row.updated_at as ISODateString,
});

export const productToRow = (
  product: Product,
): Omit<ProductRow, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
} => ({
  id: product.id,
  store_id: product.storeId,
  name: product.name,
  sku: product.sku ?? null,
  barcode: product.barcode ?? null,
  unit: product.unit,
  price: product.price,
  cost: product.cost,
  stock: product.stock,
  reorder_level: product.reorderLevel ?? null,
  created_at: product.createdAt,
  updated_at: product.updatedAt,
});

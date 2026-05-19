import type { ID, ISODateString, Money } from "@core/types";

export interface Product {
  id: ID;
  storeId: ID;
  name: string;
  sku?: string;
  barcode?: string;
  unit: string;
  price: Money;
  cost: Money;
  stock: number;
  /** Stock level at which to surface a low-stock warning. */
  reorderLevel?: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

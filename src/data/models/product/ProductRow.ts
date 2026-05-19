/** SQLite row shape for the `products` table. */
export interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  reorder_level: number | null;
  created_at: string;
  updated_at: string;
}

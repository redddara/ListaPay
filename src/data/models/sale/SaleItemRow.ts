/** SQLite row shape for the `sale_items` table. */
export interface SaleItemRow {
  id: string;
  sale_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

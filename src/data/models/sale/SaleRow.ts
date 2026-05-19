/** SQLite row shape for the `sales` table. */
export interface SaleRow {
  id: string;
  store_id: string;
  customer_id: string | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  debt_entry_id: string | null;
  sold_at: string;
  created_by: string;
  voided_at: string | null;
  void_reason: string | null;
}

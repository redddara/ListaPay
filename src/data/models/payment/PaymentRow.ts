/** SQLite row shape for the `payments` table. */
export interface PaymentRow {
  id: string;
  store_id: string;
  customer_id: string;
  debt_entry_id: string;
  amount: number;
  method: string;
  note: string | null;
  paid_at: string;
  recorded_by: string;
}

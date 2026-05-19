/** SQLite row shape for the `utang` table (domain: `DebtEntry`). */
export interface UtangRow {
  id: string;
  store_id: string;
  customer_id: string;
  sale_id: string | null;
  principal: number;
  amount_paid: number;
  balance: number;
  status: string;
  note: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

/** SQLite row shape for the `customers` table. */
export interface CustomerRow {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
}

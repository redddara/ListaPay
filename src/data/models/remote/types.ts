/** Supabase `profiles` row. */
export interface ProfileDto {
  id: string;
  store_id: string;
  email: string;
  display_name: string;
  role: "owner" | "staff";
  created_at: string;
}

export interface ProductDto {
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

export interface CustomerDto {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  outstanding_balance: number;
  created_at: string;
  updated_at: string;
}

export interface SaleDto {
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

export interface SaleItemDto {
  id: string;
  sale_id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sort_order: number;
}

export interface UtangDto {
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

export interface PaymentDto {
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

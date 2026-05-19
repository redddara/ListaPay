import type { CustomerRow } from "@data/models/customer/CustomerRow";
import type { UtangRow } from "@data/models/debt/UtangRow";
import type { PaymentRow } from "@data/models/payment/PaymentRow";
import type { ProductRow } from "@data/models/product/ProductRow";
import type { SaleItemRow } from "@data/models/sale/SaleItemRow";
import type { SaleRow } from "@data/models/sale/SaleRow";

import type {
  CustomerDto,
  PaymentDto,
  ProductDto,
  SaleDto,
  SaleItemDto,
  UtangDto,
} from "./types";

export const productRowToDto = (row: ProductRow): ProductDto => ({
  id: row.id,
  store_id: row.store_id,
  name: row.name,
  sku: row.sku,
  barcode: row.barcode,
  unit: row.unit,
  price: row.price,
  cost: row.cost,
  stock: row.stock,
  reorder_level: row.reorder_level,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const customerRowToDto = (row: CustomerRow): CustomerDto => ({
  id: row.id,
  store_id: row.store_id,
  name: row.name,
  phone: row.phone,
  notes: row.notes,
  outstanding_balance: row.outstanding_balance,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const saleRowToDto = (row: SaleRow): SaleDto => ({
  id: row.id,
  store_id: row.store_id,
  customer_id: row.customer_id,
  subtotal: row.subtotal,
  discount: row.discount,
  total: row.total,
  payment_method: row.payment_method,
  debt_entry_id: row.debt_entry_id,
  sold_at: row.sold_at,
  created_by: row.created_by,
  voided_at: row.voided_at,
  void_reason: row.void_reason,
});

export const saleItemRowToDto = (row: SaleItemRow): SaleItemDto => ({
  id: row.id,
  sale_id: row.sale_id,
  product_id: row.product_id,
  name: row.name,
  quantity: row.quantity,
  unit_price: row.unit_price,
  line_total: row.line_total,
  sort_order: row.sort_order,
});

export const utangRowToDto = (row: UtangRow): UtangDto => ({
  id: row.id,
  store_id: row.store_id,
  customer_id: row.customer_id,
  sale_id: row.sale_id,
  principal: row.principal,
  amount_paid: row.amount_paid,
  balance: row.balance,
  status: row.status,
  note: row.note,
  due_date: row.due_date,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const paymentRowToDto = (row: PaymentRow): PaymentDto => ({
  id: row.id,
  store_id: row.store_id,
  customer_id: row.customer_id,
  debt_entry_id: row.debt_entry_id,
  amount: row.amount,
  method: row.method,
  note: row.note,
  paid_at: row.paid_at,
  recorded_by: row.recorded_by,
});

/** Map a void patch from sync payload onto an existing sale DTO. */
export const applySaleVoidPatch = (
  dto: SaleDto,
  patch: { voidedAt?: string; voidReason?: string },
): SaleDto => ({
  ...dto,
  voided_at: patch.voidedAt ?? dto.voided_at,
  void_reason: patch.voidReason ?? dto.void_reason,
});

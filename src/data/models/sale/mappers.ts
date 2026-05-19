import type { ID, ISODateString, Money } from "@core/types";
import type { Sale, SaleLineItem, SalePaymentMethod } from "@domain/entities";

import type { SaleItemRow } from "./SaleItemRow";
import type { SaleRow } from "./SaleRow";

export const saleItemRowToLineItem = (row: SaleItemRow): SaleLineItem => ({
  productId: row.product_id as ID,
  name: row.name,
  quantity: row.quantity,
  unitPrice: row.unit_price as Money,
  lineTotal: row.line_total as Money,
});

export const lineItemToRow = (
  saleId: ID,
  item: SaleLineItem,
  sortOrder: number,
  id: ID,
): SaleItemRow => ({
  id,
  sale_id: saleId,
  product_id: item.productId,
  name: item.name,
  quantity: item.quantity,
  unit_price: item.unitPrice,
  line_total: item.lineTotal,
  sort_order: sortOrder,
});

export const saleRowToEntity = (
  row: SaleRow,
  items: SaleLineItem[],
): Sale => ({
  id: row.id as ID,
  storeId: row.store_id as ID,
  customerId: (row.customer_id as ID) ?? undefined,
  items,
  subtotal: row.subtotal as Money,
  discount: row.discount as Money,
  total: row.total as Money,
  paymentMethod: row.payment_method as SalePaymentMethod,
  debtEntryId: (row.debt_entry_id as ID) ?? undefined,
  soldAt: row.sold_at as ISODateString,
  createdBy: row.created_by as ID,
});

export const saleToRow = (sale: Sale): SaleRow => ({
  id: sale.id,
  store_id: sale.storeId,
  customer_id: sale.customerId ?? null,
  subtotal: sale.subtotal,
  discount: sale.discount,
  total: sale.total,
  payment_method: sale.paymentMethod,
  debt_entry_id: sale.debtEntryId ?? null,
  sold_at: sale.soldAt,
  created_by: sale.createdBy,
  voided_at: null,
  void_reason: null,
});

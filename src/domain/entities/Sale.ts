import type { ID, ISODateString, Money } from "@core/types";

export type SalePaymentMethod = "cash" | "utang" | "gcash" | "other";

export interface SaleLineItem {
  productId: ID;
  name: string;
  quantity: number;
  unitPrice: Money;
  lineTotal: Money;
}

export interface Sale {
  id: ID;
  storeId: ID;
  customerId?: ID;
  items: SaleLineItem[];
  subtotal: Money;
  discount: Money;
  total: Money;
  paymentMethod: SalePaymentMethod;
  /** Set when payment method is `utang`. References a `DebtEntry`. */
  debtEntryId?: ID;
  soldAt: ISODateString;
  createdBy: ID;
}

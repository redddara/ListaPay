import type { ID, Money } from "@core/types";
import type { Sale } from "@domain/entities";

/** How the customer pays at checkout. */
export type PosPaymentMode = "cash" | "utang" | "partial";

export interface CheckoutLineInput {
  productId: ID;
  quantity: number;
}

export interface CheckoutInput {
  storeId: ID;
  createdBy: ID;
  lines: CheckoutLineInput[];
  discount: Money;
  paymentMode: PosPaymentMode;
  /** Required when `paymentMode` is `utang` or `partial`. */
  customerId?: ID;
  /** Cash collected now. Required for `partial`; must be `0` for full utang. */
  cashPaid?: Money;
}

export interface CheckoutResult {
  sale: Sale;
  debtEntryId?: ID;
  cashCollected: Money;
  utangAmount: Money;
}

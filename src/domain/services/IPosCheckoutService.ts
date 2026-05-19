import type { CheckoutInput, CheckoutResult } from "@domain/usecases/pos/types";

/** Atomic POS checkout — implemented in the data layer against SQLite. */
export interface IPosCheckoutService {
  checkout(input: CheckoutInput): Promise<CheckoutResult>;
}

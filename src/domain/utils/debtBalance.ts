import type { Money } from "@core/types";
import type { DebtStatus } from "@domain/entities";

/** Remaining amount owed on a lista entry. */
export const computeBalance = (
  principal: Money,
  amountPaid: Money,
): Money => Math.max(0, principal - amountPaid) as Money;

/** Derive lista status from principal and amount paid. */
export const computeDebtStatus = (
  principal: Money,
  amountPaid: Money,
): DebtStatus => {
  const balance = computeBalance(principal, amountPaid);
  if (balance <= 0) return "paid";
  if (amountPaid > 0) return "partial";
  return "open";
};

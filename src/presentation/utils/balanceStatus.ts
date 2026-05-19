import type { Money } from "@core/types";

/** Debt level for list color indicators (centavos). */
export type BalanceLevel = "paid" | "partial" | "high";

const HIGH_DEBT_THRESHOLD = 100_000 as Money; // ₱1,000+

export const getBalanceLevel = (balance: Money): BalanceLevel => {
  if (balance <= 0) return "paid";
  if (balance >= HIGH_DEBT_THRESHOLD) return "high";
  return "partial";
};

import { APP_CONSTANTS } from "@core/constants";
import type { Money } from "@core/types";

/**
 * Convert a peso amount (e.g. `12.50`) to its smallest-unit `Money` value
 * (e.g. `1250` centavos). All persisted monetary values should be stored in
 * centavos to avoid floating-point rounding errors.
 */
export const toMoney = (pesos: number): Money =>
  Math.round(pesos * 100) as Money;

/** Convert a `Money` value (centavos) back to a peso `number`. */
export const fromMoney = (m: Money): number => m / 100;

/** Format a `Money` value using the configured app locale + PHP currency. */
export const formatMoney = (m: Money): string =>
  new Intl.NumberFormat(APP_CONSTANTS.LOCALE, {
    style: "currency",
    currency: APP_CONSTANTS.CURRENCY_CODE,
  }).format(fromMoney(m));

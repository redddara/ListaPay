/** Branded UUID v4 string. */
export type ID = string & { readonly __brand: "ID" };

/** Monetary amount stored as the smallest currency unit (centavos for PHP). */
export type Money = number & { readonly __brand: "Money" };

/** ISO 8601 timestamp string. */
export type ISODateString = string & { readonly __brand: "ISODateString" };

/**
 * A discriminated-union result type used as the return value of use cases
 * and repository operations. Keeps error handling explicit at boundaries
 * without leaking exceptions through application code.
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;

/** Common pagination input for list-style use cases. */
export interface PageParams {
  limit: number;
  cursor?: string;
}

export interface Page<T> {
  items: T[];
  nextCursor?: string;
}

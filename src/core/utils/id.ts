import type { ID, ISODateString } from "@core/types";

/** Generate a new UUID v4 branded as `ID`. */
export const generateId = (): ID =>
  crypto.randomUUID() as ID;

/** Current UTC timestamp as an ISO 8601 string. */
export const nowISO = (): ISODateString =>
  new Date().toISOString() as ISODateString;

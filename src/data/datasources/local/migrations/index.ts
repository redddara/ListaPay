import init from "./001_init";

import type { Migration } from "../migration";

/** Ordered list of migrations. Always append — never reorder or rewrite. */
export const migrations: Migration[] = [init];

import { NotFoundError } from "@core/errors";
import type { ID } from "@core/types";

export const requireRow = <T>(
  row: T | null | undefined,
  resource: string,
  id?: ID,
): T => {
  if (row == null) {
    throw new NotFoundError(resource, id);
  }
  return row;
};

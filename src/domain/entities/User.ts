import type { ID, ISODateString } from "@core/types";

export type UserRole = "owner" | "staff";

export interface User {
  id: ID;
  email: string;
  displayName: string;
  role: UserRole;
  storeId: ID;
  createdAt: ISODateString;
}

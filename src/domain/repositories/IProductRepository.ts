import type { ID, Page, PageParams } from "@core/types";
import type { Product } from "@domain/entities";

export interface IProductRepository {
  list(params: PageParams): Promise<Page<Product>>;
  getById(id: ID): Promise<Product | null>;
  getByBarcode(barcode: string): Promise<Product | null>;
  create(
    input: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<Product>;
  update(id: ID, patch: Partial<Product>): Promise<Product>;
  delete(id: ID): Promise<void>;
  adjustStock(id: ID, delta: number): Promise<Product>;
}

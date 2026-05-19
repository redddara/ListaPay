import { create } from "zustand";

import type { ID, Money } from "@core/types";
import type { Product } from "@domain/entities";

export interface CartLine {
  productId: ID;
  name: string;
  unit: string;
  unitPrice: Money;
  quantity: number;
  stock: number;
}

interface PosCartState {
  lines: CartLine[];
  discountPesos: string;

  addProduct: (product: Product) => void;
  removeLine: (productId: ID) => void;
  setQuantity: (productId: ID, quantity: number) => void;
  increment: (productId: ID) => void;
  decrement: (productId: ID) => void;
  setDiscountPesos: (value: string) => void;
  clear: () => void;
}

export const usePosCartStore = create<PosCartState>((set, get) => ({
  lines: [],
  discountPesos: "0",

  addProduct: (product) => {
    const { lines } = get();
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      set({
        lines: lines.map((l) =>
          l.productId === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        ),
      });
      return;
    }
    if (product.stock <= 0) return;
    set({
      lines: [
        ...lines,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          unitPrice: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ],
    });
  },

  removeLine: (productId) =>
    set({ lines: get().lines.filter((l) => l.productId !== productId) }),

  setQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeLine(productId);
      return;
    }
    set({
      lines: get().lines.map((l) =>
        l.productId === productId
          ? { ...l, quantity: Math.min(quantity, l.stock) }
          : l,
      ),
    });
  },

  increment: (productId) => {
    const line = get().lines.find((l) => l.productId === productId);
    if (!line || line.quantity >= line.stock) return;
    get().setQuantity(productId, line.quantity + 1);
  },

  decrement: (productId) => {
    const line = get().lines.find((l) => l.productId === productId);
    if (!line) return;
    get().setQuantity(productId, line.quantity - 1);
  },

  setDiscountPesos: (value) => set({ discountPesos: value }),

  clear: () => set({ lines: [], discountPesos: "0" }),
}));

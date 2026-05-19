import { useMemo } from "react";

import type { Money } from "@core/types";
import { toMoney } from "@core/utils";
import {
  computeCartSubtotal,
  computeCartTotal,
} from "@domain/usecases/pos";

import { usePosCartStore } from "@presentation/stores/usePosCartStore";

export const useCartTotals = () => {
  const lines = usePosCartStore((s) => s.lines);
  const discountPesos = usePosCartStore((s) => s.discountPesos);

  return useMemo(() => {
    const subtotal = computeCartSubtotal(lines);
    const discount = toMoney(parseFloat(discountPesos) || 0);
    const total = computeCartTotal(subtotal, discount);
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
    return { subtotal, discount, total, itemCount };
  }, [lines, discountPesos]);
};

export const useCartLineCount = (): number =>
  usePosCartStore((s) => s.lines.reduce((n, l) => n + l.quantity, 0));

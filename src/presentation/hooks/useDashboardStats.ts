import { useCallback, useEffect, useState } from "react";

import type { Money } from "@core/types";
import { formatMoney } from "@core/utils";

import { useRepositories } from "@/composition/RepositoriesProvider";

export interface DashboardStats {
  salesToday: Money;
  salesTodayFormatted: string;
  totalUtang: Money;
  totalUtangFormatted: string;
  customersWithDebt: number;
}

const startOfTodayIso = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const useDashboardStats = () => {
  const { sales, customers, debts } = useRepositories();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const todayStart = startOfTodayIso();
      const [salesPage, customersPage] = await Promise.all([
        sales.list({ limit: 500 }),
        customers.list({ limit: 500 }),
      ]);

      const salesToday = salesPage.items
        .filter((s) => s.soldAt >= todayStart)
        .reduce((sum, s) => (sum + s.total) as Money, 0 as Money);

      let totalUtang = 0 as Money;
      let customersWithDebt = 0;

      for (const c of customersPage.items) {
        const outstanding = await debts.totalOutstandingFor(c.id);
        totalUtang = (totalUtang + outstanding) as Money;
        if (outstanding > 0) customersWithDebt++;
      }

      setStats({
        salesToday,
        salesTodayFormatted: formatMoney(salesToday),
        totalUtang,
        totalUtangFormatted: formatMoney(totalUtang),
        customersWithDebt,
      });
    } finally {
      setLoading(false);
    }
  }, [sales, customers, debts]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, reload: load };
};

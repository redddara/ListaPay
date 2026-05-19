import { useCallback, useEffect, useState } from "react";

import type { Customer } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";

export interface CustomerWithBalance extends Customer {
  computedOutstanding: Customer["outstandingBalance"];
}

export const useCustomersWithBalances = () => {
  const { customers, debts } = useRepositories();
  const [items, setItems] = useState<CustomerWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await customers.list({ limit: 200 });
      const withBalances = await Promise.all(
        page.items.map(async (c) => {
          const computedOutstanding = await debts.totalOutstandingFor(c.id);
          return { ...c, computedOutstanding };
        }),
      );
      const sorted = withBalances.sort(
        (a, b) => b.computedOutstanding - a.computedOutstanding,
      );
      setItems(sorted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [customers, debts]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = query.trim()
    ? items.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  const totalOutstanding = filtered.reduce(
    (sum, c) => (sum + c.computedOutstanding) as typeof sum,
    0 as Customer["outstandingBalance"],
  );

  return {
    customers: filtered,
    totalOutstanding,
    loading,
    error,
    query,
    setQuery,
    reload: load,
  };
};

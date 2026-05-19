import { useCallback, useEffect, useState } from "react";

import type { Customer } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";

export const useCustomers = () => {
  const { customers } = useRepositories();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await customers.list({ limit: 100 });
      setItems(page.items);
    } finally {
      setLoading(false);
    }
  }, [customers]);

  useEffect(() => {
    load();
  }, [load]);

  return { customers: items, loading, reload: load };
};

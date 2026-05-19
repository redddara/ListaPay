import { useCallback, useEffect, useState } from "react";

import type { Product } from "@domain/entities";

import { useRepositories } from "@/composition/RepositoriesProvider";

export const useProducts = () => {
  const { products } = useRepositories();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await products.list({ limit: 200 });
      setItems(page.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [products]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = query.trim()
    ? items.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

  return {
    products: filtered,
    allProducts: items,
    loading,
    error,
    query,
    setQuery,
    reload: load,
  };
};

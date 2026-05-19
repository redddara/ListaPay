-- Run this if you already applied an older 001 migration and hit:
--   function public.current_store_id() does not exist
--
-- Safe to run even on a fresh project (uses CREATE OR REPLACE).

CREATE OR REPLACE FUNCTION public.current_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Re-apply policies (drops first so re-run is safe)
DROP POLICY IF EXISTS stores_select_member ON public.stores;
DROP POLICY IF EXISTS customers_store ON public.customers;
DROP POLICY IF EXISTS products_store ON public.products;
DROP POLICY IF EXISTS sales_store ON public.sales;
DROP POLICY IF EXISTS sale_items_store ON public.sale_items;
DROP POLICY IF EXISTS utang_store ON public.utang;
DROP POLICY IF EXISTS payments_store ON public.payments;

CREATE POLICY stores_select_member ON public.stores
  FOR SELECT USING (id = public.current_store_id());

CREATE POLICY customers_store ON public.customers
  FOR ALL
  USING (store_id = public.current_store_id())
  WITH CHECK (store_id = public.current_store_id());

CREATE POLICY products_store ON public.products
  FOR ALL
  USING (store_id = public.current_store_id())
  WITH CHECK (store_id = public.current_store_id());

CREATE POLICY sales_store ON public.sales
  FOR ALL
  USING (store_id = public.current_store_id())
  WITH CHECK (store_id = public.current_store_id());

CREATE POLICY sale_items_store ON public.sale_items
  FOR ALL
  USING (
    sale_id IN (
      SELECT id FROM public.sales WHERE store_id = public.current_store_id()
    )
  )
  WITH CHECK (
    sale_id IN (
      SELECT id FROM public.sales WHERE store_id = public.current_store_id()
    )
  );

CREATE POLICY utang_store ON public.utang
  FOR ALL
  USING (store_id = public.current_store_id())
  WITH CHECK (store_id = public.current_store_id());

CREATE POLICY payments_store ON public.payments
  FOR ALL
  USING (store_id = public.current_store_id())
  WITH CHECK (store_id = public.current_store_id());

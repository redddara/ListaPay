-- ListaPay remote schema with store-based RLS.
-- Apply via Supabase SQL editor (run the entire script in one go).

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_store ON public.profiles (store_id);

-- Must exist BEFORE RLS policies reference it (depends on profiles table).
CREATE OR REPLACE FUNCTION public.current_store_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  notes text,
  outstanding_balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  barcode text,
  unit text NOT NULL,
  price integer NOT NULL,
  cost integer NOT NULL,
  stock real NOT NULL DEFAULT 0,
  reorder_level real,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers (id),
  subtotal integer NOT NULL,
  discount integer NOT NULL DEFAULT 0,
  total integer NOT NULL,
  payment_method text NOT NULL,
  debt_entry_id uuid,
  sold_at timestamptz NOT NULL,
  created_by uuid NOT NULL,
  voided_at timestamptz,
  void_reason text
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid PRIMARY KEY,
  sale_id uuid NOT NULL REFERENCES public.sales (id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products (id),
  name text NOT NULL,
  quantity real NOT NULL,
  unit_price integer NOT NULL,
  line_total integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.utang (
  id uuid PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers (id),
  sale_id uuid REFERENCES public.sales (id),
  principal integer NOT NULL,
  amount_paid integer NOT NULL DEFAULT 0,
  balance integer NOT NULL,
  status text NOT NULL,
  note text,
  due_date timestamptz,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES public.stores (id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers (id),
  debt_entry_id uuid NOT NULL REFERENCES public.utang (id),
  amount integer NOT NULL,
  method text NOT NULL,
  note text,
  paid_at timestamptz NOT NULL,
  recorded_by uuid NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers (store_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products (store_id);
CREATE INDEX IF NOT EXISTS idx_sales_store ON public.sales (store_id);
CREATE INDEX IF NOT EXISTS idx_utang_store ON public.utang (store_id);
CREATE INDEX IF NOT EXISTS idx_payments_store ON public.payments (store_id);

-- ---------------------------------------------------------------------------
-- New user onboarding (store + profile)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.setup_new_store(
  p_display_name text,
  p_store_name text DEFAULT 'My Sari-Sari Store'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id uuid;
  v_user_id uuid := auth.uid();
  v_email text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RETURN (SELECT store_id FROM public.profiles WHERE id = v_user_id);
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  INSERT INTO public.stores (name) VALUES (p_store_name)
  RETURNING id INTO v_store_id;

  INSERT INTO public.profiles (id, store_id, email, display_name, role)
  VALUES (v_user_id, v_store_id, COALESCE(v_email, ''), p_display_name, 'owner');

  RETURN v_store_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.setup_new_store(text, text) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utang ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS stores_select_member ON public.stores;
DROP POLICY IF EXISTS customers_store ON public.customers;
DROP POLICY IF EXISTS products_store ON public.products;
DROP POLICY IF EXISTS sales_store ON public.sales;
DROP POLICY IF EXISTS sale_items_store ON public.sale_items;
DROP POLICY IF EXISTS utang_store ON public.utang;
DROP POLICY IF EXISTS payments_store ON public.payments;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = auth.uid());

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

-- =============================================================
-- Gebeya Marketplace: Core Schema
-- Tables: profiles, products, orders, order_items
-- RLS policies for role-based access
-- Auto-profile creation trigger on auth.users signup
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES TABLE
-- Extends auth.users with role, farm info, trust level
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('farmer', 'buyer', 'admin')),
  full_name text,
  avatar_url text,
  phone text,
  farm_name text,
  farm_location text,
  trust_level text DEFAULT 'Bronze' CHECK (trust_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: anyone authenticated can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Only admins can insert profiles (for manual admin creation)
-- Regular users get profiles via the trigger below
CREATE POLICY "Service can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 2. AUTO-PROFILE CREATION TRIGGER
-- When a new user signs up, automatically create a profile row
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    avatar_url,
    farm_name,
    farm_location
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'farm_name',
    NEW.raw_user_meta_data->>'farm_location'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Crops', 'Poultry', 'Fishery', 'Processed', 'Other')),
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'lbs', 'piece', 'dozen', 'bunch')),
  harvest_date date,
  location text,
  images text[] DEFAULT '{}',
  delivery_options text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view available products
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Farmers can insert their own products
CREATE POLICY "Farmers can insert own products"
  ON public.products FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

-- Farmers can update their own products
CREATE POLICY "Farmers can update own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = farmer_id);

-- Farmers can delete their own products
CREATE POLICY "Farmers can delete own products"
  ON public.products FOR DELETE
  USING (auth.uid() = farmer_id);

-- ─────────────────────────────────────────────────────────────
-- 4. ORDERS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total numeric(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  status text NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Accepted', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  delivery_address text,
  shipping_cost numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Buyers can insert their own orders
CREATE POLICY "Buyers can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Buyers can update their own orders (e.g., cancel)
CREATE POLICY "Buyers can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Farmers can view orders that contain their products
CREATE POLICY "Farmers can view orders with their products"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id
      AND p.farmer_id = auth.uid()
    )
  );

-- Farmers can update order status (for orders with their products)
CREATE POLICY "Farmers can update orders with their products"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id
      AND p.farmer_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 5. ORDER ITEMS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own order items
CREATE POLICY "Buyers can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.buyer_id = auth.uid()
    )
  );

-- Farmers can view order items for their products
CREATE POLICY "Farmers can view order items for their products"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = order_items.product_id
      AND p.farmer_id = auth.uid()
    )
  );

-- Buyers can insert order items (as part of creating an order)
CREATE POLICY "Buyers can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND o.buyer_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.products;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Security: Revoke public execute on trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;

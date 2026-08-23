-- ======================================================================
--                       QUEKART MEESHO CLONE
--               SUPABASE DATABASE SETUP & VERIFICATION
-- ======================================================================
-- This SQL script creates all required database tables, disables RLS / creates
-- permissive policies for seamless operation, and prepares the live DB schema.
--
-- HOW TO DEPLOY:
-- 1. Go to your Supabase Dashboard: https://supabase.com
-- 2. Select your Project -> Click "SQL Editor" in the left sidebar menu
-- 3. Click "+ New Query" (Blank Query)
-- 4. Copy and paste ALL lines of this script into the editor
-- 5. Click the "Run" button at the bottom right
-- 6. Go to the Admin Panel in your QueKart website and click "Verify DB Connection"!
-- ======================================================================

-- ----------------------------------------------------------------------
-- CLEANUP / PREPARATION
-- ----------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read on products" ON products;
DROP POLICY IF EXISTS "Allow full access on products to all" ON products;
DROP POLICY IF EXISTS "Allow public read on coupons" ON coupons;
DROP POLICY IF EXISTS "Allow full access on coupons to all" ON coupons;
DROP POLICY IF EXISTS "Allow public select and insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow full access on orders to all" ON orders;
DROP POLICY IF EXISTS "Allow public read on vendors" ON vendors;
DROP POLICY IF EXISTS "Allow full access on vendors to all" ON vendors;
DROP POLICY IF EXISTS "Allow full access on users to all" ON users;
DROP POLICY IF EXISTS "Allow full access on categories to all" ON categories;
DROP POLICY IF EXISTS "Allow full access on banners to all" ON banners;
DROP POLICY IF EXISTS "Allow full access on reviews to all" ON reviews;

-- ----------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on products to all" ON products FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 2. COUPONS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on coupons to all" ON coupons FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on orders to all" ON orders FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 4. VENDORS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on vendors to all" ON vendors FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 4.5. USERS TABLE (Real customer & user profiles)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on users to all" ON users FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 4.6. BANNERS TABLE (Promotional banners managed via Admin Panel)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on banners to all" ON banners FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 4.7. REVIEWS TABLE (Permanent dedicated reviews storage & fast lookup)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT,
    user_phone TEXT,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on reviews to all" ON reviews FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 5. CATEGORIES TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on categories to all" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE EXPRESSION INDEXES
-- ----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products ((data->>'vendorId'));
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products ((data->>'approvalStatus'));
CREATE INDEX IF NOT EXISTS idx_products_category ON products ((data->>'category'));
CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors ((data->>'phone'));
CREATE INDEX IF NOT EXISTS idx_users_phone ON users ((data->>'phone'));
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders ((data->>'status'));
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_phone ON reviews (user_phone);

-- ----------------------------------------------------------------------
-- 7. VIRTUAL EXTRACTED COLUMNS (FOR EASY DASHBOARD METRICS)
-- ----------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT GENERATED ALWAYS AS (data->>'title') STORED;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id TEXT GENERATED ALWAYS AS (data->>'vendorId') STORED;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status TEXT GENERATED ALWAYS AS (data->>'approvalStatus') STORED;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (data->>'status') STORED;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price NUMERIC GENERATED ALWAYS AS ((data->>'totalPrice')::numeric) STORED;

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS name TEXT GENERATED ALWAYS AS (data->>'name') STORED;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone TEXT GENERATED ALWAYS AS (data->>'phone') STORED;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (data->>'status') STORED;

ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT GENERATED ALWAYS AS (data->>'name') STORED;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT GENERATED ALWAYS AS (data->>'phone') STORED;

-- ======================================================================
-- SUCCESS: Your database tables are created with full permissions!
-- ======================================================================


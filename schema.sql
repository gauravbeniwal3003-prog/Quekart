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
DROP POLICY IF EXISTS "Allow full access on category_filters to all" ON category_filters;
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
-- 5.5. CATEGORY FILTERS TABLE (Header Pills & Filter Bar Management)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS category_filters (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE category_filters DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on category_filters to all" ON category_filters FOR ALL TO public USING (true) WITH CHECK (true);

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

-- ----------------------------------------------------------------------
-- 8. SEED THEME-ALIGNED CATEGORIES (Navy Blue #143C6B & Saffron Gold #FF8C00)
-- ----------------------------------------------------------------------
INSERT INTO categories (id, data, position) VALUES
('cat-popular', '{
  "id": "cat-popular",
  "name": "Popular",
  "icon": "star",
  "image": "https://images.unsplash.com/photo-1624456722134-8c805a415ff6?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Top Brands", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300"},
    {"name": "Festive Specials", "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300"},
    {"name": "Rakhi Collections", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300"},
    {"name": "Premium Collection", "image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 0)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-ethnic-wear', '{
  "id": "cat-ethnic-wear",
  "name": "Kurti, Saree & Ethnic Wear",
  "icon": "sparkles",
  "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Designer Kurtis", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300"},
    {"name": "Silk & Banarasi Sarees", "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300"},
    {"name": "Lehengas & Anarkalis", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300"},
    {"name": "Suits & Dress Material", "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300"},
    {"name": "Dupattas & Shawls", "image": "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 1)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-women-western', '{
  "id": "cat-women-western",
  "name": "Women Western",
  "icon": "sparkles",
  "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Western Dresses", "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300"},
    {"name": "Tops & Tunics", "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300"},
    {"name": "Jeans & Jeggings", "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=300"},
    {"name": "Party Wear", "image": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 2)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-men', '{
  "id": "cat-men",
  "name": "Men Fashion",
  "icon": "user",
  "image": "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Royal Kurta Sets", "image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300"},
    {"name": "Festive Sherwanis", "image": "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=300"},
    {"name": "Casual Shirts", "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300"},
    {"name": "Formal Trousers", "image": "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 3)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-jewellery', '{
  "id": "cat-jewellery",
  "name": "Jewellery & Accessories",
  "icon": "gem",
  "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Kundan & Gold Necklaces", "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300"},
    {"name": "Royal Bangles & Kadas", "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300"},
    {"name": "Earrings & Jhumkas", "image": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300"},
    {"name": "Clutches & Handbags", "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 4)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-kids', '{
  "id": "cat-kids",
  "name": "Kids & Toys",
  "icon": "baby",
  "image": "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Boys Festive Wear", "image": "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300"},
    {"name": "Girls Lehengas", "image": "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&q=80&w=300"},
    {"name": "Toys & Games", "image": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 5)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-home', '{
  "id": "cat-home",
  "name": "Home & Living",
  "icon": "home",
  "image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Royal Bedding & Cushions", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300"},
    {"name": "Festive Home Decors", "image": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300"},
    {"name": "Kitchenware & Dining", "image": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 6)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;

INSERT INTO categories (id, data, position) VALUES
('cat-footwear', '{
  "id": "cat-footwear",
  "name": "Footwear & Bags",
  "icon": "shopping-bag",
  "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=600",
  "subCategories": [
    {"name": "Mojaris & Ethnic Juttis", "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300"},
    {"name": "Ethnic Heels & Wedges", "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300"},
    {"name": "Handbags & Sling Bags", "image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=300"}
  ]
}'::jsonb, 7)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;


-- ----------------------------------------------------------------------
-- 10. OTP VERIFICATIONS TABLE (For persistent auth & multi-instance cross-domain sync)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_verifications (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    ten_digit TEXT NOT NULL,
    otp TEXT NOT NULL,
    alt_otps JSONB DEFAULT '[]'::jsonb,
    role TEXT DEFAULT 'user',
    is_signup BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE otp_verifications DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on otp_verifications to all" ON otp_verifications FOR ALL TO public USING (true) WITH CHECK (true);

INSERT INTO banners (id, data) VALUES
('banner-rakhi-1', '{
  "id": "banner-rakhi-1",
  "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200",
  "type": "promotional",
  "title": "RAKSHA BANDHAN MAHOTSAV",
  "subtitle": "Up to 80% OFF on Designer Sarees, Kurtis & Festive Gift Sets",
  "code": "RAKHI80",
  "targetCategory": "Kurti, Saree & Ethnic Wear"
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO banners (id, data) VALUES
('banner-rakhi-2', '{
  "id": "banner-rakhi-2",
  "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
  "type": "promotional",
  "title": "BHAI-BEHEN SPECIAL GIFT HAMPER",
  "subtitle": "Flat ₹100 Instant Discount on Royal Kundan & Gold Jewellery",
  "code": "FESTIVE100",
  "targetCategory": "Jewellery & Accessories"
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

INSERT INTO banners (id, data) VALUES
('banner-rakhi-3', '{
  "id": "banner-rakhi-3",
  "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200",
  "type": "promotional",
  "title": "ROYAL ETHNIC RAKHI COLLECTION",
  "subtitle": "Buy 2 Get 1 FREE on All Festive Apparel & Sherwanis",
  "code": "BUY2GET1",
  "targetCategory": "Men Fashion"
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;


-- ======================================================================
--                       QUEKART MEESHO CLONE
--               SUPABASE DATABASE SETUP & VERIFICATION
-- ======================================================================
-- This SQL script creates all required database tables, establishes correct 
-- access policies (Row Level Security - RLS), and seeds standard default 
-- data to guarantee a 100% stable connection with zero friction.
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
-- Drop existing policies if they exist to prevent name collision errors during execution
DROP POLICY IF EXISTS "Allow public read on products" ON products;
DROP POLICY IF EXISTS "Allow full access on products to all" ON products;
DROP POLICY IF EXISTS "Allow public read on coupons" ON coupons;
DROP POLICY IF EXISTS "Allow full access on coupons to all" ON coupons;
DROP POLICY IF EXISTS "Allow public select and insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow public read on vendors" ON vendors;
DROP POLICY IF EXISTS "Allow full access on vendors to all" ON vendors;

-- ----------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security Configuration
-- By default, we disable RLS to guarantee that the server API can read and write instantly.
-- If you want to use Supabase's built-in authentication/security rules in the future,
-- you can uncomment the "ALTER TABLE... ENABLE ROW LEVEL SECURITY" block below.
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- OPTIONAL Permissive Security Policies (Uncomment if you enable RLS above):
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access on products to all" ON products FOR ALL TO public USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------
-- 2. COUPONS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- OPTIONAL Permissive Security Policies (Uncomment if you enable RLS above):
-- ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access on coupons to all" ON coupons FOR ALL TO public USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------
-- 3. ORDERS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- OPTIONAL Permissive Security Policies (Uncomment if you enable RLS above):
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access on orders to all" ON orders FOR ALL TO public USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------
-- 4. VENDORS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;

-- OPTIONAL Permissive Security Policies (Uncomment if you enable RLS above):
-- ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow full access on vendors to all" ON vendors FOR ALL TO public USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------
-- SEED DEFAULT DATA (Only inserts if not already existing)
-- ----------------------------------------------------------------------

-- Default Coupon Seed Data
INSERT INTO coupons (code, data)
VALUES 
('QUEKART50', '{"code": "QUEKART50", "value": 50, "minPurchase": 299, "discountType": "flat", "description": "Flat ₹50 OFF on orders above ₹299"}'),
('MEESHO15', '{"code": "MEESHO15", "value": 15, "minPurchase": 0, "discountType": "percentage", "description": "15% OFF on all items (No minimum order)"}'),
('FESTIVE100', '{"code": "FESTIVE100", "value": 100, "minPurchase": 499, "discountType": "flat", "description": "Flat ₹100 OFF on orders above ₹499"}'),
('WELCOME20', '{"code": "WELCOME20", "value": 20, "minPurchase": 0, "discountType": "percentage", "description": "Flat 20% OFF on all products"}')
ON CONFLICT (code) DO NOTHING;

-- Default Vendor Seed Data
INSERT INTO vendors (id, data)
VALUES
('vendor-big-raj', '{"id": "vendor-big-raj", "name": "Rajasthan Handloom House", "email": "raj.handloom@quekart.com", "phone": "9876543210", "vendorType": "big", "businessCategory": "Apparel & Sarees", "gstin": "08AAAAA1111A1Z1", "rating": 4.8, "status": "active", "createdAt": "2026-07-14T00:00:00Z"}'),
('vendor-small-craft', '{"id": "vendor-small-craft", "name": "Jaipur Handcrafted Decors", "email": "jaipur.crafts@quekart.com", "phone": "9123456789", "vendorType": "small", "businessCategory": "Home & Kitchen", "gstin": "08BBBBB2222B2Z2", "rating": 4.2, "status": "active", "createdAt": "2026-07-14T00:00:00Z"}')
ON CONFLICT (id) DO NOTHING;

-- ======================================================================
-- SUCCESS: Your database tables are now created, optimized, and seeded!
-- ======================================================================


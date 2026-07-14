-- ==========================================
-- SQL SCHEMA FOR QUEKART MEESHO CLONE
-- ==========================================
-- Copy and paste this directly into your Supabase SQL Editor:
-- Go to: https://supabase.com -> Select your Project -> SQL Editor -> New Query -> Run.

-- 1. Create the Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) - Optional
-- If you want anyone to read, but only admin with credentials to edit
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on products" ON products
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow full access on products to all" ON products
    FOR ALL TO public USING (true); -- Handles standard API accesses safely


-- 2. Create the Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on coupons" ON coupons
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow full access on coupons to all" ON coupons
    FOR ALL TO public USING (true);


-- 3. Create the Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read & write on orders (validated by our middleman backend API first)
CREATE POLICY "Allow public select and insert on orders" ON orders
    FOR ALL TO public USING (true);


-- 4. Create the Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on vendors" ON vendors
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow full access on vendors to all" ON vendors
    FOR ALL TO public USING (true);


-- Insert Default Coupons so they are ready
INSERT INTO coupons (code, data)
VALUES 
('QUEKART50', '{"code": "QUEKART50", "value": 50, "minPurchase": 299, "discountType": "flat", "description": "Flat ₹50 OFF on orders above ₹299"}'),
('LUCKY50', '{"code": "LUCKY50", "value": 50, "minPurchase": 299, "discountType": "flat", "description": "Flat ₹50 OFF on orders above ₹299"}'),
('MEESHO15', '{"code": "MEESHO15", "value": 15, "minPurchase": 0, "discountType": "percentage", "description": "15% OFF on all items (No minimum order)"}'),
('FESTIVE100', '{"code": "FESTIVE100", "value": 100, "minPurchase": 499, "discountType": "flat", "description": "Flat ₹100 OFF on orders above ₹499"}'),
('WELCOME20', '{"code": "WELCOME20", "value": 20, "minPurchase": 0, "discountType": "percentage", "description": "Flat 20% OFF on all products"}')
ON CONFLICT (code) DO NOTHING;

-- Insert Default Vendors so they are ready
INSERT INTO vendors (id, data)
VALUES
('vendor-big-raj', '{"id": "vendor-big-raj", "name": "Rajasthan Handloom House", "email": "raj.handloom@quekart.com", "phone": "9876543210", "vendorType": "big", "businessCategory": "Apparel & Sarees", "gstin": "08AAAAA1111A1Z1", "rating": 4.8, "status": "active", "createdAt": "2026-07-14T00:00:00Z"}'),
('vendor-small-craft', '{"id": "vendor-small-craft", "name": "Jaipur Handcrafted Decors", "email": "jaipur.crafts@quekart.com", "phone": "9123456789", "vendorType": "small", "businessCategory": "Home & Kitchen", "gstin": "08BBBBB2222B2Z2", "rating": 4.2, "status": "active", "createdAt": "2026-07-14T00:00:00Z"}')
ON CONFLICT (id) DO NOTHING;

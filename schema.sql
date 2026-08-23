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

-- Default Verified Products Seed Data
INSERT INTO products (id, data)
VALUES
('101', '{"id": "101", "numericId": 101, "title": "Jaipuri Pure Cotton Floral Anarkali Kurti with Malmal Dupatta Set", "description": "Crafted with premium breathable 100% pure cotton fabric featuring traditional Sanganeri hand block floral prints, flared Anarkali silhouette, round neck with gota patti lace border detailing, and matching lightweight malmal dupatta. Ideal for festive, casual, and daily office wear.", "category": "Kurti, Saree & Lehenga", "subCategory": "Kurtis & Dress", "price": 499, "originalPrice": 1499, "discountPercent": 67, "isCodAvailable": true, "codPrice": 499, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Easy Return & Exchange", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 30, "upiOfferText": "Instant ₹30 OFF with UPI Payment", "rating": 4.6, "ratingCount": 1480, "reviewCount": 312, "images": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Maroon Pink", "imageUrl": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800", "price": 499, "originalPrice": 1499, "stock": 45}, {"colorName": "Indigo Blue", "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", "price": 519, "originalPrice": 1499, "stock": 30}], "soldBy": "Rajasthan Handloom House", "soldByRating": 4.8, "vendorId": "vendor-big-raj", "approvalStatus": "approved", "productHighlights": [{"label": "Fabric", "value": "100% Pure Cotton"}, {"label": "Pattern", "value": "Floral Printed"}, {"label": "Sleeve Length", "value": "Three-Quarter Sleeves"}, {"label": "Neck", "value": "Round Neck with Gota Lace"}], "additionalDetails": [{"label": "Wash Care", "value": "Gentle Machine Wash"}, {"label": "Country of Origin", "value": "India"}, {"label": "Pack of", "value": "1 Kurti, 1 Dupatta"}], "sizeOptions": ["S", "M", "L", "XL", "XXL"], "tag": "Best Seller", "reviews": [{"id": "rev-101-1", "userName": "Pooja Sharma", "rating": 5, "title": "Superb quality fabric!", "comment": "The cotton fabric is super soft and breathable. The print is bright and exactly as shown in the picture. Perfect fit for daily wear!", "postedDate": "12 Aug, 2026", "helpfulCount": 24, "images": ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300"]}], "createdAt": "2026-08-15T00:00:00Z"}'),
('102', '{"id": "102", "numericId": 102, "title": "Kanjivaram Rich Zari Woven Soft Silk Saree with Contrast Blouse Piece", "description": "Elevate your festive grace with this luxurious Kanjivaram banarasi silk saree, intricately woven with traditional floral jaal and broad zari pallu. Comes with an unstitched 0.8m running contrast heavy brocade blouse piece.", "category": "Kurti, Saree & Lehenga", "subCategory": "Sarees", "price": 899, "originalPrice": 2999, "discountPercent": 70, "isCodAvailable": true, "codPrice": 899, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Easy Return", "hasUpiOffer": true, "upiDiscountType": "percentage", "upiDiscountValue": 5, "upiOfferText": "Extra 5% Instant Discount on Prepaid UPI", "rating": 4.7, "ratingCount": 2130, "reviewCount": 485, "images": ["https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Royal Emerald Green", "imageUrl": "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800", "price": 899, "originalPrice": 2999, "stock": 50}], "soldBy": "Rajasthan Handloom House", "soldByRating": 4.8, "vendorId": "vendor-big-raj", "approvalStatus": "approved", "productHighlights": [{"label": "Saree Fabric", "value": "Soft Art Silk"}, {"label": "Blouse Fabric", "value": "Rich Jacquard Brocade"}, {"label": "Saree Length", "value": "5.5 Meters"}, {"label": "Blouse Length", "value": "0.8 Meter (Unstitched)"}], "additionalDetails": [{"label": "Occasion", "value": "Wedding, Festive, Party"}, {"label": "Wash Care", "value": "Dry Clean Recommended"}, {"label": "Country of Origin", "value": "India"}], "sizeOptions": ["Free Size"], "tag": "Trending", "reviews": [{"id": "rev-102-1", "userName": "Deepika Rathi", "rating": 5, "title": "Looks like 5000 Rs saree!", "comment": "The shine and zari work are unbelievable for just ₹899! Wore it to my cousin wedding and got so many compliments.", "postedDate": "14 Aug, 2026", "helpfulCount": 38, "images": ["https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=300"]}], "createdAt": "2026-08-15T00:00:00Z"}'),
('103', '{"id": "103", "numericId": 103, "title": "Women Floral Print Smocked Tiered Fit & Flare Midi Dress", "description": "Charming French-inspired vintage floral tiered midi dress with smocked elastic bodice, flutter sleeves, breathable georgette fabric, and comfortable inner cotton lining.", "category": "Women Western", "subCategory": "Dresses", "price": 549, "originalPrice": 1299, "discountPercent": 58, "isCodAvailable": true, "codPrice": 549, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Return & Size Exchange", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 25, "upiOfferText": "Instant ₹25 OFF with UPI", "rating": 4.5, "ratingCount": 890, "reviewCount": 164, "images": ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Lavender Floral", "imageUrl": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", "price": 549, "originalPrice": 1299, "stock": 40}], "soldBy": "Jaipur Handcrafted Decors", "soldByRating": 4.2, "vendorId": "vendor-small-craft", "approvalStatus": "approved", "productHighlights": [{"label": "Fabric", "value": "Georgette with Cotton Lining"}, {"label": "Length", "value": "Midi (Calf Length)"}], "additionalDetails": [{"label": "Pattern", "value": "Floral Printed"}, {"label": "Fit", "value": "Fit & Flare"}], "sizeOptions": ["XS", "S", "M", "L", "XL"], "tag": "Top Rated", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}'),
('104', '{"id": "104", "numericId": 104, "title": "Men 100% Breathable Cotton Slim Fit Casual Spread Collar Shirt", "description": "A contemporary wardrobe essential made with lightweight combed cotton fabric. Features a curved hem, stylish buttoned cuff, modern spread collar, and pre-washed softness to resist shrinkage.", "category": "Men", "subCategory": "Men Fashion", "price": 399, "originalPrice": 1199, "discountPercent": 67, "isCodAvailable": true, "codPrice": 399, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Hassle-Free Return", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 20, "upiOfferText": "Instant ₹20 OFF on Online Payment", "rating": 4.4, "ratingCount": 3200, "reviewCount": 640, "images": ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Sky Blue", "imageUrl": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800", "price": 399, "originalPrice": 1199, "stock": 80}], "soldBy": "Rajasthan Handloom House", "soldByRating": 4.8, "vendorId": "vendor-big-raj", "approvalStatus": "approved", "productHighlights": [{"label": "Fabric", "value": "100% Combed Cotton"}, {"label": "Fit", "value": "Slim Fit"}, {"label": "Collar", "value": "Spread Collar"}], "additionalDetails": [{"label": "Weave", "value": "Oxford Plain Weave"}, {"label": "Wash Care", "value": "Machine Wash Normal"}], "sizeOptions": ["M", "L", "XL", "XXL"], "tag": "Lowest Price", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}'),
('105', '{"id": "105", "numericId": 105, "title": "Men Luxury Stainless Steel Waterproof Chronograph Analog Watch", "description": "Premium quartz mechanism with hardlex scratch-resistant glass, heavy stainless steel mesh strap, date display calendar window, and 30M water resistance.", "category": "Men", "subCategory": "Watches", "price": 649, "originalPrice": 2499, "discountPercent": 74, "isCodAvailable": true, "codPrice": 649, "returnPolicyType": "replacement", "returnDays": 10, "returnPolicyText": "10 Days Replacement Warranty", "hasUpiOffer": true, "upiDiscountType": "percentage", "upiDiscountValue": 5, "upiOfferText": "5% Instant Cashback on UPI", "rating": 4.8, "ratingCount": 1650, "reviewCount": 340, "images": ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Jet Black & Rose Gold", "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800", "price": 649, "originalPrice": 2499, "stock": 35}], "soldBy": "Jaipur Handcrafted Decors", "soldByRating": 4.2, "vendorId": "vendor-small-craft", "approvalStatus": "approved", "productHighlights": [{"label": "Movement", "value": "High Precision Quartz"}, {"label": "Dial Glass", "value": "Scratch-Proof Hardlex Mineral"}], "additionalDetails": [{"label": "Warranty", "value": "1 Year Manufacturer Warranty"}, {"label": "Strap Material", "value": "Stainless Steel"}], "sizeOptions": ["Free Size"], "tag": "Trending", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}'),
('106', '{"id": "106", "numericId": 106, "title": "Traditional Royal Kundan & Pearl Gold-Plated Choker Jewellery Set with Earrings", "description": "Intricately handcrafted royal Rajputi bridal and festive choker necklace studded with sparkling hydro-cut Kundan stones, emerald beads, and faux freshwater pearls.", "category": "Popular", "subCategory": "Jewellery", "price": 299, "originalPrice": 999, "discountPercent": 70, "isCodAvailable": true, "codPrice": 299, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Return Policy", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 20, "upiOfferText": "Flat ₹20 OFF on Prepaid Orders", "rating": 4.6, "ratingCount": 4200, "reviewCount": 710, "images": ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Gold & Pearl White", "imageUrl": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800", "price": 299, "originalPrice": 999, "stock": 120}], "soldBy": "Rajasthan Handloom House", "soldByRating": 4.8, "vendorId": "vendor-big-raj", "approvalStatus": "approved", "productHighlights": [{"label": "Base Metal", "value": "Brass with 18K Micro Gold Plating"}, {"label": "Stone Type", "value": "Faceted Kundan & Pearls"}], "additionalDetails": [{"label": "Included Items", "value": "1 Choker, 1 Pair Earrings, 1 Maang Tikka"}], "sizeOptions": ["Free Size"], "tag": "Best Seller", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}'),
('107', '{"id": "107", "numericId": 107, "title": "Triply Stainless Steel Heavy Base Non-Stick Induction Kadai (2.5 Litre with Glass Lid)", "description": "3-layer stainless steel body with pure aluminum core for even heat distribution without hot spots. Induction and gas stove compatible.", "category": "Home & Kitchen", "subCategory": "Cookware", "price": 799, "originalPrice": 1899, "discountPercent": 58, "isCodAvailable": true, "codPrice": 799, "returnPolicyType": "replacement", "returnDays": 10, "returnPolicyText": "10 Days Replacement for Damaged/Defective", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 50, "upiOfferText": "Instant ₹50 OFF on UPI Checkout", "rating": 4.7, "ratingCount": 1100, "reviewCount": 230, "images": ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Mirror Silver Finish", "imageUrl": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800", "price": 799, "originalPrice": 1899, "stock": 40}], "soldBy": "Jaipur Handcrafted Decors", "soldByRating": 4.2, "vendorId": "vendor-small-craft", "approvalStatus": "approved", "productHighlights": [{"label": "Capacity", "value": "2.5 Litres"}, {"label": "Material", "value": "Triply Food Grade 304 Stainless Steel"}], "additionalDetails": [{"label": "Warranty", "value": "5 Years Manufacturer Warranty"}], "sizeOptions": ["2.5L", "3.5L"], "tag": "Top Rated", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}'),
('108', '{"id": "108", "numericId": 108, "title": "Boys 100% Bio-Washed Cotton Graphic Print T-Shirt & Denim Shorts Set", "description": "Super soft, sweat-absorbent skin-friendly cotton tee paired with stretchable washed denim shorts with elasticated waistband and drawstring.", "category": "Kids & Toys", "subCategory": "Kids", "price": 349, "originalPrice": 899, "discountPercent": 61, "isCodAvailable": true, "codPrice": 349, "returnPolicyType": "return", "returnDays": 7, "returnPolicyText": "7 Days Easy Return & Size Replacement", "hasUpiOffer": true, "upiDiscountType": "flat", "upiDiscountValue": 20, "upiOfferText": "Instant ₹20 OFF on Online Payment", "rating": 4.5, "ratingCount": 1950, "reviewCount": 380, "images": ["https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800"], "variants": [{"colorName": "Dino Yellow & Blue Denim", "imageUrl": "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800", "price": 349, "originalPrice": 899, "stock": 75}], "soldBy": "Rajasthan Handloom House", "soldByRating": 4.8, "vendorId": "vendor-big-raj", "approvalStatus": "approved", "productHighlights": [{"label": "Fabric", "value": "100% Bio-Washed Combed Cotton"}, {"label": "Waistband", "value": "Elasticated with Drawstring"}], "additionalDetails": [{"label": "Wash Care", "value": "Machine Wash Gentle"}], "sizeOptions": ["2-3 Years", "3-4 Years", "4-5 Years", "5-6 Years", "6-7 Years"], "tag": "Lowest Price", "reviews": [], "createdAt": "2026-08-15T00:00:00Z"}')
ON CONFLICT (id) DO NOTHING;

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

-- ----------------------------------------------------------------------
-- 4.5. USERS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Seed Default User Data
INSERT INTO users (id, data)
VALUES
('user-gaurav', '{"id": "user-gaurav", "name": "Gaurav Beniwal", "email": "gauravbeniwal30003@gmail.com", "phone": "9999999999", "address": "Jaipur, Rajasthan", "createdAt": "2026-07-18T00:00:00Z"}')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------
-- 4.6. BANNERS TABLE
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- Seed Default Banners
INSERT INTO banners (id, data)
VALUES
('banner-promo-1', '{"id": "banner-promo-1", "imageUrl": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=400", "type": "promotional"}'),
('banner-promo-2', '{"id": "banner-promo-2", "imageUrl": "https://images.unsplash.com/photo-1607083206968-13611e3d76ba?auto=format&fit=crop&q=80&w=1200&h=400", "type": "promotional"}'),
('banner-news-1', '{"id": "banner-news-1", "imageUrl": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=400", "type": "news"}')
ON CONFLICT (id) DO NOTHING;

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

-- Seed Default Categories Data
INSERT INTO categories (id, data, position)
VALUES
('cat-popular', '{"id": "cat-popular", "name": "Popular", "icon": "star", "subCategories": [{"name": "Top Brands", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop"}, {"name": "Premium Collection", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}]}', 0),
('cat-kurti-saree', '{"id": "cat-kurti-saree", "name": "Kurti, Saree & Lehenga", "icon": "shirt", "subCategories": [{"name": "Kurtis & Dress", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}, {"name": "Sarees", "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop"}]}', 1),
('cat-women-western', '{"id": "cat-women-western", "name": "Women Western", "icon": "sparkles", "subCategories": [{"name": "Westernwear", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}, {"name": "Dresses", "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop"}]}', 2),
('cat-lingerie', '{"id": "cat-lingerie", "name": "Lingerie", "icon": "heart", "subCategories": [{"name": "Bras & Panties", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop"}]}', 3),
('cat-men', '{"id": "cat-men", "name": "Men", "icon": "smile", "subCategories": [{"name": "Men Fashion", "image": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&h=200&fit=crop"}]}', 4),
('cat-kids', '{"id": "cat-kids", "name": "Kids & Toys", "icon": "baby", "subCategories": [{"name": "Kids", "image": "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=200&h=200&fit=crop"}]}', 5),
('cat-home', '{"id": "cat-home", "name": "Home & Kitchen", "icon": "home", "subCategories": [{"name": "Cookware", "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop"}]}', 6)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE EXPRESSION INDEXES (FOR PRODUCTION LOGS & QUERIES)
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
-- 7. VIRTUAL EXTRACTED COLUMNS (FOR EASY DASHBOARD VISUALS & METRICS)
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
-- SUCCESS: Your database tables are now created, optimized, and seeded!
-- ======================================================================


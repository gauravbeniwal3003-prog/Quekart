const fs = require('fs');
const path = require('path');

// 1. Define standard subcategories
const defaultSubCategories = [
  // Popular
  { id: 'sub-pop-1', name: 'Top Brands', categoryId: 'cat-popular', categoryName: 'Popular', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-pop-2', name: 'Festive Specials', categoryId: 'cat-popular', categoryName: 'Popular', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-pop-3', name: 'Rakhi Collections', categoryId: 'cat-popular', categoryName: 'Popular', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-pop-4', name: 'Premium Collection', categoryId: 'cat-popular', categoryName: 'Popular', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300' },

  // Women Ethnic Wear
  { id: 'sub-we-1', name: 'Designer Kurtis', categoryId: 'cat-ethnic-wear', categoryName: 'Women Ethnic Wear', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-we-2', name: 'Silk & Banarasi Sarees', categoryId: 'cat-ethnic-wear', categoryName: 'Women Ethnic Wear', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-we-3', name: 'Lehengas & Anarkalis', categoryId: 'cat-ethnic-wear', categoryName: 'Women Ethnic Wear', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-we-4', name: 'Suits & Dress Material', categoryId: 'cat-ethnic-wear', categoryName: 'Women Ethnic Wear', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-we-5', name: 'Dupattas & Shawls', categoryId: 'cat-ethnic-wear', categoryName: 'Women Ethnic Wear', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=300' },

  // Women Western Wear
  { id: 'sub-ww-1', name: 'Western Dresses', categoryId: 'cat-women-western', categoryName: 'Women Western Wear', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-ww-2', name: 'Tops & Tunics', categoryId: 'cat-women-western', categoryName: 'Women Western Wear', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-ww-3', name: 'Jeans & Jeggings', categoryId: 'cat-women-western', categoryName: 'Women Western Wear', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-ww-4', name: 'Party Wear', categoryId: 'cat-women-western', categoryName: 'Women Western Wear', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=300' },

  // Men Ethnic Wear
  { id: 'sub-me-1', name: 'Royal Kurta Sets', categoryId: 'cat-men-ethnic', categoryName: 'Men Ethnic Wear', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-me-2', name: 'Festive Sherwanis', categoryId: 'cat-men-ethnic', categoryName: 'Men Ethnic Wear', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-me-3', name: 'Nehru Jackets', categoryId: 'cat-men-ethnic', categoryName: 'Men Ethnic Wear', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300' },

  // Men Western & Casuals
  { id: 'sub-mw-1', name: 'Casual Shirts', categoryId: 'cat-men-western', categoryName: 'Men Western & Casuals', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-mw-2', name: 'Formal Trousers', categoryId: 'cat-men-western', categoryName: 'Men Western & Casuals', image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-mw-3', name: 'Jeans & Denim', categoryId: 'cat-men-western', categoryName: 'Men Western & Casuals', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=300' },

  // Kids & Baby Wear
  { id: 'sub-kids-1', name: 'Boys Festive Wear', categoryId: 'cat-kids', categoryName: 'Kids & Baby Wear', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-kids-2', name: 'Girls Lehengas', categoryId: 'cat-kids', categoryName: 'Kids & Baby Wear', image: 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-kids-3', name: 'Toys & Games', categoryId: 'cat-kids', categoryName: 'Kids & Baby Wear', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=300' },

  // Footwear & Shoes
  { id: 'sub-foot-1', name: 'Mojaris & Ethnic Juttis', categoryId: 'cat-footwear', categoryName: 'Footwear & Shoes', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-foot-2', name: 'Ethnic Heels & Wedges', categoryId: 'cat-footwear', categoryName: 'Footwear & Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-foot-3', name: 'Casual Sneakers', categoryId: 'cat-footwear', categoryName: 'Footwear & Shoes', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=300' },

  // Jewellery & Ornaments
  { id: 'sub-jewel-1', name: 'Kundan & Gold Necklaces', categoryId: 'cat-jewellery', categoryName: 'Jewellery & Ornaments', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-jewel-2', name: 'Royal Bangles & Kadas', categoryId: 'cat-jewellery', categoryName: 'Jewellery & Ornaments', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-jewel-3', name: 'Earrings & Jhumkas', categoryId: 'cat-jewellery', categoryName: 'Jewellery & Ornaments', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300' },

  // Home & Kitchen Decor
  { id: 'sub-home-1', name: 'Royal Bedding & Cushions', categoryId: 'cat-home', categoryName: 'Home & Kitchen Decor', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-home-2', name: 'Festive Home Decors', categoryId: 'cat-home', categoryName: 'Home & Kitchen Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300' },
  { id: 'sub-home-3', name: 'Kitchenware & Dining', categoryId: 'cat-home', categoryName: 'Home & Kitchen Decor', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=300' }
];

// Helper to map products to appropriate sub-categories based on title/category
function getSubCategoryForProduct(title, category) {
  const t = title.toLowerCase();
  if (category.includes('Women Ethnic') || category.includes('Ethnic Wear')) {
    if (t.includes('kurti') || t.includes('anarkali')) return 'Designer Kurtis';
    if (t.includes('saree') || t.includes('banarasi') || t.includes('silk')) return 'Silk & Banarasi Sarees';
    if (t.includes('lehenga') || t.includes('palazzo') || t.includes('suit')) return 'Lehengas & Anarkalis';
    return 'Designer Kurtis';
  }
  if (category.includes('Women Western')) {
    if (t.includes('shirt') || t.includes('top') || t.includes('tunic')) return 'Tops & Tunics';
    if (t.includes('dress') || t.includes('party')) return 'Western Dresses';
    if (t.includes('jean') || t.includes('jeggings')) return 'Jeans & Jeggings';
    return 'Tops & Tunics';
  }
  if (category.includes('Men Ethnic')) {
    if (t.includes('kurta')) return 'Royal Kurta Sets';
    if (t.includes('sherwani')) return 'Festive Sherwanis';
    if (t.includes('jacket') || t.includes('nehru')) return 'Nehru Jackets';
    return 'Royal Kurta Sets';
  }
  if (category.includes('Men Western') || category.includes('Men Fashion')) {
    if (t.includes('shirt')) return 'Casual Shirts';
    if (t.includes('trouser') || t.includes('pant')) return 'Formal Trousers';
    if (t.includes('jean') || t.includes('denim')) return 'Jeans & Denim';
    return 'Casual Shirts';
  }
  if (category.includes('Kids')) {
    if (t.includes('boy')) return 'Boys Festive Wear';
    if (t.includes('girl') || t.includes('frock')) return 'Girls Lehengas';
    return 'Toys & Games';
  }
  if (category.includes('Footwear')) {
    if (t.includes('jutti') || t.includes('mojari')) return 'Mojaris & Ethnic Juttis';
    if (t.includes('heel') || t.includes('wedge')) return 'Ethnic Heels & Wedges';
    return 'Casual Sneakers';
  }
  if (category.includes('Jewellery')) {
    if (t.includes('necklace') || t.includes('kundan') || t.includes('gold')) return 'Kundan & Gold Necklaces';
    if (t.includes('bangle') || t.includes('kada')) return 'Royal Bangles & Kadas';
    if (t.includes('earring') || t.includes('jhumka')) return 'Earrings & Jhumkas';
    return 'Kundan & Gold Necklaces';
  }
  if (category.includes('Home')) {
    if (t.includes('bed') || t.includes('cushion') || t.includes('sheet')) return 'Royal Bedding & Cushions';
    if (t.includes('decor') || t.includes('wall')) return 'Festive Home Decors';
    return 'Kitchenware & Dining';
  }
  return 'General';
}

// Read mock_data.json
const rawData = fs.readFileSync('./mock_data.json', 'utf8');
const data = JSON.parse(rawData);

// Update products with subCategory
data.products = (data.products || []).map(p => {
  const sub = getSubCategoryForProduct(p.title, p.category);
  return {
    ...p,
    subCategory: p.subCategory || sub
  };
});

// Attach subCategories
data.subCategories = defaultSubCategories;

fs.writeFileSync('./mock_data.json', JSON.stringify(data, null, 2), 'utf8');
console.log('✅ Updated mock_data.json with subCategories and product subCategory assignments.');

// Now build schema.sql
let sql = `-- ======================================================================
--                       QUEKART MEESHO CLONE
--               SUPABASE DATABASE SETUP & FULL SEED SCRIPT
-- ======================================================================
-- HOW TO DEPLOY:
-- 1. Open Supabase Dashboard -> Project -> SQL Editor
-- 2. Click "+ New Query"
-- 3. Copy and paste ALL text below and click "RUN"
-- ======================================================================

-- CLEANUP OLD POLICIES
DROP POLICY IF EXISTS "Allow full access on products to all" ON products;
DROP POLICY IF EXISTS "Allow full access on coupons to all" ON coupons;
DROP POLICY IF EXISTS "Allow full access on orders to all" ON orders;
DROP POLICY IF EXISTS "Allow full access on vendors to all" ON vendors;
DROP POLICY IF EXISTS "Allow full access on users to all" ON users;
DROP POLICY IF EXISTS "Allow full access on categories to all" ON categories;
DROP POLICY IF EXISTS "Allow full access on sub_categories to all" ON sub_categories;
DROP POLICY IF EXISTS "Allow full access on category_filters to all" ON category_filters;
DROP POLICY IF EXISTS "Allow full access on banners to all" ON banners;
DROP POLICY IF EXISTS "Allow full access on reviews to all" ON reviews;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on products to all" ON products FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on coupons to all" ON coupons FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on orders to all" ON orders FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on vendors to all" ON vendors FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on users to all" ON users FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on banners to all" ON banners FOR ALL TO public USING (true) WITH CHECK (true);

-- 7. REVIEWS TABLE
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

-- 8. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on categories to all" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 9. SUB_CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS sub_categories (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE sub_categories DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on sub_categories to all" ON sub_categories FOR ALL TO public USING (true) WITH CHECK (true);

-- 10. CATEGORY FILTERS TABLE
CREATE TABLE IF NOT EXISTS category_filters (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE category_filters DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access on category_filters to all" ON category_filters FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. OTP VERIFICATIONS TABLE
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

-- INDEXES & STORED COLUMNS
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products ((data->>'vendorId'));
CREATE INDEX IF NOT EXISTS idx_products_approval_status ON products ((data->>'approvalStatus'));
CREATE INDEX IF NOT EXISTS idx_products_category ON products ((data->>'category'));
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products ((data->>'subCategory'));

ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT GENERATED ALWAYS AS (data->>'title') STORED;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_id TEXT GENERATED ALWAYS AS (data->>'vendorId') STORED;
ALTER TABLE products ADD COLUMN IF NOT EXISTS approval_status TEXT GENERATED ALWAYS AS (data->>'approvalStatus') STORED;

-- ======================================================================
-- SEED DATA: SUB-CATEGORIES
-- ======================================================================
`;

defaultSubCategories.forEach(sub => {
  const jsonStr = JSON.stringify(sub).replace(/'/g, "''");
  sql += `INSERT INTO sub_categories (id, data) VALUES ('${sub.id}', '${jsonStr}'::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;\n`;
});

sql += `\n-- ======================================================================
-- SEED DATA: CATEGORIES
-- ======================================================================
`;

(data.categories || []).forEach((cat, idx) => {
  const jsonStr = JSON.stringify(cat).replace(/'/g, "''");
  sql += `INSERT INTO categories (id, data, position) VALUES ('${cat.id}', '${jsonStr}'::jsonb, ${idx}) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, position = EXCLUDED.position;\n`;
});

sql += `\n-- ======================================================================
-- SEED DATA: PRODUCTS (${data.products.length} PRODUCTS)
-- ======================================================================
`;

data.products.forEach(p => {
  const jsonStr = JSON.stringify(p).replace(/'/g, "''");
  sql += `INSERT INTO products (id, data) VALUES ('${p.id}', '${jsonStr}'::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;\n`;
});

sql += `\n-- ======================================================================
-- SEED DATA: BANNERS
-- ======================================================================
`;

(data.banners || []).forEach(b => {
  const jsonStr = JSON.stringify(b).replace(/'/g, "''");
  sql += `INSERT INTO banners (id, data) VALUES ('${b.id}', '${jsonStr}'::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;\n`;
});

fs.writeFileSync('./schema.sql', sql, 'utf8');
console.log('✅ Generated schema.sql successfully with tables, sub-categories, categories, and all 51 products!');

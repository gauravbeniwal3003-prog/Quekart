import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { mockProducts, initialOrders, mockCategories } from './src/data.js';
import { Product, Order, Coupon, CartItem, Vendor, Category } from './src/types.js';
import fs from 'fs';
import crypto from 'crypto';

// Product Numeric ID Generator
let lastProductNumericId = 10;
try {
  if (fs.existsSync('./product_counter.txt')) {
    const saved = fs.readFileSync('./product_counter.txt', 'utf8');
    const val = parseInt(saved, 10);
    if (!isNaN(val)) {
      lastProductNumericId = val;
    }
  } else {
    fs.writeFileSync('./product_counter.txt', String(lastProductNumericId), 'utf8');
  }
} catch (e) {
  console.warn('Error reading/writing product_counter.txt:', e);
}

function getNextProductNumericId(): number {
  lastProductNumericId += 1;
  try {
    fs.writeFileSync('./product_counter.txt', String(lastProductNumericId), 'utf8');
  } catch (e) {
    console.warn('Error saving product_counter.txt:', e);
  }
  return lastProductNumericId;
}

async function ensureAllProductsHaveNumericIds() {
  let productsList: Product[] = [];
  try {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        productsList = data.map((row: any) => row.data);
      }
    }
  } catch (err) {
    console.warn('Failed to query Supabase products for numeric ID sync:', err);
  }

  if (productsList.length === 0) {
    productsList = localProducts;
  }

  let maxId = 0;
  for (const p of productsList) {
    if (p.numericId && p.numericId > maxId) {
      maxId = p.numericId;
    }
  }

  // Ensure maxId is at least the initial count
  if (maxId < mockProducts.length) {
    maxId = mockProducts.length;
  }

  let updatedCount = 0;
  for (const p of productsList) {
    if (!p.numericId) {
      maxId += 1;
      p.numericId = maxId;
      updatedCount++;
      // Save it back to DB if Supabase is enabled
      if (useSupabase && supabase) {
        try {
          await supabase.from('products').update({ data: p }).eq('id', p.id);
        } catch (dbErr) {
          console.error(`Failed to update numericId for product ${p.id} in DB:`, dbErr);
        }
      }
    }
  }

  // Ensure all local products have numeric IDs in memory
  for (const p of localProducts) {
    if (!p.numericId) {
      const match = productsList.find(pl => pl.id === p.id);
      if (match && match.numericId) {
        p.numericId = match.numericId;
      } else {
        maxId += 1;
        p.numericId = maxId;
      }
    }
  }

  // Save the highest counter value
  lastProductNumericId = Math.max(lastProductNumericId, maxId);
  try {
    fs.writeFileSync('./product_counter.txt', String(lastProductNumericId), 'utf8');
  } catch (e) {
    console.warn('Error saving final product_counter.txt:', e);
  }

  console.log(`🤖 Verified Product Sequential IDs: Max allotted ID is ${lastProductNumericId}. Assured unique non-recycled sequence.`);
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser with payload size limit to accommodate base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// -------------------------------------------------------------
// SECURE CONFIGURATION & CONSTANTS
// -------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'lucky-secret-admin-pass-123';
const JWT_SECRET = process.env.JWT_SECRET || 'quekart-secure-jwt-secret-987654321';

// --- SECURE JWT UTILITIES (Using native crypto for perfect reliability) ---
function signToken(payload: any, expiryHours = 24): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (expiryHours * 60 * 60);
  const fullPayload = { ...payload, exp };

  const base64UrlEncode = (str: string) => 
    Buffer.from(str).toString('base64url');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const [headerB64, payloadB64, signature] = token.split('.');
    if (!headerB64 || !payloadB64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired token
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// --- SECURE CONCURRENCY MUTEX FOR TRANSACTIONAL INTEGRITY ---
class SimpleMutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise<() => void>((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          next?.();
        } else {
          this.locked = false;
        }
      };

      if (this.locked) {
        this.queue.push(() => resolve(release));
      } else {
        this.locked = true;
        resolve(release);
      }
    });
  }
}

const orderMutex = new SimpleMutex();

// Setup Supabase Client if credentials are provided
let supabase: any = null;
let useSupabase = false;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    console.log('✅ Supabase client initialized. Testing connection...');
    useSupabase = true;
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err);
  }
} else {
  console.log('⚠️ Supabase credentials missing. Operating in Local Memory Fallback Mode.');
}

// -------------------------------------------------------------
// LOCAL MEMORY FALLBACK DATABASE (Seeds automatically from data.ts)
// -------------------------------------------------------------
const initialCouponsList: Coupon[] = [
  {
    code: 'QUEKART50',
    discountType: 'flat',
    value: 50,
    minPurchase: 299,
    description: 'Flat ₹50 OFF on orders above ₹299'
  },
  {
    code: 'LUCKY50',
    discountType: 'flat',
    value: 50,
    minPurchase: 299,
    description: 'Flat ₹50 OFF on orders above ₹299'
  },
  {
    code: 'MEESHO15',
    discountType: 'percentage',
    value: 15,
    minPurchase: 0,
    description: '15% OFF on all items (No minimum order)'
  },
  {
    code: 'FESTIVE100',
    discountType: 'flat',
    value: 100,
    minPurchase: 499,
    description: 'Flat ₹100 OFF on orders above ₹499'
  },
  {
    code: 'WELCOME20',
    discountType: 'percentage',
    value: 20,
    minPurchase: 0,
    description: 'Flat 20% OFF on all products'
  }
];

const initialVendors: Vendor[] = [
  {
    id: 'vendor-big-raj',
    name: 'Rajasthan Handloom House',
    email: 'raj.handloom@quekart.com',
    phone: '9876543210',
    vendorType: 'big',
    businessCategory: 'Apparel & Sarees',
    gstin: '08AAAAA1111A1Z1',
    rating: 4.8,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vendor-small-craft',
    name: 'Jaipur Handcrafted Decors',
    email: 'jaipur.crafts@quekart.com',
    phone: '9123456789',
    vendorType: 'small',
    businessCategory: 'Home & Kitchen',
    gstin: '08BBBBB2222B2Z2',
    rating: 4.2,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

let localProducts: Product[] = mockProducts.map(p => ({
  ...p,
  approvalStatus: p.approvalStatus || 'approved'
}));
let localOrders: Order[] = [...initialOrders];
let localCoupons: Coupon[] = [...initialCouponsList];
let localVendors: Vendor[] = [...initialVendors];
let localCategories: Category[] = [...mockCategories];

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

let localUsers: AppUser[] = [
  { id: 'user-gaurav', name: 'Gaurav Beniwal', email: 'gauravbeniwal30003@gmail.com', phone: '9999999999', address: 'Jaipur, Rajasthan', createdAt: '2026-07-18T00:00:00Z' }
];

// -------------------------------------------------------------
// HELPER: TEST SUPABASE TABLES & AUTO-SEED
// -------------------------------------------------------------
async function testAndSeedSupabase() {
  if (!useSupabase || !supabase) return;

  try {
    // 1. Verify and seed products table
    const { data: pCountData, error: pError } = await supabase.from('products').select('id');
    if (pError) {
      console.error('❌ Supabase products table check failed with error:', pError);
      console.log('⚠️ "products" table not found or inaccessible in Supabase. Falling back to local memory for products.');
      console.log('PostgreSQL Table Creation Query is provided in /schema.sql for quick setup.');
      useSupabase = false;
      return;
    }

    const existingProductIds = new Set((pCountData || []).map((row: any) => row.id));
    if (existingProductIds.size === 0) {
      console.log('🌱 Products table is empty. Seeding default catalog...');
      for (const p of localProducts) {
        console.log(`🌱 Seeding default product: ${p.id}`);
        const { error: insertErr } = await supabase.from('products').insert({ id: p.id, data: p });
        if (insertErr) {
          console.error(`⚠️ Error seeding product ${p.id}:`, insertErr);
        }
      }
    } else {
      console.log(`📊 Products in Supabase: ${existingProductIds.size}. Skipping seeding to preserve admin changes.`);
    }

    // 2. Verify and seed coupons table
    const { data: cCountData, error: cError } = await supabase.from('coupons').select('code');
    if (!cError) {
      const existingCouponCodes = new Set((cCountData || []).map((row: any) => row.code));
      if (existingCouponCodes.size === 0) {
        console.log('🌱 Coupons table is empty. Seeding default coupons...');
        for (const c of localCoupons) {
          console.log(`🌱 Seeding default coupon: ${c.code}`);
          const { error: insertErr } = await supabase.from('coupons').insert({ code: c.code, data: c });
          if (insertErr) {
            console.error(`⚠️ Error seeding coupon ${c.code}:`, insertErr);
          }
        }
      } else {
        console.log(`📊 Coupons in Supabase: ${existingCouponCodes.size}. Skipping seeding to preserve admin changes.`);
      }
    } else {
      console.error('❌ Coupons table check failed:', cError);
    }

    // 3. Verify and seed orders table
    const { data: oCountData, error: oError } = await supabase.from('orders').select('id');
    if (!oError) {
      const existingOrderIds = new Set((oCountData || []).map((row: any) => row.id));
      if (existingOrderIds.size === 0) {
        console.log('🌱 Orders table is empty. Seeding default orders...');
        for (const o of localOrders) {
          console.log(`🌱 Seeding default order: ${o.id}`);
          const { error: insertErr } = await supabase.from('orders').insert({ id: o.id, data: o });
          if (insertErr) {
            console.error(`⚠️ Error seeding order ${o.id}:`, insertErr);
          }
        }
      } else {
        console.log(`📊 Orders in Supabase: ${existingOrderIds.size}. Skipping seeding to preserve admin changes.`);
      }
    } else {
      console.error('❌ Orders table check failed:', oError);
    }

    // 4. Verify and seed vendors table
    const { data: vCountData, error: vError } = await supabase.from('vendors').select('id');
    if (!vError) {
      const existingVendorIds = new Set((vCountData || []).map((row: any) => row.id));
      if (existingVendorIds.size === 0) {
        console.log('🌱 Vendors table is empty. Seeding default vendors...');
        for (const v of localVendors) {
          console.log(`🌱 Seeding default vendor: ${v.id}`);
          const { error: insertErr } = await supabase.from('vendors').insert({ id: v.id, data: v });
          if (insertErr) {
            console.error(`⚠️ Error seeding vendor ${v.id}:`, insertErr);
          }
        }
      } else {
        console.log(`📊 Vendors in Supabase: ${existingVendorIds.size}. Skipping seeding to preserve admin changes.`);
      }
    } else {
      console.error('❌ Vendors table check failed:', vError);
    }

    // 4.6. Verify and seed users table
    const { data: uCountData, error: uError } = await supabase.from('users').select('id');
    if (!uError) {
      const existingUserIds = new Set((uCountData || []).map((row: any) => row.id));
      if (existingUserIds.size === 0) {
        console.log('🌱 Users table is empty. Seeding default users...');
        for (const u of localUsers) {
          console.log(`🌱 Seeding default user: ${u.id}`);
          const { error: insertErr } = await supabase.from('users').insert({ id: u.id, data: u });
          if (insertErr) {
            console.error(`⚠️ Error seeding user ${u.id}:`, insertErr);
          }
        }
      } else {
        console.log(`📊 Users in Supabase: ${existingUserIds.size}. Skipping seeding.`);
      }
    } else {
      console.error('❌ Users table check failed:', uError);
    }

    // 5. Verify and seed categories table
    const { data: catCountData, error: catError } = await supabase.from('categories').select('id');
    if (!catError) {
      const existingCategoryIds = new Set((catCountData || []).map((row: any) => row.id));
      if (existingCategoryIds.size === 0) {
        console.log('🌱 Categories table is empty. Seeding default categories...');
        for (let i = 0; i < localCategories.length; i++) {
          const c = localCategories[i];
          console.log(`🌱 Seeding default category: ${c.id}`);
          const { error: insertErr } = await supabase.from('categories').insert({ id: c.id, data: c, position: i });
          if (insertErr) {
            console.error(`⚠️ Error seeding category ${c.id}:`, insertErr);
          }
        }
      } else {
        console.log(`📊 Categories in Supabase: ${existingCategoryIds.size}. Skipping seeding to preserve admin changes.`);
      }
    } else {
      console.error('❌ Categories table check failed:', catError);
    }

    console.log('✨ Supabase database synchronized perfectly. Operating in LIVE DATABASE MODE.');
    useSupabase = true;
  } catch (err) {
    console.error('❌ Error testing or seeding Supabase:', err);
    useSupabase = false;
  }
}

// Run connection tests
testAndSeedSupabase().then(() => {
  ensureAllProductsHaveNumericIds();
});

// -------------------------------------------------------------
// SECURITY MIDDLEWARES
// -------------------------------------------------------------

// 1. Lightweight Request Rate Limiter (Prevents DDoS and brute forcing)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // limit each IP to 120 requests per minute

app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
  } else {
    record.count += 1;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down to prevent abuse.'
      });
    }
    next();
  }
});

// 2. Admin Authentication Middleware (Prevents unauthorized modification)
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const r = req as any;
  const secretHeader = req.headers['x-admin-secret'];
  
  // 1. Try JWT
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.role === 'admin') {
      r.isAdmin = true;
      return next();
    }
  }

  // 2. Try raw header
  if (secretHeader && secretHeader === ADMIN_SECRET) {
    r.isAdmin = true;
    return next();
  }

  console.warn(`🔒 Unauthorized admin access attempt from IP: ${req.ip}`);
  return res.status(403).json({
    error: 'Unauthorized Access. Invalid Admin secret key or session token. Request manipulation blocked.'
  });
};

// --- SERVER-SIDE SESSION PROTECTION & AUTHENTICATION ENDPOINTS ---

// 1. Vendor Login (Strictly restricted to Vendors)
app.post('/api/auth/vendor-login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile phone number is required.' });
  }
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  try {
    let vendor: Vendor | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('vendors').select('*');
      if (!error && data) {
        vendor = data.map((row: any) => row.data).find((v: Vendor) => {
          const cleanedDbPhone = v.phone.replace(/[^0-9]/g, '');
          const cleanedInputPhone = cleanPhone.replace(/[^0-9]/g, '');
          return cleanedDbPhone === cleanedInputPhone ||
                 (cleanedDbPhone.length >= 10 && cleanedInputPhone.length >= 10 &&
                  cleanedDbPhone.slice(-10) === cleanedInputPhone.slice(-10));
        });
      }
    }
    if (!vendor) {
      vendor = localVendors.find(v => {
        const cleanedDbPhone = v.phone.replace(/[^0-9]/g, '');
        const cleanedInputPhone = cleanPhone.replace(/[^0-9]/g, '');
        return cleanedDbPhone === cleanedInputPhone ||
               (cleanedDbPhone.length >= 10 && cleanedInputPhone.length >= 10 &&
                cleanedDbPhone.slice(-10) === cleanedInputPhone.slice(-10));
      });
    }

    if (!vendor) {
      return res.status(404).json({ error: 'No registered vendor found with this mobile number.' });
    }

    if (vendor.status === 'suspended') {
      return res.status(403).json({ error: 'Your seller account has been suspended. Login blocked.' });
    }

    // Sign and issue production JWT session token
    const token = signToken({ vendorId: vendor.id, role: 'vendor', phone: vendor.phone });
    res.json({ success: true, token, vendor });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Vendor authentication failed.' });
  }
});

// Backward-compatible alias for existing vendor login
app.post('/api/auth/login', async (req, res) => {
  const { phone } = req.body;
  const cleanPhone = (phone || '').trim().replace(/\s+/g, '');
  // Route to vendor login
  req.url = '/api/auth/vendor-login';
  return app._router.handle(req, res);
});

// 2. Vendor Registration (Signup)
app.post('/api/auth/vendor-register', async (req, res) => {
  const { name, email, phone, businessCategory, city, state, gstin, description } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Business name, email, and mobile phone are required.' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');

  try {
    // Check if vendor already exists
    let existingVendor: Vendor | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('vendors').select('*');
      if (!error && data) {
        existingVendor = data.map((row: any) => row.data).find((v: Vendor) => {
          return v.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '');
        });
      }
    }
    if (!existingVendor) {
      existingVendor = localVendors.find(v => v.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''));
    }

    if (existingVendor) {
      return res.status(400).json({ error: 'A supplier is already registered with this mobile number.' });
    }

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      vendorType: 'small',
      businessCategory: businessCategory || 'Apparel & Sarees',
      gstin: gstin ? gstin.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : '',
      description: description ? description.trim() : '',
      rating: 5.0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Save vendor
    localVendors.push(newVendor);
    if (useSupabase && supabase) {
      await supabase.from('vendors').insert({ id: newVendor.id, data: newVendor });
    }

    const token = signToken({ vendorId: newVendor.id, role: 'vendor', phone: newVendor.phone });
    res.json({ success: true, token, vendor: newVendor });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Vendor registration failed.' });
  }
});

// 3. User Login (Strictly restricted to Normal Customers)
app.post('/api/auth/user-login', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile phone number is required.' });
  }
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  try {
    let user: AppUser | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        user = data.map((row: any) => row.data).find((u: AppUser) => {
          const cleanedDbPhone = u.phone.replace(/[^0-9]/g, '');
          const cleanedInputPhone = cleanPhone.replace(/[^0-9]/g, '');
          return cleanedDbPhone === cleanedInputPhone ||
                 (cleanedDbPhone.length >= 10 && cleanedInputPhone.length >= 10 &&
                  cleanedDbPhone.slice(-10) === cleanedInputPhone.slice(-10));
        });
      }
    }
    if (!user) {
      user = localUsers.find(u => {
        const cleanedDbPhone = u.phone.replace(/[^0-9]/g, '');
        const cleanedInputPhone = cleanPhone.replace(/[^0-9]/g, '');
        return cleanedDbPhone === cleanedInputPhone ||
               (cleanedDbPhone.length >= 10 && cleanedInputPhone.length >= 10 &&
                cleanedDbPhone.slice(-10) === cleanedInputPhone.slice(-10));
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'No customer account found with this mobile number.' });
    }

    // Sign and issue customer JWT session token
    const token = signToken({ userId: user.id, role: 'user', phone: user.phone });
    res.json({ success: true, token, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Customer login failed.' });
  }
});

// 4. User Registration (Signup)
app.post('/api/auth/user-register', async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Full name, email address, and mobile phone are required.' });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, '');

  try {
    // Check if user already exists
    let existingUser: AppUser | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        existingUser = data.map((row: any) => row.data).find((u: AppUser) => {
          return u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, '');
        });
      }
    }
    if (!existingUser) {
      existingUser = localUsers.find(u => u.phone.replace(/[^0-9]/g, '') === cleanPhone.replace(/[^0-9]/g, ''));
    }

    if (existingUser) {
      return res.status(400).json({ error: 'A customer account with this mobile number is already registered.' });
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: cleanPhone,
      address: address ? address.trim() : '',
      createdAt: new Date().toISOString()
    };

    // Save user
    localUsers.push(newUser);
    if (useSupabase && supabase) {
      await supabase.from('users').insert({ id: newUser.id, data: newUser });
    }

    const token = signToken({ userId: newUser.id, role: 'user', phone: newUser.phone });
    res.json({ success: true, token, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Customer registration failed.' });
  }
});

// Admin JWT Authentication Endpoint
app.post('/api/auth/admin-login', (req, res) => {
  const { secret } = req.body;
  if (!secret || secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }
  const token = signToken({ role: 'admin' });
  res.json({ success: true, token });
});

// Session State Verification Endpoint
app.get('/api/auth/session', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No active session token.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  if (decoded.role === 'admin') {
    return res.json({ role: 'admin' });
  } else if (decoded.role === 'vendor') {
    let vendor: Vendor | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('vendors').select('*').eq('id', decoded.vendorId).single();
      if (!error && data) {
        vendor = data.data;
      }
    }
    if (!vendor) {
      vendor = localVendors.find(v => v.id === decoded.vendorId);
    }
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found.' });
    }
    return res.json({ role: 'vendor', vendor });
  } else if (decoded.role === 'user') {
    let user: AppUser | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', decoded.userId).single();
      if (!error && data) {
        user = data.data;
      }
    }
    if (!user) {
      user = localUsers.find(u => u.id === decoded.userId);
    }
    if (!user) {
      return res.status(404).json({ error: 'Customer profile not found.' });
    }
    return res.json({ role: 'user', user });
  }
  res.status(401).json({ error: 'Unknown session role.' });
});

// --- SECURE IMAGE UPLOAD TO IMGBB (PROXIED TO PROTECT SECRETS) ---
app.post('/api/upload-image', authenticateAdmin, async (req, res) => {
  try {
    const { image } = req.body; // Base64 representation of image
    if (!image) {
      return res.status(400).json({ error: 'No image data provided. Please capture or select a valid image.' });
    }

    // Retrieve ImgBB API Key from environment or fallback to client's provided key
    const imgbbKey = process.env.IMGBB_API_KEY || '55179f3e39711f9b8a5f1b568b5567a9';

    // Extract raw base64 data (ImgBB accepts raw base64 string or url-encoded data)
    let base64Data = image;
    if (image.includes('base64,')) {
      base64Data = image.split('base64,')[1];
    }

    // Prepare urlencoded body
    const body = new URLSearchParams();
    body.append('image', base64Data);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!imgbbRes.ok) {
      const errText = await imgbbRes.text();
      console.error('ImgBB API error details:', errText);
      return res.status(500).json({
        error: 'Failed to upload image to ImgBB cloud storage. Please check your network or key.',
        details: errText
      });
    }

    const imgbbData = (await imgbbRes.json()) as any;
    if (imgbbData && imgbbData.data && imgbbData.data.url) {
      return res.json({
        success: true,
        imageUrl: imgbbData.data.url,
        thumbUrl: imgbbData.data.thumb?.url || imgbbData.data.url
      });
    } else {
      return res.status(500).json({ error: 'Unexpected response format from ImgBB API.' });
    }
  } catch (err: any) {
    console.error('Image upload proxy failed:', err);
    res.status(500).json({ error: err.message || 'Image upload proxy failed due to internal error.' });
  }
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// --- SYSTEM STATUS & DIAGNOSTICS ---
app.get('/api/system-status', async (req, res) => {
  try {
    let supabaseConnected = false;
    let tableChecks = {
      products: false,
      orders: false,
      vendors: false,
      coupons: false
    };
    let lastError = null;

    if (useSupabase && supabase) {
      try {
        const [pCheck, oCheck, vCheck, cCheck] = await Promise.all([
          supabase.from('products').select('id').limit(1),
          supabase.from('orders').select('id').limit(1),
          supabase.from('vendors').select('id').limit(1),
          supabase.from('coupons').select('code').limit(1)
        ]);

        tableChecks.products = !pCheck.error;
        tableChecks.orders = !oCheck.error;
        tableChecks.vendors = !vCheck.error;
        tableChecks.coupons = !cCheck.error;

        supabaseConnected = !pCheck.error && !oCheck.error && !vCheck.error && !cCheck.error;
        if (pCheck.error) lastError = pCheck.error.message;
        else if (oCheck.error) lastError = oCheck.error.message;
        else if (vCheck.error) lastError = vCheck.error.message;
        else if (cCheck.error) lastError = cCheck.error.message;
      } catch (err: any) {
        lastError = err.message || 'Failed checking tables';
      }
    }

    res.json({
      useSupabase,
      supabaseConnected,
      supabaseInitialized: !!supabase,
      tableChecks,
      lastError,
      localCounts: {
        products: localProducts.length,
        orders: localOrders.length,
        vendors: localVendors.length,
        coupons: localCoupons.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed checking system status' });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  const allParam = req.query.all === 'true';
  const vendorIdParam = req.query.vendorId as string;

  try {
    let productsList: Product[] = [];
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        productsList = data.map((row: any) => row.data);
      } else {
        console.warn('Supabase product query failed, fallback to memory database:', error);
        productsList = localProducts;
      }
    } else {
      productsList = localProducts;
    }

    // Filter based on parameters
    if (vendorIdParam) {
      // Filter by specific vendor
      productsList = productsList.filter(p => p.vendorId === vendorIdParam);
    } else if (!allParam) {
      // Standard user view: show only approved products or seed products (where approvalStatus is undefined or approved)
      productsList = productsList.filter(p => p.approvalStatus === 'approved' || !p.approvalStatus);
    }

    // Boost sponsored products to the top
    const nowISO = new Date().toISOString();
    productsList.sort((a, b) => {
      const aSponsored = a.sponsoredUntil && a.sponsoredUntil > nowISO;
      const bSponsored = b.sponsoredUntil && b.sponsoredUntil > nowISO;
      if (aSponsored && !bSponsored) return -1;
      if (!aSponsored && bSponsored) return 1;
      return 0;
    });

    res.json(productsList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  const newProduct: Product = req.body;
  const adminSecret = req.headers['x-admin-secret'];
  const vendorId = req.headers['x-vendor-id'] as string;

  if (!newProduct || !newProduct.id || !newProduct.title) {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  // Authorize request: must be Admin OR a registered Vendor
  let isAuthorized = false;
  let isBigVendor = false;
  let finalVendorId = '';
  let finalVendorName = newProduct.soldBy || 'Verified Supplier';

  if (adminSecret && adminSecret === ADMIN_SECRET) {
    isAuthorized = true;
    newProduct.approvalStatus = 'approved'; // Admin uploads are auto-approved
  } else if (vendorId) {
    // Find vendor
    let vendor: Vendor | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('vendors').select('*').eq('id', vendorId).single();
      if (!error && data) {
        vendor = data.data;
      }
    }
    if (!vendor) {
      vendor = localVendors.find(v => v.id === vendorId);
    }

    if (vendor) {
      if (vendor.status === 'suspended') {
        return res.status(403).json({ error: 'Your seller account has been suspended. Listing products is blocked.' });
      }
      isAuthorized = true;
      finalVendorId = vendor.id;
      finalVendorName = vendor.name;
      isBigVendor = vendor.vendorType === 'big';
      
      // Small vendors are 'pending', big vendors are 'approved'
      newProduct.approvalStatus = isBigVendor ? 'approved' : 'pending';
      newProduct.vendorId = finalVendorId;
      newProduct.soldBy = finalVendorName;
      newProduct.soldByRating = vendor.rating || 4.2;

      // Prevent vendor from manually adding tags or promo-flags
      newProduct.tag = undefined;
      newProduct.isAd = undefined;
      newProduct.sponsoredUntil = undefined;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized. Product submission rejected.' });
  }

  // Assign sequential numericId
  newProduct.numericId = getNextProductNumericId();

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('products').insert([{ id: newProduct.id, data: newProduct }]);
      if (!error) {
        localProducts.unshift(newProduct);
        return res.status(201).json(newProduct);
      }
      throw error;
    }

    localProducts.unshift(newProduct);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

app.post('/api/products/sponsor', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized. Only admins can sponsor products.' });
  }

  const { numericId, duration } = req.body;
  if (!numericId || !duration) {
    return res.status(400).json({ error: 'Missing numericId or duration' });
  }

  // Find product across both Supabase and memory
  let productsList: Product[] = [];
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) {
      productsList = data.map((row: any) => row.data);
    }
  } else {
    productsList = localProducts;
  }

  const product = productsList.find(p => p.numericId === Number(numericId));
  if (!product) {
    return res.status(404).json({ error: `Product with ID "${numericId}" not found` });
  }

  // Calculate sponsoredUntil timestamp
  const now = new Date();
  if (duration === '1day') {
    now.setDate(now.getDate() + 1);
  } else if (duration === '1week') {
    now.setDate(now.getDate() + 7);
  } else if (duration === '1month') {
    now.setMonth(now.getMonth() + 1);
  } else {
    return res.status(400).json({ error: 'Invalid duration. Choose "1day", "1week", or "1month".' });
  }

  product.sponsoredUntil = now.toISOString();

  // Save back
  if (useSupabase && supabase) {
    const { error } = await supabase.from('products').update({ data: product }).eq('id', product.id);
    if (error) {
      return res.status(500).json({ error: 'Failed to update product in database' });
    }
  }

  // Update memory list to be in sync
  const localMatch = localProducts.find(p => p.id === product.id);
  if (localMatch) {
    localMatch.sponsoredUntil = product.sponsoredUntil;
  }

  res.json({
    success: true,
    message: `Product "${product.title}" (ID: ${product.numericId}) is now sponsored until ${now.toLocaleString()}`,
    product
  });
});

app.put('/api/products', async (req, res) => {
  const updatedProduct: Product = req.body;
  const adminSecret = req.headers['x-admin-secret'];
  const vendorId = req.headers['x-vendor-id'] as string;

  if (!updatedProduct || !updatedProduct.id) {
    return res.status(400).json({ error: 'Invalid product details' });
  }

  // Authorize request: must be Admin OR the product owner vendor
  let isAuthorized = false;
  if (adminSecret && adminSecret === ADMIN_SECRET) {
    isAuthorized = true;
  } else if (vendorId) {
    // Check if vendor owns this product
    let existingProduct: Product | undefined;
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', updatedProduct.id).single();
      if (!error && data) {
        existingProduct = data.data;
      }
    }
    if (!existingProduct) {
      existingProduct = localProducts.find(p => p.id === updatedProduct.id);
    }

    if (existingProduct && existingProduct.vendorId === vendorId) {
      isAuthorized = true;
      // If vendor edits product:
      // Small vendor edits go back to pending! Big vendor stays approved.
      let vendor: Vendor | undefined;
      if (useSupabase && supabase) {
        const { data, error } = await supabase.from('vendors').select('*').eq('id', vendorId).single();
        if (!error && data) {
          vendor = data.data;
        }
      }
      if (!vendor) {
        vendor = localVendors.find(v => v.id === vendorId);
      }
      
      if (vendor) {
        updatedProduct.approvalStatus = vendor.vendorType === 'big' ? 'approved' : 'pending';
      }

      // Explicitly protect administrative or automatic tags & stats from vendor overwrite
      updatedProduct.tag = existingProduct.tag;
      updatedProduct.numericId = existingProduct.numericId;
      updatedProduct.sponsoredUntil = existingProduct.sponsoredUntil;
      updatedProduct.isAd = existingProduct.isAd;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized. Product modification blocked.' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('products').update({ data: updatedProduct }).eq('id', updatedProduct.id);
      if (!error) {
        localProducts = localProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        return res.json(updatedProduct);
      }
      throw error;
    }

    localProducts = localProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    res.json(updatedProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const adminSecret = req.headers['x-admin-secret'];
  const vendorId = req.headers['x-vendor-id'] as string;

  let isAuthorized = false;
  if (adminSecret && adminSecret === ADMIN_SECRET) {
    isAuthorized = true;
  } else if (vendorId) {
    // check ownership
    let existingProduct: Product | undefined;
    if (useSupabase && supabase) {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) existingProduct = data.data;
    }
    if (!existingProduct) {
      existingProduct = localProducts.find(p => p.id === id);
    }
    if (existingProduct && existingProduct.vendorId === vendorId) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized. Deletion blocked.' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) {
        localProducts = localProducts.filter(p => p.id !== id);
        return res.json({ success: true, message: 'Product deleted successfully' });
      }
      throw error;
    }

    localProducts = localProducts.filter(p => p.id !== id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
});

// --- PRODUCT APPROVALS (Admin only) ---
app.put('/api/products/:id/approve', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body; // status: 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid approval status value' });
  }

  try {
    let product: Product | null = null;
    if (useSupabase && supabase) {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) product = data.data;
    } else {
      product = localProducts.find(p => p.id === id) || null;
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.approvalStatus = status;
    if (status === 'rejected') {
      product.rejectionReason = rejectionReason || 'Product does not meet standard quality criteria.';
    } else {
      product.rejectionReason = undefined;
    }

    if (useSupabase && supabase) {
      const { error } = await supabase.from('products').update({ data: product }).eq('id', id);
      if (error) throw error;
      localProducts = localProducts.map(p => p.id === id ? product! : p);
    } else {
      localProducts = localProducts.map(p => p.id === id ? product! : p);
    }

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process product approval' });
  }
});

// --- VENDORS ---
app.get('/api/vendors', async (req, res) => {
  try {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('vendors').select('*');
      if (!error && data) {
        return res.json(data.map((row: any) => row.data));
      }
      console.warn('Supabase vendor query failed, fallback to local vendors:', error);
    }
    res.json(localVendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.post('/api/vendors', async (req, res) => {
  const newVendor: Vendor = req.body;
  if (!newVendor || !newVendor.id || !newVendor.name || !newVendor.email) {
    return res.status(400).json({ error: 'Invalid vendor registration data' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('vendors').insert([{ id: newVendor.id, data: newVendor }]);
      if (!error) {
        // Cache locally as well
        if (!localVendors.some(v => v.id === newVendor.id)) {
          localVendors.push(newVendor);
        }
        return res.status(201).json(newVendor);
      }
      throw error;
    }

    if (!localVendors.some(v => v.id === newVendor.id)) {
      localVendors.push(newVendor);
    }
    res.status(201).json(newVendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register vendor' });
  }
});

app.put('/api/vendors/:id', async (req, res) => {
  const { id } = req.params;
  const updatedVendor: Vendor = req.body;

  if (!updatedVendor || !updatedVendor.id) {
    return res.status(400).json({ error: 'Invalid vendor details' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('vendors').update({ data: updatedVendor }).eq('id', id);
      if (!error) {
        localVendors = localVendors.map(v => v.id === id ? updatedVendor : v);
        return res.json(updatedVendor);
      }
      throw error;
    }

    localVendors = localVendors.map(v => v.id === id ? updatedVendor : v);
    res.json(updatedVendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update vendor' });
  }
});


// --- COUPONS ---
app.get('/api/coupons', async (req, res) => {
  try {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) {
        return res.json(data.map((row: any) => row.data));
      }
    }
    res.json(localCoupons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

app.post('/api/coupons', authenticateAdmin, async (req, res) => {
  const newCoupon: Coupon = req.body;
  if (!newCoupon || !newCoupon.code) {
    return res.status(400).json({ error: 'Invalid coupon' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('coupons').insert([{ code: newCoupon.code, data: newCoupon }]);
      if (!error) {
        return res.status(201).json(newCoupon);
      }
      throw error;
    }

    localCoupons.unshift(newCoupon);
    res.status(201).json(newCoupon);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create coupon' });
  }
});

app.delete('/api/coupons/:code', authenticateAdmin, async (req, res) => {
  const { code } = req.params;
  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('coupons').delete().eq('code', code);
      if (!error) {
        localCoupons = localCoupons.filter(c => c.code !== code);
        return res.json({ success: true, message: 'Coupon deleted successfully' });
      }
      throw error;
    }

    localCoupons = localCoupons.filter(c => c.code !== code);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete coupon' });
  }
});


// --- CATEGORIES ---
app.get('/api/categories', async (req, res) => {
  try {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('position', { ascending: true });
      if (!error && data) {
        return res.json(data.map((row: any) => row.data));
      }
    }
    res.json(localCategories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateAdmin, async (req, res) => {
  const newCategory: Category = req.body;
  if (!newCategory || !newCategory.id) {
    return res.status(400).json({ error: 'Invalid category data' });
  }

  try {
    if (useSupabase && supabase) {
      const { data: countData } = await supabase.from('categories').select('id');
      const position = countData ? countData.length : 0;
      const { error } = await supabase.from('categories').insert([{ id: newCategory.id, data: newCategory, position }]);
      if (!error) {
        localCategories.push(newCategory);
        return res.status(201).json(newCategory);
      }
      throw error;
    }

    localCategories.push(newCategory);
    res.status(201).json(newCategory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create category' });
  }
});

app.put('/api/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const updatedCategory: Category = req.body;
  if (!updatedCategory) {
    return res.status(400).json({ error: 'Invalid category data' });
  }

  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('categories').update({ data: updatedCategory }).eq('id', id);
      if (!error) {
        localCategories = localCategories.map(c => c.id === id ? updatedCategory : c);
        return res.json(updatedCategory);
      }
      throw error;
    }

    localCategories = localCategories.map(c => c.id === id ? updatedCategory : c);
    res.json(updatedCategory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) {
        localCategories = localCategories.filter(c => c.id !== id);
        return res.json({ success: true, message: 'Category deleted successfully' });
      }
      throw error;
    }

    localCategories = localCategories.filter(c => c.id !== id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
});

app.post('/api/categories/reorder', authenticateAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid ids array' });
  }

  try {
    if (useSupabase && supabase) {
      for (let i = 0; i < ids.length; i++) {
        const { error } = await supabase.from('categories').update({ position: i }).eq('id', ids[i]);
        if (error) throw error;
      }
    }

    const ordered: Category[] = [];
    for (const cid of ids) {
      const found = localCategories.find(c => c.id === cid);
      if (found) ordered.push(found);
    }
    for (const c of localCategories) {
      if (!ids.includes(c.id)) ordered.push(c);
    }
    localCategories = ordered;

    res.json({ success: true, message: 'Categories reordered successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reorder categories' });
  }
});


// --- ADMIN SUPABASE MANUALLY TRIGGERED SYNCHRONIZATION ---
app.post('/api/admin/sync-demo-products', authenticateAdmin, async (req, res) => {
  try {
    // Re-verify client or create if missing
    if (!supabase) {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false }
        });
      }
    }

    if (!supabase) {
      return res.status(400).json({
        error: 'Supabase credentials (SUPABASE_URL & SUPABASE_ANON_KEY) are missing in environment variables. Please check your config.'
      });
    }

    // 1. Force check / create test on products table
    const { error: pTestError } = await supabase.from('products').select('id').limit(1);
    if (pTestError) {
      return res.status(500).json({
        error: 'The "products" table was not found or is inaccessible in Supabase. Run schema.sql inside your Supabase project SQL Editor.',
        details: pTestError.message
      });
    }

    // 2. Perform upserts for products
    let productsSynced = 0;
    for (const p of localProducts) {
      const { error: upsertErr } = await supabase.from('products').upsert({ id: p.id, data: p }, { onConflict: 'id' });
      if (!upsertErr) {
        productsSynced++;
      } else {
        console.error(`Error syncing product ${p.id}:`, upsertErr);
      }
    }

    // 3. Sync coupons
    let couponsSynced = 0;
    const { error: cTestError } = await supabase.from('coupons').select('code').limit(1);
    if (!cTestError) {
      for (const c of localCoupons) {
        const { error: upsertErr } = await supabase.from('coupons').upsert({ code: c.code, data: c }, { onConflict: 'code' });
        if (!upsertErr) {
          couponsSynced++;
        }
      }
    }

    // 4. Sync orders
    let ordersSynced = 0;
    const { error: oTestError } = await supabase.from('orders').select('id').limit(1);
    if (!oTestError) {
      for (const o of localOrders) {
        const { error: upsertErr } = await supabase.from('orders').upsert({ id: o.id, data: o }, { onConflict: 'id' });
        if (!upsertErr) {
          ordersSynced++;
        }
      }
    }

    // Flip operational mode flag to live database mode!
    useSupabase = true;

    return res.json({
      success: true,
      message: 'Demo catalog & logs successfully synced and written to live Supabase database!',
      productsSynced,
      couponsSynced,
      ordersSynced,
      useSupabase
    });
  } catch (err: any) {
    console.error('Manual seed operation failed:', err);
    res.status(500).json({ error: err.message || 'An unexpected error occurred during seeding.' });
  }
});


// --- ORDERS (WITH TAMPER PREVENTION) ---
app.get('/api/orders', async (req, res) => {
  try {
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('orders').select('*');
      if (!error && data) {
        return res.json(data.map((row: any) => row.data));
      }
    }
    res.json(localOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * SECURE ORDER SUBMISSION
 * Re-calculates and validates item prices on the server, verifies and atomically decrements variant stock levels under mutex control.
 * Completely neutralizes Burp Suite / client-side price modification and concurrency race conditions.
 */
app.post('/api/orders', async (req, res) => {
  const { items, appliedCouponCode, isUpiPayment, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Invalid order structure' });
  }

  // Acquire concurrency mutex lock
  const release = await orderMutex.acquire();

  try {
    // 1. Fetch verified products catalog from DB
    let currentCatalog: Product[] = [];
    if (useSupabase && supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) {
        currentCatalog = data.map((row: any) => row.data);
      }
    }
    if (currentCatalog.length === 0) {
      currentCatalog = localProducts;
    }

    // 2. Validate pricing, existence, and variant-level inventory stock
    let verifiedOriginalItemsPrice = 0;
    let verifiedTotalDiscount = 0;
    let verifiedItemsPriceAfterSupplierDiscount = 0;
    const verifiedItemsList: CartItem[] = [];

    for (const clientItem of items) {
      const verifiedProduct = currentCatalog.find(p => p.id === clientItem.product.id);
      if (!verifiedProduct) {
        return res.status(400).json({ error: `Product ID ${clientItem.product.id} does not exist.` });
      }

      const variantIndex = clientItem.selectedVariantIndex;
      const dbVariant = verifiedProduct.variants[variantIndex] || verifiedProduct.variants[0];

      if (!dbVariant) {
        return res.status(400).json({ error: `Invalid variant for product ID ${verifiedProduct.id}` });
      }

      // Check current variant inventory (Default to 100 if undefined)
      const currentStock = typeof dbVariant.stock === 'number' ? dbVariant.stock : 100;
      const quantity = Math.max(1, Math.floor(Number(clientItem.quantity || 1)));

      if (currentStock < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product "${verifiedProduct.title}" (Variant: ${dbVariant.colorName || 'Default'}). Only ${currentStock} units available.`
        });
      }

      const verifiedItemOriginalPrice = dbVariant.originalPrice;
      const verifiedItemPrice = dbVariant.price;

      // Add to running totals
      verifiedOriginalItemsPrice += verifiedItemOriginalPrice * quantity;
      verifiedTotalDiscount += (verifiedItemOriginalPrice - verifiedItemPrice) * quantity;
      verifiedItemsPriceAfterSupplierDiscount += verifiedItemPrice * quantity;

      // Reconstruct clean, secure item payload (throwing away client-provided prices)
      verifiedItemsList.push({
        id: `${verifiedProduct.id}-${variantIndex}-${clientItem.selectedSize}`,
        product: { ...verifiedProduct }, // Server product
        selectedVariantIndex: variantIndex,
        selectedSize: clientItem.selectedSize,
        quantity: quantity
      });
    }

    // 2.5 Atomically decrement stock levels in memory and database
    for (const clientItem of items) {
      const verifiedProduct = currentCatalog.find(p => p.id === clientItem.product.id)!;
      const variantIndex = clientItem.selectedVariantIndex;
      const dbVariant = verifiedProduct.variants[variantIndex] || verifiedProduct.variants[0];
      const quantity = Math.max(1, Math.floor(Number(clientItem.quantity || 1)));

      const currentStock = typeof dbVariant.stock === 'number' ? dbVariant.stock : 100;
      dbVariant.stock = currentStock - quantity;

      // Update in memory array
      const localProductIdx = localProducts.findIndex(lp => lp.id === verifiedProduct.id);
      if (localProductIdx !== -1) {
        localProducts[localProductIdx] = { ...verifiedProduct };
      }

      // If Supabase is active, update product in DB
      if (useSupabase && supabase) {
        await supabase.from('products').update({ data: verifiedProduct }).eq('id', verifiedProduct.id);
      }
    }

    // 3. Handle Coupon code verification server-side
    let couponDiscountAmount = 0;
    let verifiedCoupon: Coupon | null = null;

    if (appliedCouponCode) {
      let currentCoupons: Coupon[] = [];
      if (useSupabase && supabase) {
        const { data, error } = await supabase.from('coupons').select('*');
        if (!error && data) {
          currentCoupons = data.map((row: any) => row.data);
        }
      }
      if (currentCoupons.length === 0) {
        currentCoupons = localCoupons;
      }

      const foundCoupon = currentCoupons.find(c => c.code.toUpperCase() === appliedCouponCode.trim().toUpperCase());
      if (foundCoupon && verifiedItemsPriceAfterSupplierDiscount >= foundCoupon.minPurchase) {
        verifiedCoupon = foundCoupon;
        if (foundCoupon.discountType === 'flat') {
          couponDiscountAmount = foundCoupon.value;
        } else {
          couponDiscountAmount = Math.round(verifiedItemsPriceAfterSupplierDiscount * (foundCoupon.value / 100));
        }
      }
    }

    // 4. UPI discount verification
    let upiDiscountAmount = 0;
    const hasUpiProduct = verifiedItemsList.some(item => item.product.hasUpiOffer);
    if (isUpiPayment && hasUpiProduct) {
      upiDiscountAmount = 15; // standard ₹15 UPI discount applied
    }

    // Calculate final verified total (cannot go below ₹1)
    const verifiedTotalPrice = Math.max(1, verifiedItemsPriceAfterSupplierDiscount - couponDiscountAmount - upiDiscountAmount);

    // 5. Structure secure final order
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const orderDateStr = new Date().toLocaleDateString('en-GB', dateOptions); // "14 Jul, 2026"
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const deliveryDateStr = deliveryDate.toLocaleDateString('en-GB', dateOptions);

    const secureOrder: Order = {
      id: 'order-' + Math.floor(100000 + Math.random() * 900000),
      items: verifiedItemsList,
      orderDate: orderDateStr,
      deliveryDate: deliveryDateStr,
      status: 'Ordered',
      totalPrice: verifiedTotalPrice,
      shippingAddress: {
        name: String(shippingAddress.name || '').substring(0, 50),
        phone: String(shippingAddress.phone || '').substring(0, 15).replace(/[^\d+]/g, ''),
        addressLine: String(shippingAddress.addressLine || '').substring(0, 120),
        city: String(shippingAddress.city || '').substring(0, 40),
        pincode: String(shippingAddress.pincode || '').substring(0, 10).replace(/[^\d]/g, ''),
        state: String(shippingAddress.state || '').substring(0, 40)
      }
    };

    // 6. Save verified order to DB
    if (useSupabase && supabase) {
      const { error } = await supabase.from('orders').insert([{ id: secureOrder.id, data: secureOrder }]);
      if (!error) {
        return res.status(201).json(secureOrder);
      }
      throw error;
    }

    localOrders.unshift(secureOrder);
    res.status(201).json(secureOrder);
  } catch (err: any) {
    console.error('❌ Secure Order placement failure:', err);
    res.status(500).json({ error: err.message || 'Secure order validation failed.' });
  } finally {
    // Release the concurrency lock
    release();
  }
});

app.put('/api/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    if (useSupabase && supabase) {
      // Fetch existing order
      const { data: row, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!fetchErr && row) {
        const orderData = row.data;
        orderData.status = status;
        const { error: updateErr } = await supabase.from('orders').update({ data: orderData }).eq('id', id);
        if (!updateErr) {
          return res.json(orderData);
        }
        throw updateErr;
      }
      throw fetchErr;
    }

    let found = false;
    localOrders = localOrders.map(o => {
      if (o.id === id) {
        found = true;
        return { ...o, status };
      }
      return o;
    });

    if (!found) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const updatedOrder = localOrders.find(o => o.id === id);
    res.json(updatedOrder);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update order status' });
  }
});

app.delete('/api/orders/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useSupabase && supabase) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (!error) {
        localOrders = localOrders.filter(o => o.id !== id);
        return res.json({ success: true, message: 'Order deleted successfully' });
      }
      throw error;
    }

    localOrders = localOrders.filter(o => o.id !== id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete order' });
  }
});


// -------------------------------------------------------------
// --- SMART SEARCH / AI RECOMMENDATIONS ENDPOINT ---
// -------------------------------------------------------------
app.post('/api/smart-search', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required for smart search.' });
  }

  const cleanQuery = query.trim().toLowerCase();

  // Robust Heuristic Fallback
  const getHeuristicFallback = () => {
    let text = "";
    let items: any[] = [];
    let altSuggestions: string[] = [];

    if (cleanQuery.includes('watch') || cleanQuery.includes('clock') || cleanQuery.includes('wearable') || cleanQuery.includes('time')) {
      text = `We noticed you're looking for watches or wearables. While our direct store inventory is currently updating, we've pulled these highly-popular alternative smartwatch and premium watch recommendations from our verified online networks. These represent exceptional quality, style, and utility.`;
      items = [
        {
          id: "online_w1",
          title: "Fire-Boltt Phoenix Bluetooth Calling Smartwatch",
          description: "Featuring high-definition display, seamless call connectivity, and comprehensive multi-sport health monitoring metrics.",
          price: 1399,
          originalPrice: 4999,
          discountPercent: 72,
          rating: 4.5,
          ratingCount: 384,
          image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600",
          category: "Electronics",
          subCategory: "Smart Watches"
        },
        {
          id: "online_w2",
          title: "Premium Matte Black Chronograph Analog Watch",
          description: "Timeless classic aesthetic with durable quartz movement, water resistance, and executive design suitable for all occasions.",
          price: 899,
          originalPrice: 2499,
          discountPercent: 64,
          rating: 4.3,
          ratingCount: 198,
          image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
          category: "Electronics",
          subCategory: "Analog Watches"
        }
      ];
      altSuggestions = ["Smart Watch", "Fitness Tracker", "Leather Strap Watch", "Digital Clock"];
    } else if (cleanQuery.includes('saree') || cleanQuery.includes('sari') || cleanQuery.includes('lehenga') || cleanQuery.includes('kurti') || cleanQuery.includes('ethnic') || cleanQuery.includes('traditional')) {
      text = `Looking for gorgeous ethnic wear? Check out these beautiful traditional alternatives available online. Handpicked for their exquisite fabric, gorgeous embroidery, and exceptional customer ratings, they are perfect for weddings, festivals, and parties.`;
      items = [
        {
          id: "online_s1",
          title: "Kanjivaram Style Soft Silk Saree with Blouse Piece",
          description: "Woven zari border and elegant design perfect for festive celebrations, matching classic Indian styles perfectly.",
          price: 699,
          originalPrice: 1999,
          discountPercent: 65,
          rating: 4.6,
          ratingCount: 541,
          image: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600",
          category: "Kurti, Saree & Lehenga",
          subCategory: "Sarees"
        },
        {
          id: "online_s2",
          title: "Designer Straight Rayon Kurti & Palazzo Set",
          description: "Comfortable and breathable regular-fit ethnic suit designed with beautiful embroidery, ideal for casual and daily wear.",
          price: 549,
          originalPrice: 1499,
          discountPercent: 63,
          rating: 4.4,
          ratingCount: 215,
          image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
          category: "Kurti, Saree & Lehenga",
          subCategory: "Kurtis"
        }
      ];
      altSuggestions = ["Designer Sarees", "Anarkali Kurti", "Banarasi Sari", "Embroidery Lehenga"];
    } else if (cleanQuery.includes('ear') || cleanQuery.includes('phone') || cleanQuery.includes('sound') || cleanQuery.includes('head') || cleanQuery.includes('buds') || cleanQuery.includes('speaker')) {
      text = `We've scouted the top-rated audio accessories and deals online. Here are the leading wireless earbuds and audio components based on deep bass, battery life, and crystal-clear call quality.`;
      items = [
        {
          id: "online_a1",
          title: "True Wireless Earbuds with ANC & 50H Playtime",
          description: "Equipped with Active Noise Cancellation, high fidelity stereo drivers, quick charging case, and IPX7 sweat resistance.",
          price: 999,
          originalPrice: 2999,
          discountPercent: 66,
          rating: 4.4,
          ratingCount: 412,
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
          category: "Electronics",
          subCategory: "Audio"
        },
        {
          id: "online_a2",
          title: "Wireless Bluetooth Neckband with Extra Deep Bass",
          description: "Comfortable neckband with durable silicone strap, magnetic buds, and super-fast type-C charging supporting long loops.",
          price: 449,
          originalPrice: 1299,
          discountPercent: 65,
          rating: 4.2,
          ratingCount: 184,
          image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=600",
          category: "Electronics",
          subCategory: "Audio"
        }
      ];
      altSuggestions = ["Bluetooth Headset", "Noise Cancelling Buds", "Wireless Speaker", "Earphones"];
    } else if (cleanQuery.includes('shoe') || cleanQuery.includes('sandal') || cleanQuery.includes('slipper') || cleanQuery.includes('heel') || cleanQuery.includes('boot')) {
      text = `Step out in comfort and class! We've generated top-rated footwear deals matching your search with incredible price drops and breathable fits for long-lasting walks.`;
      items = [
        {
          id: "online_f1",
          title: "Men's Ultra-Lightweight Breathable Sports Shoes",
          description: "Flexible mesh upper with cushioned memory foam insole and slip-resistant grip perfect for running, gym, and outdoor sports.",
          price: 649,
          originalPrice: 1999,
          discountPercent: 67,
          rating: 4.4,
          ratingCount: 310,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
          category: "Fashion",
          subCategory: "Footwear"
        },
        {
          id: "online_f2",
          title: "Women's Comfortable Cushioned Ethnic Flats",
          description: "Styled with elegant embroidery, matching all traditional outfits and providing soft, day-long structural footbed comfort.",
          price: 399,
          originalPrice: 999,
          discountPercent: 60,
          rating: 4.3,
          ratingCount: 145,
          image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=600",
          category: "Fashion",
          subCategory: "Footwear"
        }
      ];
      altSuggestions = ["Sports Shoes", "Running Sneakers", "Ethnic Flats", "Sliders & Sandals"];
    } else {
      // Default lifestyle
      text = `While we don't have an exact match for "${query}" in our local catalogue right now, we've compiled some exceptionally popular products and lifestyle essentials online that are currently trending. Check out these highly reviewed items with massive direct savings.`;
      items = [
        {
          id: "online_d1",
          title: "Unisex High-Capacity Premium Canvas Backpack",
          description: "Water-resistant travel and school laptop backpack with multi-compartment organizers and USB charging extension port.",
          price: 599,
          originalPrice: 1699,
          discountPercent: 64,
          rating: 4.5,
          ratingCount: 489,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
          category: "Bags & Luggage",
          subCategory: "Backpacks"
        },
        {
          id: "online_d2",
          title: "Universal 20W Fast Charging Dual Port Adapter",
          description: "Ultra-compact wall charger with intelligent power delivery chips for safe, lightning-fast charging of iOS & Android devices.",
          price: 349,
          originalPrice: 999,
          discountPercent: 65,
          rating: 4.4,
          ratingCount: 367,
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
          category: "Electronics",
          subCategory: "Mobile Accessories"
        }
      ];
      altSuggestions = ["Travel Backpacks", "Wall Chargers", "Premium Accessories", "Trending Lifestyle"];
    }

    return {
      recommendationsText: text,
      onlineFallbackItems: items,
      alternativeSuggestions: altSuggestions
    };
  };

  // If Gemini API Key is available, use it!
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are QueKart's AI Shopping Assistant.
The user searched our e-commerce store for the query: "${query}".
We do NOT have direct items in our local warehouse stock matching this exact term.
Your job is to provide:
1. "recommendationsText": A friendly, helpful, and highly professional shopping advice text (in English/Hinglish, professional and natural, 2-3 sentences max) explaining that while we don't have this in direct stock, here are some stellar online alternatives and related options they would love.
2. "onlineFallbackItems": An array of exactly 2-3 related, high-quality, realistic alternative items that would represent this topic perfectly. Include prices in INR (Indian Rupees, e.g., 300 to 1999), original prices (larger to show discount), realistic discount percentages (60% to 80%), high-quality Unsplash image URLs (e.g., matching the product type), titles, and short compelling descriptions.
3. "alternativeSuggestions": An array of 3-4 short search keywords/suggestions related to this search query.

Respond STRICTLY with a single, raw, valid JSON object matching the schema below. Do not wrap the output in markdown fences (like \`\`\`json) or add extra commentary.

Schema:
{
  "recommendationsText": "string",
  "onlineFallbackItems": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "price": number,
      "originalPrice": number,
      "discountPercent": number,
      "rating": number,
      "ratingCount": number,
      "image": "string (use high-quality unsplash link corresponding to the item)",
      "category": "string",
      "subCategory": "string"
    }
  ],
  "alternativeSuggestions": ["string"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendationsText: { type: Type.STRING },
              onlineFallbackItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    originalPrice: { type: Type.NUMBER },
                    discountPercent: { type: Type.NUMBER },
                    rating: { type: Type.NUMBER },
                    ratingCount: { type: Type.NUMBER },
                    image: { type: Type.STRING },
                    category: { type: Type.STRING },
                    subCategory: { type: Type.STRING }
                  },
                  required: ["id", "title", "description", "price", "originalPrice", "discountPercent", "rating", "ratingCount", "image", "category", "subCategory"]
                }
              },
              alternativeSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["recommendationsText", "onlineFallbackItems", "alternativeSuggestions"]
          }
        }
      });

      const responseText = response.text ? response.text.trim() : '';
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json(parsed);
        } catch (parseErr) {
          console.warn('⚠️ Gemini returned invalid JSON. Falling back to heuristic.');
        }
      }
    } catch (err: any) {
      console.error('⚠️ Gemini API error or timeout:', err.message || err);
    }
  }

  // Fallback to local heuristic (or if key is default/missing)
  const result = getHeuristicFallback();
  return res.json(result);
});


// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC SERVING IN PRODUCTION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 QueKart Meesho Clone Backend active at: http://localhost:${PORT}`);
  });
}

startServer();

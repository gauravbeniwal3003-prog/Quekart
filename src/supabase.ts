import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, Coupon, Banner, Category, Vendor, CategoryFilter, SubCategory } from './types';
import { initialBanners, mockSubCategories } from './data';

// -------------------------------------------------------------
// SECURE HYBRID CONFIGURATION
// -------------------------------------------------------------
// Read credentials safely from Vite import.meta.env or injected process.env
const getEnvVar = (key: string, viteKey: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env[viteKey]) return import.meta.env[viteKey];
      // @ts-ignore
      if (import.meta.env[key]) return import.meta.env[key];
    }
  } catch (_) {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[key]) return process.env[key] as string;
      if (process.env[viteKey]) return process.env[viteKey] as string;
    }
  } catch (_) {}

  return '';
};

export const SUPABASE_URL = getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
export const BACKEND_URL = getEnvVar('BACKEND_URL', 'VITE_BACKEND_URL') || getEnvVar('API_URL', 'VITE_API_URL');
export const IMGBB_API_KEY = getEnvVar('IMGBB_API_KEY', 'VITE_IMGBB_API_KEY') || '';

// Initialize Supabase Client
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true }
      });
    } catch (err) {
      console.error('Database connection note:', err);
    }
  }
  return clientInstance;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Helper to construct API URLs (supports Render backend / custom backend URL)
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (BACKEND_URL) {
    const cleanBackend = BACKEND_URL.replace(/\/+$/, '');
    return `${cleanBackend}${cleanEndpoint}`;
  }
  return cleanEndpoint;
}

// -------------------------------------------------------------
// UNIFIED DATA FETCHERS (API -> Supabase Direct -> Local Cache)
// -------------------------------------------------------------

/**
 * Robust JSON fetcher that verifies response type to avoid HTML rewrite crashes
 */
async function fetchSafeJson(url: string, options?: RequestInit): Promise<any | null> {
  try {
    const headers = new Headers(options?.headers);
    if (!headers.has('Authorization')) {
      let userToken = null;
      let vendorToken = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          userToken = localStorage.getItem('quekart_user_token');
          vendorToken = localStorage.getItem('quekart_vendor_token');
        }
      } catch (_) {}
      const activeToken = userToken || vendorToken;
      if (activeToken) {
        headers.set('Authorization', `Bearer ${activeToken}`);
      }
    }

    const res = await fetch(url, {
      ...options,
      headers
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML or text (e.g., Vercel SPA rewrite fallback)
      return null;
    }
    return await res.json();
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// HIGH-SPEED IN-MEMORY CACHE
// -------------------------------------------------------------
let memoryProductsCache: Product[] | null = null;
let memoryBannersCache: Banner[] | null = null;
let memoryCategoriesCache: Category[] | null = null;

// Synchronously initialize memory cache from localStorage if present
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const rawProd = localStorage.getItem('quekart_cached_products');
    if (rawProd) memoryProductsCache = JSON.parse(rawProd);
    const rawBan = localStorage.getItem('quekart_cached_banners');
    if (rawBan) memoryBannersCache = JSON.parse(rawBan);
    const rawCat = localStorage.getItem('quekart_cached_categories');
    if (rawCat) memoryCategoriesCache = JSON.parse(rawCat);
  }
} catch (_) {}

/**
 * Preload high-priority banner and top product image assets into browser cache
 */
export function warmupCriticalShopImages(products?: Product[], banners?: Banner[]): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Warm up Banners (Top Priority)
    const bannerList = (banners && banners.length > 0) ? banners : (memoryBannersCache || initialBanners);
    bannerList.slice(0, 6).forEach((b) => {
      if (b && b.imageUrl) {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.decoding = 'async';
        img.src = b.imageUrl;
      }
    });

    // 2. Warm up Top Product Cards (First 12 items)
    const productList = (products && products.length > 0) ? products : (memoryProductsCache || []);
    productList.slice(0, 12).forEach((p) => {
      const firstImg = p.images && p.images[0];
      if (firstImg) {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.decoding = 'async';
        img.src = firstImg;
      }
    });
  } catch (_) {}
}

// Initial image asset warmup on file import
warmupCriticalShopImages();

function getAdminSecret(providedSecret?: string): string {
  if (providedSecret) return providedSecret;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('lucky_admin_secret') || '';
    }
  } catch (_) {}
  return '';
}

/**
 * Fetch all products with 3-tier fallback (Backend API -> Supabase -> Cache/Default)
 */
export async function fetchProductsUnified(): Promise<Product[]> {
  // 1. Try Backend API (Authoritative Server Database) with cache-busting query
  const apiProducts = await fetchSafeJson(getApiUrl(`/api/products?all=true&_t=${Date.now()}`));
  if (apiProducts && Array.isArray(apiProducts)) {
    memoryProductsCache = apiProducts;
    try {
      localStorage.setItem('quekart_cached_products', JSON.stringify(apiProducts));
    } catch (_) {}
    warmupCriticalShopImages(apiProducts);
    return apiProducts;
  }

  // 2. Return memory cache if available
  if (memoryProductsCache && memoryProductsCache.length > 0) {
    return memoryProductsCache;
  }

  // 3. Try Direct Supabase Connection
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*');
      if (!error && data) {
        const mappedProducts: Product[] = data.map((row: any) => row.data || row);
        memoryProductsCache = mappedProducts;
        try {
          localStorage.setItem('quekart_cached_products', JSON.stringify(mappedProducts));
        } catch (_) {}
        warmupCriticalShopImages(mappedProducts);
        return mappedProducts;
      }
    } catch (sbErr) {
      console.warn('⚠️ Supabase direct fetch error:', sbErr);
    }
  }

  // 4. Try LocalStorage Cache
  try {
    const cached = localStorage.getItem('quekart_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductsCache = parsed;
        return parsed;
      }
    }
  } catch (_) {}

  // 5. Return empty array if all database/cache sources fail
  return [];
}

/**
 * Fetch Categories
 */
export async function fetchCategoriesUnified(): Promise<Category[]> {
  const apiCats = await fetchSafeJson(getApiUrl(`/api/categories?_t=${Date.now()}`));
  if (apiCats && Array.isArray(apiCats) && apiCats.length > 0) {
    memoryCategoriesCache = apiCats;
    try {
      localStorage.setItem('quekart_cached_categories', JSON.stringify(apiCats));
      localStorage.setItem('quekart_categories', JSON.stringify(apiCats));
    } catch (_) {}
    return apiCats;
  }

  if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    return memoryCategoriesCache;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('categories').select('*').order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((r: any) => r.data || r);
        memoryCategoriesCache = mapped;
        try {
          localStorage.setItem('quekart_cached_categories', JSON.stringify(mapped));
          localStorage.setItem('quekart_categories', JSON.stringify(mapped));
        } catch (_) {}
        return mapped;
      }
    } catch (_) {}
  }

  try {
    const cached = localStorage.getItem('quekart_cached_categories') || localStorage.getItem('quekart_categories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategoriesCache = parsed;
        return parsed;
      }
    }
  } catch (_) {}

  return [];
}

let memorySubCategoriesCache: SubCategory[] | null = null;

/**
 * Fetch Sub-Categories
 */
export async function fetchSubCategoriesUnified(): Promise<SubCategory[]> {
  const apiSubs = await fetchSafeJson(getApiUrl('/api/sub-categories'));
  if (apiSubs && Array.isArray(apiSubs) && apiSubs.length > 0) {
    memorySubCategoriesCache = apiSubs;
    try { localStorage.setItem('quekart_cached_subcategories', JSON.stringify(apiSubs)); } catch (_) {}
    return apiSubs;
  }

  if (memorySubCategoriesCache) {
    return memorySubCategoriesCache;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('sub_categories').select('*');
      if (!error && data && data.length > 0) {
        const mapped = data.map((r: any) => r.data || r);
        memorySubCategoriesCache = mapped;
        try { localStorage.setItem('quekart_cached_subcategories', JSON.stringify(mapped)); } catch (_) {}
        return mapped;
      }
    } catch (_) {}
  }

  try {
    const cached = localStorage.getItem('quekart_cached_subcategories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        memorySubCategoriesCache = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  memorySubCategoriesCache = mockSubCategories;
  return mockSubCategories;
}

/**
 * Save Sub-Category
 */
export async function saveSubCategoryUnified(subCat: SubCategory): Promise<SubCategory> {
  try {
    const adminSecret = getAdminSecret();
    await fetch(getApiUrl('/api/sub-categories'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': adminSecret
      },
      body: JSON.stringify(subCat)
    });
  } catch (e) {
    console.warn('⚠️ API save sub-category failed:', e);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('sub_categories').upsert({
        id: subCat.id,
        category_id: subCat.categoryId || (subCat as any).category_id || '',
        name: subCat.name || '',
        data: subCat
      });
    } catch (_) {}
  }

  const current = await fetchSubCategoriesUnified();
  const existingIdx = current.findIndex(s => s.id === subCat.id);
  let updated: SubCategory[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = subCat;
  } else {
    updated = [...current, subCat];
  }
  memorySubCategoriesCache = updated;
  try {
    localStorage.setItem('quekart_cached_subcategories', JSON.stringify(updated));
  } catch (_) {}
  return subCat;
}

/**
 * Delete Sub-Category
 */
export async function deleteSubCategoryUnified(subCatId: string): Promise<boolean> {
  try {
    const adminSecret = getAdminSecret();
    await fetch(getApiUrl(`/api/sub-categories/${subCatId}`), {
      method: 'DELETE',
      headers: {
        'X-Admin-Secret': adminSecret
      }
    });
  } catch (e) {
    console.warn('⚠️ API delete sub-category failed:', e);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('sub_categories').delete().eq('id', subCatId);
    } catch (_) {}
  }

  const current = await fetchSubCategoriesUnified();
  const updated = current.filter(s => s.id !== subCatId);
  memorySubCategoriesCache = updated;
  try {
    localStorage.setItem('quekart_cached_subcategories', JSON.stringify(updated));
  } catch (_) {}
  return true;
}

/**
 * Fetch Category Filters
 */
export async function fetchCategoryFiltersUnified(): Promise<CategoryFilter[]> {
  const apiFilters = await fetchSafeJson(getApiUrl('/api/category-filters'));
  if (apiFilters && Array.isArray(apiFilters)) {
    return apiFilters;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('category_filters').select('*').order('position', { ascending: true });
      if (!error && data) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

  return [];
}

/**
 * Fetch Banners (Real dynamic banners only - returns empty array if none uploaded)
 */
export async function fetchBannersUnified(): Promise<Banner[]> {
  const apiBanners = await fetchSafeJson(getApiUrl('/api/banners'));
  if (apiBanners && Array.isArray(apiBanners) && apiBanners.length > 0) {
    memoryBannersCache = apiBanners;
    try { localStorage.setItem('quekart_cached_banners', JSON.stringify(apiBanners)); } catch (_) {}
    warmupCriticalShopImages(undefined, apiBanners);
    return apiBanners;
  }

  if (memoryBannersCache && memoryBannersCache.length > 0) {
    return memoryBannersCache;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('banners').select('*');
      if (!error && data && data.length > 0) {
        const mapped = data.map((r: any) => r.data || r);
        memoryBannersCache = mapped;
        try { localStorage.setItem('quekart_cached_banners', JSON.stringify(mapped)); } catch (_) {}
        warmupCriticalShopImages(undefined, mapped);
        return mapped;
      }
    } catch (_) {}
  }

  try {
    const cached = localStorage.getItem('quekart_cached_banners');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryBannersCache = parsed;
        return parsed;
      }
    }
  } catch (_) {}

  return [];
}

/**
 * Fetch Coupons
 */
export async function fetchCouponsUnified(): Promise<Coupon[]> {
  const apiCoupons = await fetchSafeJson(getApiUrl('/api/coupons'));
  if (apiCoupons && Array.isArray(apiCoupons) && apiCoupons.length > 0) {
    return apiCoupons;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('coupons').select('*');
      if (!error && data && data.length > 0) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

  return [];
}

/**
 * Fetch Orders
 */
export async function fetchOrdersUnified(): Promise<Order[]> {
  const apiOrders = await fetchSafeJson(getApiUrl('/api/orders'));
  if (apiOrders && Array.isArray(apiOrders)) {
    return apiOrders;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

  return [];
}

/**
 * Fetch Vendors
 */
export async function fetchVendorsUnified(): Promise<Vendor[]> {
  const apiVendors = await fetchSafeJson(getApiUrl('/api/vendors'));
  if (apiVendors && Array.isArray(apiVendors)) {
    return apiVendors;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('vendors').select('*');
      if (!error && data) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

  return [];
}

/**
 * Save / Upsert Product to Database
 */
export async function saveProductUnified(product: Product, adminSecret?: string, vendorId?: string): Promise<Product> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}
  
  let savedProduct: Product = product;

  // 1. Try API
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Secret': secret,
      ...(vendorId ? { 'X-Vendor-Id': vendorId } : {})
    };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl('/api/products'), {
      method: 'POST',
      headers,
      body: JSON.stringify(product)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) {
      savedProduct = json;
    }
  } catch (_) {}

  // 2. Direct Supabase Upsert
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('products').upsert({ id: savedProduct.id, data: savedProduct });
      console.log('✅ Product saved directly to Supabase:', savedProduct.id);
    } catch (err) {
      console.error('❌ Supabase direct product save error:', err);
    }
  }

  // 3. Update memory and localStorage cache
  if (memoryProductsCache) {
    const idx = memoryProductsCache.findIndex(p => p.id === savedProduct.id);
    if (idx >= 0) {
      memoryProductsCache[idx] = savedProduct;
    } else {
      memoryProductsCache.unshift(savedProduct);
    }
  }
  try {
    const cached = localStorage.getItem('quekart_cached_products');
    let list: any[] = cached ? JSON.parse(cached) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((p: any) => p.id === savedProduct.id);
    if (idx >= 0) {
      list[idx] = savedProduct;
    } else {
      list.unshift(savedProduct);
    }
    localStorage.setItem('quekart_cached_products', JSON.stringify(list));
  } catch (_) {}

  return savedProduct;
}

/**
 * Delete Product from Database
 */
export async function deleteProductUnified(productId: string, adminSecret?: string, vendorId?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  // 1. Immediately invalidate local memory and storage caches
  if (memoryProductsCache) {
    memoryProductsCache = memoryProductsCache.filter(p => p.id !== productId);
  }
  try {
    const cached = localStorage.getItem('quekart_cached_products');
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        localStorage.setItem('quekart_cached_products', JSON.stringify(list.filter((p: any) => p.id !== productId)));
      }
    }
  } catch (_) {}
  
  // 2. Try API with full auth headers
  try {
    const headers: Record<string, string> = {
      'X-Admin-Secret': secret,
      ...(vendorId ? { 'X-Vendor-Id': vendorId } : {})
    };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(`/api/products/${productId}`), {
      method: 'DELETE',
      headers
    });
    if (res.ok) return true;
  } catch (_) {}

  // 3. Direct Supabase Delete
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('products').delete().eq('id', productId);
      return !error;
    } catch (_) {}
  }

  return true;
}

/**
 * Save Order to Database
 */
export async function saveOrderUnified(orderData: any): Promise<Order | null> {
  // 1. Try API
  try {
    const res = await fetch(getApiUrl('/api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) {
      return json;
    }
  } catch (_) {}

  // 2. Direct Supabase Insert
  const sb = getSupabase();
  if (sb) {
    try {
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date();
      const deliveryEst = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
      const fullOrder: Order = {
        id: orderId,
        orderDate: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        deliveryDate: deliveryEst.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Ordered',
        items: orderData.items,
        totalPrice: orderData.items.reduce((sum: number, it: any) => sum + (it.product?.price || it.price || 0) * it.quantity, 0),
        shippingAddress: orderData.shippingAddress,
        userId: orderData.userId,
        userPhone: orderData.userPhone
      };
      await sb.from('orders').insert({ id: orderId, data: fullOrder });
      return fullOrder;
    } catch (_) {}
  }

  return null;
}

/**
 * Save Banner to Database (Admin only)
 */
export async function saveBannerUnified(banner: Banner, adminSecret?: string): Promise<Banner> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  let savedBanner = banner;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Admin-Secret': secret
    };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl('/api/banners'), {
      method: 'POST',
      headers,
      body: JSON.stringify(banner)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) savedBanner = json;
  } catch (_) {}

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('banners').upsert({ id: savedBanner.id, data: savedBanner });
    } catch (_) {}
  }

  if (memoryBannersCache) {
    const idx = memoryBannersCache.findIndex(b => b.id === savedBanner.id);
    if (idx >= 0) {
      memoryBannersCache[idx] = savedBanner;
    } else {
      memoryBannersCache.push(savedBanner);
    }
  }
  try {
    const cached = localStorage.getItem('quekart_cached_banners');
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        const idx = list.findIndex((b: any) => b.id === savedBanner.id);
        if (idx >= 0) list[idx] = savedBanner;
        else list.push(savedBanner);
        localStorage.setItem('quekart_cached_banners', JSON.stringify(list));
      }
    }
  } catch (_) {}

  return savedBanner;
}

/**
 * Delete Banner from Database (Admin only)
 */
export async function deleteBannerUnified(bannerId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  if (memoryBannersCache) {
    memoryBannersCache = memoryBannersCache.filter(b => b.id !== bannerId);
  }
  try {
    const cached = localStorage.getItem('quekart_cached_banners');
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        localStorage.setItem('quekart_cached_banners', JSON.stringify(list.filter((b: any) => b.id !== bannerId)));
      }
    }
  } catch (_) {}

  try {
    const headers: Record<string, string> = {
      'X-Admin-Secret': secret
    };
    if (userToken) {
      headers['Authorization'] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(`/api/banners/${bannerId}`), {
      method: 'DELETE',
      headers
    });
    if (res.ok) return true;
  } catch (_) {}

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('banners').delete().eq('id', bannerId);
      return !error;
    } catch (_) {}
  }

  return true;
}

/**
 * Save / Upsert Category to Database (Admin only)
 */
export async function saveCategoryUnified(category: Category, isEdit: boolean = false, adminSecret?: string): Promise<Category> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  const endpoint = isEdit ? `/api/categories/${category.id}` : "/api/categories";
  const method = isEdit ? "PUT" : "POST";
  let savedCategory = category;

  // 1. Try Backend API
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(endpoint), {
      method,
      headers,
      body: JSON.stringify(category)
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      if (json) {
        savedCategory = json;
      }
    }
  } catch (apiErr) {
    console.warn("⚠️ API category save fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Upsert
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: countData } = await sb.from("categories").select("id");
      const position = countData ? countData.length : 0;
      const { error } = await sb.from("categories").upsert({
        id: savedCategory.id,
        data: savedCategory,
        ...(isEdit ? {} : { position })
      });
      if (!error) {
        console.log("✅ Category saved directly to Supabase:", savedCategory.id);
      } else {
        console.warn("⚠️ Supabase category save error:", error);
      }
    } catch (sbErr) {
      console.error("❌ Supabase direct category save failed:", sbErr);
    }
  }

  // 3. Update memory and storage caches
  if (memoryCategoriesCache) {
    const idx = memoryCategoriesCache.findIndex(c => c.id === savedCategory.id);
    if (idx >= 0) {
      memoryCategoriesCache[idx] = savedCategory;
    } else {
      memoryCategoriesCache.push(savedCategory);
    }
  }
  try {
    const cached = localStorage.getItem('quekart_cached_categories');
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        const idx = list.findIndex((c: any) => c.id === savedCategory.id);
        if (idx >= 0) list[idx] = savedCategory;
        else list.push(savedCategory);
        localStorage.setItem('quekart_cached_categories', JSON.stringify(list));
      }
    }
  } catch (_) {}

  return savedCategory;
}

/**
 * Delete Category from Database (Admin only)
 */
export async function deleteCategoryUnified(categoryId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  // 1. Invalidate caches
  if (memoryCategoriesCache) {
    memoryCategoriesCache = memoryCategoriesCache.filter(c => c.id !== categoryId);
  }
  try {
    const cached = localStorage.getItem('quekart_cached_categories');
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        localStorage.setItem('quekart_cached_categories', JSON.stringify(list.filter((c: any) => c.id !== categoryId)));
      }
    }
  } catch (_) {}

  // 2. Try Backend API
  try {
    const headers: Record<string, string> = {
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(`/api/categories/${categoryId}`), {
      method: "DELETE",
      headers
    });
    if (res.ok) return true;
  } catch (apiErr) {
    console.warn("⚠️ API category delete fallback to Supabase:", apiErr);
  }

  // 3. Direct Supabase Delete
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("categories").delete().eq("id", categoryId);
      if (!error) return true;
    } catch (sbErr) {
      console.error("❌ Supabase direct category delete failed:", sbErr);
    }
  }

  return true;
}

/**
 * Reorder Categories in Database (Admin only)
 */
export async function reorderCategoriesUnified(ids: string[], adminSecret?: string, fullCategoriesList?: Category[]): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  // 1. Immediately update local in-memory & localStorage caches
  if (fullCategoriesList && fullCategoriesList.length > 0) {
    memoryCategoriesCache = fullCategoriesList;
    try { localStorage.setItem('quekart_cached_categories', JSON.stringify(fullCategoriesList)); } catch (_) {}
  } else if (memoryCategoriesCache && memoryCategoriesCache.length > 0) {
    const ordered: Category[] = [];
    for (const id of ids) {
      const found = memoryCategoriesCache.find(c => c.id === id);
      if (found) ordered.push(found);
    }
    for (const c of memoryCategoriesCache) {
      if (!ids.includes(c.id)) ordered.push(c);
    }
    memoryCategoriesCache = ordered;
    try { localStorage.setItem('quekart_cached_categories', JSON.stringify(ordered)); } catch (_) {}
  }

  // 2. Try Backend API
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl("/api/categories/reorder"), {
      method: "POST",
      headers,
      body: JSON.stringify({ ids, categories: fullCategoriesList })
    });
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.categories)) {
        memoryCategoriesCache = json.categories;
        try {
          localStorage.setItem('quekart_cached_categories', JSON.stringify(json.categories));
          localStorage.setItem('quekart_categories', JSON.stringify(json.categories));
        } catch (_) {}
      }
      return true;
    }
  } catch (apiErr) {
    console.warn("⚠️ API category reorder fallback to Supabase:", apiErr);
  }

  // 3. Direct Supabase Reorder
  const sb = getSupabase();
  if (sb) {
    try {
      for (let i = 0; i < ids.length; i++) {
        await sb.from("categories").update({ position: i }).eq("id", ids[i]);
      }
      return true;
    } catch (sbErr) {
      console.error("❌ Supabase direct category reorder failed:", sbErr);
    }
  }

  return true;
}

/**
 * Save / Upsert Category Filter to Database (Admin only)
 */
export async function saveCategoryFilterUnified(filter: CategoryFilter, isEdit: boolean = false, adminSecret?: string): Promise<CategoryFilter> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  const endpoint = isEdit ? `/api/category-filters/${filter.id}` : "/api/category-filters";
  const method = isEdit ? "PUT" : "POST";
  let savedFilter = filter;

  // 1. Try Backend API
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(endpoint), {
      method,
      headers,
      body: JSON.stringify(filter)
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      if (json) {
        savedFilter = json;
      }
    }
  } catch (apiErr) {
    console.warn("⚠️ API category filter save fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Upsert
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: countData } = await sb.from("category_filters").select("id");
      const position = countData ? countData.length : 0;
      const { error } = await sb.from("category_filters").upsert({
        id: savedFilter.id,
        data: savedFilter,
        ...(isEdit ? {} : { position })
      });
      if (!error) {
        console.log("✅ Category Filter saved directly to Supabase:", savedFilter.id);
      } else {
        console.warn("⚠️ Supabase category filter save error:", error);
      }
    } catch (sbErr) {
      console.error("❌ Supabase direct category filter save failed:", sbErr);
    }
  }

  return savedFilter;
}

/**
 * Delete Category Filter from Database (Admin only)
 */
export async function deleteCategoryFilterUnified(filterId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  // 1. Try Backend API
  try {
    const headers: Record<string, string> = {
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl(`/api/category-filters/${filterId}`), {
      method: "DELETE",
      headers
    });
    if (res.ok) return true;
  } catch (apiErr) {
    console.warn("⚠️ API category filter delete fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Delete
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("category_filters").delete().eq("id", filterId);
      if (!error) return true;
    } catch (sbErr) {
      console.error("❌ Supabase direct category filter delete failed:", sbErr);
    }
  }

  return true;
}

/**
 * Reorder Category Filters in Database (Admin only)
 */
export async function reorderCategoryFiltersUnified(ids: string[], adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  let userToken = '';
  try {
    userToken = localStorage.getItem('quekart_token') || '';
  } catch (_) {}

  // 1. Try Backend API
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Admin-Secret": secret
    };
    if (userToken) {
      headers["Authorization"] = `Bearer ${userToken}`;
    }
    const res = await fetch(getApiUrl("/api/category-filters/reorder"), {
      method: "POST",
      headers,
      body: JSON.stringify({ ids })
    });
    if (res.ok) return true;
  } catch (apiErr) {
    console.warn("⚠️ API category filter reorder fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Reorder
  const sb = getSupabase();
  if (sb) {
    try {
      for (let i = 0; i < ids.length; i++) {
        await sb.from("category_filters").update({ position: i }).eq("id", ids[i]);
      }
      return true;
    } catch (sbErr) {
      console.error("❌ Supabase direct category filter reorder failed:", sbErr);
    }
  }

  return true;
}

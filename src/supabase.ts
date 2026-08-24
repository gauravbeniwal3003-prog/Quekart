import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, Coupon, Banner, Category, Vendor } from './types';
import { mockProducts, mockCategories, initialBanners } from './data';

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
export const IMGBB_API_KEY = getEnvVar('IMGBB_API_KEY', 'VITE_IMGBB_API_KEY') || '55179f3e39711f9b8a5f1b568b5567a9';

// Initialize Supabase Client
let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true }
      });
      console.log('⚡ Client-side Supabase client active:', SUPABASE_URL);
    } catch (err) {
      console.error('❌ Failed to initialize client-side Supabase:', err);
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

function getAdminSecret(providedSecret?: string): string {
  if (providedSecret) return providedSecret;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    }
  } catch (_) {}
  return 'lucky-secret-admin-pass-123';
}

/**
 * Fetch all products with 3-tier fallback (Backend API -> Supabase -> Cache/Default)
 */
export async function fetchProductsUnified(): Promise<Product[]> {
  // 1. Try Backend API
  const apiProducts = await fetchSafeJson(getApiUrl('/api/products?all=true'));
  if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
    try {
      localStorage.setItem('quekart_cached_products', JSON.stringify(apiProducts));
    } catch (_) {}
    return apiProducts;
  }

  // 2. Try Direct Supabase Connection
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*');
      if (!error && data && data.length > 0) {
        const mappedProducts: Product[] = data.map((row: any) => row.data || row);
        console.log(`📦 Loaded ${mappedProducts.length} products directly from Supabase.`);
        try {
          localStorage.setItem('quekart_cached_products', JSON.stringify(mappedProducts));
        } catch (_) {}
        return mappedProducts;
      }
    } catch (sbErr) {
      console.warn('⚠️ Supabase direct fetch error:', sbErr);
    }
  }

  // 3. Try LocalStorage Cache
  try {
    const cached = localStorage.getItem('quekart_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // 4. Return default mock products
  return mockProducts;
}

/**
 * Fetch Categories
 */
export async function fetchCategoriesUnified(): Promise<Category[]> {
  const apiCats = await fetchSafeJson(getApiUrl('/api/categories'));
  if (apiCats && Array.isArray(apiCats) && apiCats.length > 0) {
    return apiCats;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('categories').select('*').order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

  return mockCategories;
}

/**
 * Fetch Banners (Real dynamic banners only - returns empty array if none uploaded)
 */
export async function fetchBannersUnified(): Promise<Banner[]> {
  const apiBanners = await fetchSafeJson(getApiUrl('/api/banners'));
  if (apiBanners && Array.isArray(apiBanners)) {
    return apiBanners;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('banners').select('*');
      if (!error && data) {
        return data.map((r: any) => r.data || r);
      }
    } catch (_) {}
  }

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
  
  // 1. Try API
  try {
    const res = await fetch(getApiUrl('/api/products'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': secret,
        ...(vendorId ? { 'X-Vendor-Id': vendorId } : {})
      },
      body: JSON.stringify(product)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) {
      return json;
    }
  } catch (_) {}

  // 2. Direct Supabase Upsert
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('products').upsert({ id: product.id, data: product });
      console.log('✅ Product saved directly to Supabase:', product.id);
    } catch (err) {
      console.error('❌ Supabase direct product save error:', err);
    }
  }

  return product;
}

/**
 * Delete Product from Database
 */
export async function deleteProductUnified(productId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  
  // 1. Try API
  try {
    const res = await fetch(getApiUrl(`/api/products/${productId}`), {
      method: 'DELETE',
      headers: {
        'X-Admin-Secret': secret
      }
    });
    if (res.ok) return true;
  } catch (_) {}

  // 2. Direct Supabase Delete
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
  try {
    const res = await fetch(getApiUrl('/api/banners'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': secret
      },
      body: JSON.stringify(banner)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json) return json;
  } catch (_) {}

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('banners').upsert({ id: banner.id, data: banner });
    } catch (_) {}
  }

  return banner;
}

/**
 * Delete Banner from Database (Admin only)
 */
export async function deleteBannerUnified(bannerId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);
  try {
    const res = await fetch(getApiUrl(`/api/banners/${bannerId}`), {
      method: 'DELETE',
      headers: {
        'X-Admin-Secret': secret
      }
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


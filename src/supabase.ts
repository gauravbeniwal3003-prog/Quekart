import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, Coupon, Banner, Category, Vendor, CategoryFilter } from './types';
import { mockProducts, initialBanners } from './data';

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
    try { localStorage.setItem('quekart_cached_categories', JSON.stringify(apiCats)); } catch (_) {}
    return apiCats;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('categories').select('*').order('position', { ascending: true });
      if (!error && data && data.length > 0) {
        const mapped = data.map((r: any) => r.data || r);
        try { localStorage.setItem('quekart_cached_categories', JSON.stringify(mapped)); } catch (_) {}
        return mapped;
      }
    } catch (_) {}
  }

  try {
    const cached = localStorage.getItem('quekart_cached_categories');
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  return [];
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
    try { localStorage.setItem('quekart_cached_banners', JSON.stringify(apiBanners)); } catch (_) {}
    return apiBanners;
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('banners').select('*');
      if (!error && data && data.length > 0) {
        const mapped = data.map((r: any) => r.data || r);
        try { localStorage.setItem('quekart_cached_banners', JSON.stringify(mapped)); } catch (_) {}
        return mapped;
      }
    } catch (_) {}
  }

  try {
    const cached = localStorage.getItem('quekart_cached_banners');
    if (cached) return JSON.parse(cached);
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



/**
 * Save / Upsert Category to Database (Admin only)
 */
export async function saveCategoryUnified(category: Category, isEdit: boolean = false, adminSecret?: string): Promise<Category> {
  const secret = getAdminSecret(adminSecret);
  const endpoint = isEdit ? `/api/categories/${category.id}` : "/api/categories";
  const method = isEdit ? "PUT" : "POST";

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl(endpoint), {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": secret
      },
      body: JSON.stringify(category)
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      if (json) {
        return json;
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
        id: category.id,
        data: category,
        ...(isEdit ? {} : { position })
      });
      if (!error) {
        console.log("✅ Category saved directly to Supabase:", category.id);
        return category;
      } else {
        console.warn("⚠️ Supabase category save error:", error);
      }
    } catch (sbErr) {
      console.error("❌ Supabase direct category save failed:", sbErr);
    }
  }

  // 3. Fallback return category for optimistic UI and local persistence
  return category;
}

/**
 * Delete Category from Database (Admin only)
 */
export async function deleteCategoryUnified(categoryId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl(`/api/categories/${categoryId}`), {
      method: "DELETE",
      headers: {
        "X-Admin-Secret": secret
      }
    });
    if (res.ok) return true;
  } catch (apiErr) {
    console.warn("⚠️ API category delete fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Delete
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
export async function reorderCategoriesUnified(ids: string[], adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl("/api/categories/reorder"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": secret
      },
      body: JSON.stringify({ ids })
    });
    if (res.ok) return true;
  } catch (apiErr) {
    console.warn("⚠️ API category reorder fallback to Supabase:", apiErr);
  }

  // 2. Direct Supabase Reorder
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
  const endpoint = isEdit ? `/api/category-filters/${filter.id}` : "/api/category-filters";
  const method = isEdit ? "PUT" : "POST";

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl(endpoint), {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": secret
      },
      body: JSON.stringify(filter)
    });
    const contentType = res.headers.get("content-type") || "";
    if (res.ok && contentType.includes("application/json")) {
      const json = await res.json().catch(() => null);
      if (json) {
        return json;
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
        id: filter.id,
        data: filter,
        ...(isEdit ? {} : { position })
      });
      if (!error) {
        console.log("✅ Category Filter saved directly to Supabase:", filter.id);
        return filter;
      } else {
        console.warn("⚠️ Supabase category filter save error:", error);
      }
    } catch (sbErr) {
      console.error("❌ Supabase direct category filter save failed:", sbErr);
    }
  }

  return filter;
}

/**
 * Delete Category Filter from Database (Admin only)
 */
export async function deleteCategoryFilterUnified(filterId: string, adminSecret?: string): Promise<boolean> {
  const secret = getAdminSecret(adminSecret);

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl(`/api/category-filters/${filterId}`), {
      method: "DELETE",
      headers: {
        "X-Admin-Secret": secret
      }
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

  // 1. Try Backend API
  try {
    const res = await fetch(getApiUrl("/api/category-filters/reorder"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": secret
      },
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

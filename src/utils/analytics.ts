// Client-side Analytics Utility with Smart Anti-Spam & Impression Observer Support

const SESSION_STORAGE_KEY = 'quekart_client_session_id';

export function getClientSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch (e) {
    return 'anon-session';
  }
}

/**
 * Sends a batch or single product impression tracking request.
 * Automatically protected by 3-hour per-IP anti-spam server policy.
 */
export async function trackProductImpressions(productIds: string[] | string): Promise<void> {
  const ids = Array.isArray(productIds) ? productIds : [productIds];
  if (!ids || ids.length === 0) return;

  try {
    const clientId = getClientSessionId();
    await fetch('/api/analytics/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: ids, clientId })
    });
  } catch (err) {
    console.debug('Impression tracking error:', err);
  }
}

/**
 * Sends a product detail view tracking request when a product is opened.
 * Protected by 3-hour per-IP anti-spam server policy.
 */
export async function trackProductView(productId: string): Promise<{ success: boolean; counted: boolean; reason?: string }> {
  if (!productId) return { success: false, counted: false };

  try {
    const clientId = getClientSessionId();
    const res = await fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, clientId })
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.debug('View tracking error:', err);
  }
  return { success: false, counted: false };
}

/**
 * Sends an add-to-cart analytics tracking event.
 */
export async function trackProductCartAdd(productId: string): Promise<void> {
  if (!productId) return;

  try {
    const clientId = getClientSessionId();
    await fetch('/api/analytics/cart-add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, clientId })
    });
  } catch (err) {
    console.debug('Cart add tracking error:', err);
  }
}

/**
 * Fetch vendor analytics report
 */
export async function fetchVendorAnalytics(vendorId: string) {
  try {
    const res = await fetch(`/api/analytics/vendor/${vendorId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Fetch vendor analytics failed:', err);
  }
  return null;
}

/**
 * Fetch admin platform analytics report
 */
export async function fetchAdminAnalytics(adminSecret?: string) {
  try {
    const secret = adminSecret || localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    const res = await fetch('/api/analytics/admin', {
      headers: { 'X-Admin-Secret': secret }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Fetch admin analytics failed:', err);
  }
  return null;
}

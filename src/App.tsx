import { useState, useEffect } from 'react';
import { Sparkles, Heart, HelpCircle, ArrowLeft, Smile, Search, LogOut, CheckCircle2, User as UserIcon, ShoppingBag, ShieldAlert } from 'lucide-react';
import { mockProducts, initialOrders, initialBanners, mockCategories } from './data';
import { 
  fetchProductsUnified, 
  fetchCategoriesUnified, 
  fetchBannersUnified, 
  fetchCouponsUnified, 
  fetchOrdersUnified, 
  saveProductUnified, 
  deleteProductUnified, 
  saveOrderUnified,
  isSupabaseConfigured 
} from './supabase';
import { Product, CartItem, Order, Coupon, Banner, Category } from './types';
import { getApiUrl } from './utils/api';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeFeed from './components/HomeFeed';
import CategoriesView from './components/CategoriesView';
import ProductDetail from './components/ProductDetail';
import OrdersView from './components/OrdersView';
import CartView from './components/CartView';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';
import VendorDashboard from './components/VendorDashboard';
import LogoView from './components/LogoView';
import UserAuthView from './components/UserAuthView';
import AuthPromptModal from './components/AuthPromptModal';
import CategoryProductsView from './components/CategoryProductsView';
import VendorStoreView from './components/VendorStoreView';
import LandingGateway from './components/LandingGateway';
import { smartSearchFilter } from './utils/search';

const initialCoupons: Coupon[] = [
  {
    code: 'QUEKART50',
    discountType: 'flat',
    value: 50,
    minPurchase: 299,
    description: 'Flat ₹50 OFF on orders above ₹299'
  },
  {
    code: 'QUEKART50',
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

export default function App() {
  // 1. Path-based routing state with search query support
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + (window.location.search || ''));

  // Sync with browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + (window.location.search || ''));
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Centralized navigation function
  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Helper to parse current pathname
  const parseCurrentPath = () => {
    const [pathnameOnly, searchPart] = currentPath.split('?');
    const parts = pathnameOnly.split('/').filter(Boolean);
    let portal: 'landing' | 'shop' | 'vendor' | 'admin' = 'landing';
    let tab = 'home';
    let productId: string | null = null;
    let subPage: string | null = null;

    if (parts.length === 0 || parts[0] === 'landing') {
      portal = 'landing';
      tab = 'landing';
    } else if (parts[0] === 'vendor') {
      portal = 'vendor';
      tab = 'vendor';
      if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } else if (parts[0] === 'admin') {
      portal = 'admin';
      tab = 'admin';
      if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } else if (parts[0] === 'shop') {
      portal = 'shop';
      if (parts.length === 1 || parts[1] === 'home') {
        tab = 'home';
      } else if (parts[1] === 'product' && parts[2]) {
        productId = parts[2];
        tab = 'product';
      } else if (parts[1] === 'login' || parts[1] === 'auth' || parts[1] === 'user') {
        tab = 'user';
      } else if (['categories', 'orders', 'wishlist', 'cart', 'profile', 'logo', 'store'].includes(parts[1])) {
        tab = parts[1];
        if (parts[1] === 'categories' && parts[2]) {
          subPage = parts[2];
        } else if (parts[1] === 'store' && parts[2]) {
          subPage = parts[2];
        } else if (parts[1] === 'profile' && parts[2]) {
          subPage = parts.slice(2).join('/');
        }
      } else {
        tab = 'home';
      }
    } else if (parts[0] === 'product' && parts[1]) {
      portal = 'shop';
      productId = parts[1];
      tab = 'product';
    } else if (parts[0] === 'store' && parts[1]) {
      portal = 'shop';
      tab = 'store';
      subPage = parts[1];
    } else if (parts[0] === 'user' || parts[0] === 'login' || parts[0] === 'auth') {
      portal = 'shop';
      tab = 'user';
      if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } else if (['home', 'categories', 'orders', 'wishlist', 'cart', 'profile', 'logo', 'store'].includes(parts[0])) {
      portal = 'shop';
      tab = parts[0];
      if (parts[0] === 'categories' && parts[1]) {
        subPage = parts[1];
      } else if (parts[0] === 'store' && parts[1]) {
        subPage = parts[1];
      } else if (parts[0] === 'profile' && parts[1]) {
        subPage = parts.slice(1).join('/');
      }
    } else {
      portal = 'landing';
      tab = 'landing';
    }

    return { portal, tab, productId, subPage, search: searchPart ? `?${searchPart}` : '', fullPath: currentPath };
  };

  const { portal: activePortal, tab: activeTab, productId, subPage: activeSubPage } = parseCurrentPath();

  // User session state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('quekart_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const handleLoginUserSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('quekart_current_user', JSON.stringify(user));
    localStorage.setItem('quekart_user_token', token);
    navigateTo('/shop'); // Directly enters into the customer panel (homepage with products)
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('quekart_current_user');
    localStorage.removeItem('quekart_user_token');
    navigateTo('/shop'); // Redirects to mobile number OTP verification
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('quekart_current_user', JSON.stringify(updatedUser));
  };

  // Database-driven products state (initialized with cached or mock products to prevent blank flash)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('quekart_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return mockProducts;
  });

  // Database-driven orders state
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Database-driven coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  // Database-driven categories state
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  // Dynamic persistent banners state
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  // Fetch initial data from server-side or Supabase direct
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const [productsData, ordersData, couponsData, categoriesData, bannersData] = await Promise.all([
          fetchProductsUnified(),
          fetchOrdersUnified(),
          fetchCouponsUnified(),
          fetchCategoriesUnified(),
          fetchBannersUnified()
        ]);
        
        if (isMounted) {
          if (productsData && productsData.length > 0) {
            setProducts(productsData);
          }
          if (ordersData && ordersData.length > 0) {
            setOrders(ordersData);
          }
          if (couponsData && couponsData.length > 0) {
            setCoupons(couponsData);
          }
          if (categoriesData && categoriesData.length > 0) {
            setCategories(categoriesData);
          }
          if (bannersData && bannersData.length > 0) {
            setBanners(bannersData);
          }
        }
      } catch (err) {
        console.warn('⚠️ Data loading notice:', err);
      }
    };

    const fetchUserProfile = async () => {
      const token = localStorage.getItem('quekart_user_token');
      const savedUser = localStorage.getItem('quekart_current_user');
      if (token || savedUser) {
        try {
          const parsed = savedUser ? JSON.parse(savedUser) : null;
          const phone = parsed?.phone;
          const url = phone ? `/api/user/profile?phone=${encodeURIComponent(phone)}` : '/api/user/profile';
          const res = await fetch(getApiUrl(url), {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok && isMounted) {
            const data = await res.json();
            if (data.user) {
              setCurrentUser(data.user);
              localStorage.setItem('quekart_current_user', JSON.stringify(data.user));
            }
          }
        } catch (_) {}
      }
    };
    
    fetchInitialData();
    fetchUserProfile();
    return () => { isMounted = false; };
  }, []);

  const selectedProduct = productId ? products.find((p) => p.id === productId) || null : null;
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Wishlist state (product IDs) - fully backed by localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('quekart_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Persist wishlist changes to localStorage
  useEffect(() => {
    localStorage.setItem('quekart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSelectCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategory('All');
    } else {
      setSelectedCategory((prev) => (prev === category ? 'All' : category));
    }
  };

  // Sync scroll behavior on route/product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab, selectedProduct]);

  // Auth Prompt Modal State (for gating restricted guest actions)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState('Sign In Required');
  const [authModalDescription, setAuthModalDescription] = useState('Please sign in with your mobile number to continue.');

  const triggerRequireLogin = (actionTitle = 'Sign In Required', actionDesc = 'Please sign in with your mobile number to continue.') => {
    setAuthModalTitle(actionTitle);
    setAuthModalDescription(actionDesc);
    setIsAuthModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (product: Product, size: string, variantIndex: number) => {
    if (!currentUser) {
      triggerRequireLogin('Add to Cart', 'Sign in with your mobile number to add items to your shopping cart.');
      return;
    }
    const cartItemId = `${product.id}-${variantIndex}-${size}`;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { id: cartItemId, product, selectedSize: size, selectedVariantIndex: variantIndex, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Order placement (Server-side verified + Supabase Sync)
  const handlePlaceOrder = async (newOrder: Order, couponCode?: string, isUpi?: boolean) => {
    if (!currentUser) {
      triggerRequireLogin('Place Order', 'Sign in with your mobile number to complete and place your order.');
      return;
    }
    try {
      const payload = {
        userId: currentUser.id,
        userPhone: currentUser.phone,
        userEmail: currentUser.email,
        items: newOrder.items,
        appliedCouponCode: couponCode || null,
        isUpiPayment: isUpi || false,
        shippingAddress: newOrder.shippingAddress
      };

      const verifiedOrder = await saveOrderUnified(payload);
      if (verifiedOrder) {
        setOrders((prevOrders) => [verifiedOrder, ...prevOrders]);
        setCart([]); // Clear cart
      } else {
        setOrders((prevOrders) => [{ ...newOrder, userId: currentUser.id, userPhone: currentUser.phone }, ...prevOrders]);
        setCart([]); // Clear cart
      }
    } catch (e) {
      console.warn("Placing order notice:", e);
      setOrders((prevOrders) => [{ ...newOrder, userId: currentUser.id, userPhone: currentUser.phone }, ...prevOrders]);
      setCart([]); // Clear cart
    }
  };

  // Direct checkout buy now
  const handleDirectBuyNow = (product: Product, size: string, variantIndex: number) => {
    if (!currentUser) {
      triggerRequireLogin('Buy Now', 'Sign in with your mobile number to proceed directly to checkout.');
      return;
    }
    // Add item first
    handleAddToCart(product, size, variantIndex);
    // Navigate to cart
    navigateTo('/cart');
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    if (!currentUser) {
      triggerRequireLogin('Save to Wishlist', 'Sign in with your mobile number to save items to your personal wishlist.');
      return;
    }
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Admin Operations Actions (Restricted & Authenticated)
  const handleAddProduct = async (newProduct: Product) => {
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    // Optimistically update local state first
    setProducts((prev) => [newProduct, ...prev]);
    try {
      const saved = await saveProductUnified(newProduct, adminSecret);
      if (saved) {
        setProducts((prev) => prev.map(p => p.id === newProduct.id ? saved : p));
      }
    } catch (e) {
      console.warn('Network notice: keeping local product listing', e);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    // Optimistically update local state first
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const saved = await saveProductUnified(updatedProduct, adminSecret);
      if (saved) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      }
    } catch (e) {
      console.warn('Network notice: keeping local product modification', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // Optimistically update local state first
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      await deleteProductUnified(productId, adminSecret);
    } catch (e) {
      console.warn('Network notice: keeping local product deletion', e);
    }
  };

  // Vendor Action Proxies
  const handleVendorAddProduct = async (newProduct: Product) => {
    let vendorId = '';
    try {
      const saved = localStorage.getItem('quekart_current_vendor');
      if (saved) {
        vendorId = JSON.parse(saved).id;
      }
    } catch (_) {}

    setProducts((prev) => [newProduct, ...prev]);
    try {
      const saved = await saveProductUnified(newProduct, undefined, vendorId);
      if (saved) {
        setProducts((prev) => prev.map(p => p.id === newProduct.id ? saved : p));
      }
    } catch (e) {
      console.warn('Vendor add product notice:', e);
    }
  };

  const handleVendorEditProduct = async (updatedProduct: Product) => {
    let vendorId = '';
    try {
      const saved = localStorage.getItem('quekart_current_vendor');
      if (saved) {
        vendorId = JSON.parse(saved).id;
      }
    } catch (_) {}

    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    try {
      const saved = await saveProductUnified(updatedProduct, undefined, vendorId);
      if (saved) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      }
    } catch (e) {
      console.warn('Vendor edit product notice:', e);
    }
  };

  const handleVendorDeleteProduct = async (productId: string) => {
    let vendorId = '';
    try {
      const saved = localStorage.getItem('quekart_current_vendor');
      if (saved) {
        vendorId = JSON.parse(saved).id;
      }
    } catch (_) {}

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deleteProductUnified(productId);
    } catch (e) {
      console.warn('Vendor delete product notice:', e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Optimistically update local state first
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? saved : o)));
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Order Update: ${err.error || 'Using local optimistic update'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local order status update', e);
    }
  };

  const handleReturnOrder = async (orderId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Customer requested return' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        }
        if (data.user && currentUser && data.user.id === currentUser.id) {
          setCurrentUser(data.user);
          localStorage.setItem('quekart_user_session', JSON.stringify(data.user));
        }
        return { success: true, refundAmount: data.refundAmount };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || 'Failed to process return' };
      }
    } catch (e: any) {
      console.error('Error processing return:', e);
      return { success: false, error: e.message || 'Network error' };
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    // Optimistically update local state first
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Order Deletion: ${err.error || 'Using local optimistic deletion'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local order deletion', e);
    }
  };

  const handleAddCoupon = async (newCoupon: Coupon) => {
    // Optimistically update local state first
    setCoupons((prev) => [newCoupon, ...prev]);
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(getApiUrl('/api/coupons'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        const saved = await res.json();
        setCoupons((prev) => prev.map(c => c.code === newCoupon.code ? saved : c));
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Coupon Addition: ${err.error || 'Using local optimistic coupon'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local coupon addition', e);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    // Optimistically update local state first
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(getApiUrl(`/api/coupons/${code}`), {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Coupon Deletion: ${err.error || 'Using local optimistic deletion'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local coupon deletion', e);
    }
  };

  const handleAddBanner = async (newBanner: Banner) => {
    // Optimistically update local state first
    setBanners((prev) => [newBanner, ...prev]);
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(getApiUrl('/api/banners'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        const saved = await res.json();
        setBanners((prev) => prev.map(b => b.id === newBanner.id ? saved : b));
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Banner Addition: ${err.error || 'Using local optimistic banner'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local banner addition', e);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    // Optimistically update local state first
    setBanners((prev) => prev.filter((b) => b.id !== id));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(getApiUrl(`/api/banners/${id}`), {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Banner Deletion: ${err.error || 'Using local optimistic deletion'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local banner deletion', e);
    }
  };

  // Buyer view filtered products (only approved or default legacy products)
  const approvedProducts = products.filter((p) => p.approvalStatus === 'approved' || !p.approvalStatus);

  // Filtered products for Search query based on title, description, category, subcategory, tags, etc.
  const searchedProducts = smartSearchFilter(approvedProducts, searchQuery);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="applet-root">
      {/* 1. LANDING GATEWAY / PLATFORM HUB (abc.xyz /) */}
      {activePortal === 'landing' ? (
        <LandingGateway onNavigate={navigateTo} />
      ) : activePortal === 'vendor' ? (
        /* 2. VENDOR PORTAL (Isolated Supplier Web App at /vendor) */
        <VendorDashboard
          products={products}
          orders={orders}
          onAddProduct={handleVendorAddProduct}
          onEditProduct={handleVendorEditProduct}
          onDeleteProduct={handleVendorDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onClose={() => navigateTo('/vendor')}
          activeSubPage={activeSubPage}
          setActiveSubPage={(sub) => navigateTo(sub ? `/vendor/${sub}` : '/vendor')}
          navigateTo={navigateTo}
          currentPath={currentPath}
        />
      ) : activePortal === 'admin' ? (
        /* 3. ADMIN DASHBOARD (Isolated Administration at /admin) */
        <AdminDashboard
          products={products}
          orders={orders}
          coupons={coupons}
          banners={banners}
          categories={categories}
          onSetCategories={setCategories}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onAddCoupon={handleAddCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onAddBanner={handleAddBanner}
          onDeleteBanner={handleDeleteBanner}
          onClose={() => navigateTo('/admin/overview')}
          activeSubPage={activeSubPage}
          setActiveSubPage={(sub) => navigateTo(sub ? `/admin/${sub}` : '/admin/overview')}
          navigateTo={navigateTo}
          currentPath={currentPath}
        />
      ) : (
        /* 4. CUSTOMER SHOPPING STOREFRONT (/shop) */
        <div 
          className={`w-full bg-white flex flex-col relative ${
            (!currentUser && (activeTab === 'user' || (activeTab === 'home' && !sessionStorage.getItem('quekart_browsing_guest'))))
              ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
              : 'min-h-screen'
          }`} 
          id="customer-shop-container"
        >
          {/* Dynamic content rendering body */}
          <div 
            className={`flex-1 ${
              (!currentUser && (activeTab === 'user' || (activeTab === 'home' && !sessionStorage.getItem('quekart_browsing_guest'))))
                ? 'overflow-hidden h-[100dvh] max-h-[100dvh] pb-0 bg-white'
                : activeTab === 'categories' 
                ? 'overflow-hidden h-[calc(100vh-60px)] md:h-[calc(100vh-120px)] pb-16 bg-gray-50' 
                : 'overflow-y-auto pb-20 md:pb-10 bg-gray-50'
            }`} 
            id="applet-content-viewport"
          >
            {/* If user is not logged in and on shop root or user/login tab, present OTP auth first */}
            {!currentUser && (activeTab === 'user' || (activeTab === 'home' && !sessionStorage.getItem('quekart_browsing_guest'))) ? (
              <UserAuthView
                onLoginSuccess={handleLoginUserSuccess}
                onSkip={() => {
                  sessionStorage.setItem('quekart_browsing_guest', 'true');
                  navigateTo('/shop');
                }}
                navigateTo={navigateTo}
              />
            ) : selectedProduct ? (
              /* PRODUCT DETAILS VIEW */
              <ProductDetail
                product={selectedProduct}
                suggestedProducts={approvedProducts}
                onSelectProduct={(id) => navigateTo('/shop/product/' + id)}
                onBack={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    navigateTo('/shop');
                  }
                }}
                onAddToCart={handleAddToCart}
                onDirectBuy={handleDirectBuyNow}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                currentUser={currentUser}
                orders={orders}
                onRequireLogin={triggerRequireLogin}
                onProductUpdated={(updated) => {
                  setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                }}
                onVisitStore={(vendorId, vendorName) => {
                  const target = vendorId || vendorName || '';
                  navigateTo('/shop/store/' + encodeURIComponent(target));
                }}
                cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                onOpenCart={() => navigateTo('/shop/cart')}
                onOpenWishlist={() => navigateTo('/shop/wishlist')}
                onSearch={(q) => {
                  setSearchQuery(q);
                  navigateTo('/shop');
                }}
              />
            ) : (
              <>
                {/* Render Header on customer storefront tabs */}
                {activeTab !== 'profile' && activeTab !== 'user' && activeTab !== 'logo' && (
                  <Header
                    cart={cart}
                    onOpenCart={() => navigateTo('/shop/cart')}
                    onSearch={setSearchQuery}
                    searchQuery={searchQuery}
                    onSelectTab={(tab) => navigateTo(tab === 'home' ? '/shop' : '/shop/' + tab)}
                    activeTab={activeTab}
                    products={approvedProducts}
                    currentUser={currentUser}
                    onLogout={handleLogoutUser}
                  />
                )}

                {/* Tab Switcher */}
                {activeTab === 'home' && (
                  <HomeFeed
                    categories={categories}
                    products={searchedProducts}
                    banners={banners}
                    onSelectProduct={(p) => navigateTo('/shop/product/' + p.id)}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    searchQuery={searchQuery}
                    currentUser={currentUser}
                    onRequireLogin={triggerRequireLogin}
                  />
                )}

                {activeTab === 'categories' && (
                  activeSubPage ? (
                    <CategoryProductsView
                      filterName={decodeURIComponent(activeSubPage)}
                      products={products}
                      onBack={() => navigateTo('/shop/categories')}
                      onSelectProduct={(id) => navigateTo('/shop/product/' + id)}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      currentUser={currentUser}
                      onRequireLogin={triggerRequireLogin}
                    />
                  ) : (
                    <CategoriesView
                      categories={categories}
                      onSelectCategory={(categoryName) => {
                        navigateTo('/shop/categories/' + encodeURIComponent(categoryName));
                      }}
                      onSelectTab={(tab) => navigateTo(tab === 'home' ? '/shop' : '/shop/' + tab)}
                    />
                  )
                )}

                {activeTab === 'orders' && (
                  <OrdersView
                    orders={orders}
                    onSelectProduct={(id) => navigateTo('/shop/product/' + id)}
                    onSelectTab={(tab) => navigateTo(tab === 'home' ? '/shop' : '/shop/' + tab)}
                    currentUser={currentUser}
                    onReturnOrder={handleReturnOrder}
                  />
                )}

                {activeTab === 'wishlist' && (
                  <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 w-full" id="wishlist-page">
                    {currentUser && (
                      <div className="sticky top-[60px] md:top-[120px] z-[90] bg-gray-50 px-4 pt-3 pb-3 border-b border-gray-200/80 shadow-xs">
                        {/* Local Search for Wishlist */}
                        <div className="max-w-7xl mx-auto relative flex-1 w-full">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search wishlist..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                            id="wishlist-search-input"
                          />
                        </div>
                      </div>
                    )}

                    <div className="max-w-7xl mx-auto px-4 mt-4" id="wishlist-list-content">
                    {!currentUser ? (
                      <div className="max-w-md mx-auto py-16 flex flex-col items-center text-center" id="guest-wishlist-view">
                        <div className="w-20 h-20 rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shadow-sm mb-4">
                          <Heart className="w-10 h-10 stroke-[1.8]" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Your Wishlist is Empty</h2>
                        <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed max-w-xs">
                          Sign in to view and save trending clothes, gadgets & lifestyle items to your personal wishlist.
                        </p>
                        <div className="w-full space-y-2.5 mt-6">
                          <button
                            onClick={() => navigateTo('/shop/login')}
                            className="w-full py-3 bg-[#143C6B] hover:bg-[#0C2340] active:scale-[0.99] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
                            id="wishlist-signin-btn"
                          >
                            Sign In / Log In
                          </button>
                          <button
                            onClick={() => navigateTo('/shop')}
                            className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            id="wishlist-explore-btn"
                          >
                            Explore Trending Products
                          </button>
                        </div>
                      </div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-16" id="empty-wishlist-view">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-bold">Your wishlist is currently empty.</p>
                        <button
                          onClick={() => navigateTo('/shop')}
                          className="mt-4 bg-lucky-magenta text-white font-extrabold text-xs py-2 px-6 rounded-full cursor-pointer hover:opacity-90"
                        >
                          Browse Products
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" id="wishlist-grid">
                        {products
                          .filter((p) => wishlist.includes(p.id) && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => navigateTo('/shop/product/' + p.id)}
                              className="bg-white rounded-xl overflow-hidden border border-gray-200/80 p-2.5 relative cursor-pointer hover:shadow-md transition-all"
                            >
                              <img src={p.images[0]} alt={p.title} className="w-full aspect-square object-cover rounded-lg" referrerPolicy="no-referrer" />
                              <h3 className="text-xs font-bold text-gray-700 truncate mt-2">{p.title}</h3>
                              <p className="text-xs font-black text-gray-950 mt-1 premium-rupee">₹{p.price}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleWishlist(p.id);
                                }}
                                className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full text-red-500 shadow-xs hover:scale-110 active:scale-95 transition-transform"
                              >
                                <Heart className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                    </div>
                  </div>
                )}

                {activeTab === 'logo' && (
                  <LogoView onBack={() => navigateTo('/shop')} />
                )}

                {activeTab === 'profile' && (
                  <ProfileView
                    onBack={() => navigateTo('/shop')}
                    onOpenCart={() => navigateTo('/shop/cart')}
                    cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
                    onSelectTab={(tab) => navigateTo(tab === 'home' ? '/shop' : (tab === 'user' ? '/shop/login' : '/shop/' + tab))}
                    wishlistCount={wishlist.length}
                    ordersCount={orders.length}
                    activeSubPage={activeSubPage}
                    setActiveSubPage={(sub) => navigateTo(sub ? `/shop/profile/${sub}` : '/shop/profile')}
                    currentUser={currentUser}
                    onUpdateUser={handleUpdateUser}
                    onLogout={handleLogoutUser}
                  />
                )}

                {activeTab === 'cart' && (
                  <CartView
                    isOpen={true}
                    onClose={() => navigateTo('/shop')}
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onPlaceOrder={handlePlaceOrder}
                    coupons={coupons}
                    currentUser={currentUser}
                    onNavigate={(path) => navigateTo(path.startsWith('/shop') ? path : (path === '/user' ? '/shop/login' : `/shop${path}`))}
                  />
                )}

                {activeTab === 'store' && (
                  <VendorStoreView
                    storeIdentifier={activeSubPage ? decodeURIComponent(activeSubPage) : ''}
                    products={approvedProducts}
                    onSelectProduct={(id) => navigateTo('/shop/product/' + id)}
                    onBack={() => {
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        navigateTo('/shop');
                      }
                    }}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={handleAddToCart}
                    currentUser={currentUser}
                    onRequireLogin={triggerRequireLogin}
                    cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                    onOpenCart={() => navigateTo('/shop/cart')}
                    onOpenWishlist={() => navigateTo('/shop/wishlist')}
                  />
                )}

                {activeTab === 'user' && (
                  !currentUser ? (
                    <UserAuthView
                      onLoginSuccess={handleLoginUserSuccess}
                      onSkip={() => {
                        sessionStorage.setItem('quekart_browsing_guest', 'true');
                        navigateTo('/shop');
                      }}
                      navigateTo={navigateTo}
                    />
                  ) : (
                    <HomeFeed
                      categories={categories}
                      products={searchedProducts}
                      banners={banners}
                      onSelectProduct={(p) => navigateTo('/shop/product/' + p.id)}
                      wishlist={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      selectedCategory={selectedCategory}
                      onSelectCategory={handleSelectCategory}
                      searchQuery={searchQuery}
                      currentUser={currentUser}
                      onRequireLogin={triggerRequireLogin}
                    />
                  )
                )}
              </>
            )}
          </div>
          
          {/* Global Bottom Navigation shown across customer storefront (hidden on login page) */}
          {!((activeTab === 'user' || (activeTab === 'home' && !sessionStorage.getItem('quekart_browsing_guest'))) && !currentUser) && (
            <BottomNav
              activeTab={activeTab}
              cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
              onSelectTab={(tab) => {
                navigateTo(tab === 'home' ? '/shop' : '/shop/' + tab);
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            />
          )}

          {/* Global Auth Prompt Modal for Guest Action Interception */}
          <AuthPromptModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={() => {
              setIsAuthModalOpen(false);
              navigateTo('/shop/login');
            }}
            actionTitle={authModalTitle}
            actionDescription={authModalDescription}
          />
        </div>
      )}
    </div>
  );
}

// Simple icons
function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5" className="w-4 h-4 text-gray-400 inline">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, HelpCircle, ArrowLeft, Smile, Search, LogOut, CheckCircle2, User as UserIcon, ShoppingBag, ShieldAlert } from 'lucide-react';
import { initialOrders, initialBanners } from './data';
import { 
  fetchProductsUnified, 
  fetchCategoriesUnified, 
  fetchCategoryFiltersUnified,
  fetchSubCategoriesUnified,
  fetchBannersUnified, 
  fetchCouponsUnified, 
  fetchOrdersUnified, 
  saveProductUnified, 
  deleteProductUnified, 
  saveOrderUnified,
  isSupabaseConfigured 
} from './supabase';
import { Product, CartItem, Order, Coupon, Banner, Category, CategoryFilter, SubCategory } from './types';
import { getApiUrl } from './utils/api';
import { resetScrollToTop } from './utils/scroll';
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
import ComplianceView from './components/ComplianceView';
import SeoHubView from './components/SeoHubView';
import { smartSearchFilter } from './utils/search';
import { updatePageSEO } from './utils/seo';

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

// Safe storage helper functions to prevent SecurityError in sandbox iframes or private modes
const safeGetLocalStorage = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
  } catch (_) {
    return null;
  }
};

const safeSetLocalStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (_) {}
};

const safeRemoveLocalStorage = (key: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (_) {}
};

const safeGetSessionStorage = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? sessionStorage.getItem(key) : null;
  } catch (_) {
    return null;
  }
};

const safeSetSessionStorage = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value);
    }
  } catch (_) {}
};

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
    resetScrollToTop();
  };

  // Helper to parse current pathname
  const parseCurrentPath = () => {
    const [pathnameOnly, searchPart] = currentPath.split('?');
    const parts = pathnameOnly.split('/').filter(Boolean);
    const firstPart = (parts[0] || '').toLowerCase();
    const secondPart = (parts[1] || '').toLowerCase();
    const thirdPart = parts[2] || null;

    let portal: 'landing' | 'shop' | 'vendor' | 'admin' | 'seo' = 'landing';
    let tab = 'home';
    let productId: string | null = null;
    let subPage: string | null = null;
    let subCategoryName: string | null = null;

    // 0. Dedicated SEO Comparison & Category Hub Pages
    if (['compare', 'collections', 'explore', 'sell-online', 'seo', 'directory'].includes(firstPart)) {
      portal = 'seo';
      tab = firstPart;
      subPage = secondPart ? `${firstPart}/${secondPart}` : (firstPart === 'compare' ? 'compare/quekart-vs-meesho' : firstPart);
    }
    // 1. Direct Compliance & Policies
    else if (['terms', 'privacy', 'refund', 'contact'].includes(firstPart)) {
      portal = 'landing';
      tab = firstPart;
    }
    // 2. Direct Customer Auth
    else if (firstPart === 'login') {
      portal = 'shop';
      tab = 'user';
      subPage = 'login';
    } else if (firstPart === 'signup') {
      portal = 'shop';
      tab = 'user';
      subPage = 'signup';
    }
    // 3. Platform Gateway / Hub Landing
    else if (parts.length === 0 || firstPart === 'landing') {
      portal = 'landing';
      tab = 'landing';
    } 
    // 4. Vendor Portal
    else if (firstPart === 'vendor') {
      portal = 'vendor';
      tab = 'vendor';
      if (secondPart === 'register' || secondPart === 'signup') {
        subPage = 'signup';
      } else if (secondPart === 'login') {
        subPage = 'login';
      } else if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } 
    // 5. Admin Portal
    else if (firstPart === 'admin') {
      portal = 'admin';
      tab = 'admin';
      if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } 
    // 6. Shop Portal Routing
    else if (firstPart === 'shop') {
      portal = 'shop';
      if (parts.length === 1 || secondPart === 'home') {
        tab = 'home';
      } else if (['terms', 'privacy', 'refund', 'contact'].includes(secondPart)) {
        portal = 'landing';
        tab = secondPart;
      } else if (secondPart === 'login') {
        tab = 'user';
        subPage = 'login';
      } else if (secondPart === 'signup') {
        tab = 'user';
        subPage = 'signup';
      } else if (secondPart === 'product' && thirdPart) {
        productId = thirdPart;
        tab = 'product';
      } else if (['categories', 'orders', 'wishlist', 'cart', 'profile', 'logo', 'store'].includes(secondPart)) {
        tab = secondPart;
        if (secondPart === 'categories' && thirdPart) {
          subPage = thirdPart;
          if (parts[3]) {
            subCategoryName = decodeURIComponent(parts[3]);
          } else if (searchPart) {
            const sp = new URLSearchParams(searchPart);
            const sc = sp.get('subCategory');
            if (sc) {
              subCategoryName = decodeURIComponent(sc);
            }
          }
        } else if (secondPart === 'store' && thirdPart) {
          subPage = thirdPart;
        } else if (secondPart === 'profile' && thirdPart) {
          subPage = parts.slice(2).join('/');
        }
      } else {
        tab = 'home';
      }
    } 
    // 7. Fallback legacy / direct root storefront mapping paths
    else if (firstPart === 'product' && parts[1]) {
      portal = 'shop';
      productId = parts[1];
      tab = 'product';
    } else if (firstPart === 'store' && parts[1]) {
      portal = 'shop';
      tab = 'store';
      subPage = parts[1];
    } else if (firstPart === 'user' || firstPart === 'auth') {
      portal = 'shop';
      tab = 'user';
      if (parts.length > 1) {
        subPage = parts.slice(1).join('/');
      }
    } else if (['home', 'categories', 'orders', 'wishlist', 'cart', 'profile', 'logo', 'store'].includes(firstPart)) {
      portal = 'shop';
      tab = firstPart;
      if (firstPart === 'categories' && parts[1]) {
        subPage = parts[1];
        if (parts[2]) {
          subCategoryName = decodeURIComponent(parts[2]);
        }
      } else if (firstPart === 'store' && parts[1]) {
        subPage = parts[1];
      } else if (firstPart === 'profile' && parts[1]) {
        subPage = parts.slice(1).join('/');
      }
    } 
    // 8. General unrecognized fallbacks
    else {
      portal = 'landing';
      tab = 'landing';
    }

    return { portal, tab, productId, subPage, subCategoryName, search: searchPart ? `?${searchPart}` : '', fullPath: currentPath };
  };

  const { portal: activePortal, tab: activeTab, productId, subPage: activeSubPage, subCategoryName: activeSubCategoryName } = parseCurrentPath();

  // User session state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = safeGetLocalStorage('quekart_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  // Track guest browsing state in React state for instant 1-click Skip login re-renders
  const [isBrowsingGuest, setIsBrowsingGuest] = useState<boolean>(() => {
    try {
      const sessionVal = safeGetSessionStorage('quekart_browsing_guest');
      const localVal = safeGetLocalStorage('quekart_browsing_guest');
      if (sessionVal === 'true' || localVal === 'true') return true;
      return false; // Default guest browsing to false for new users
    } catch (_) {
      return false;
    }
  });

  const handleLoginUserSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    safeSetLocalStorage('quekart_current_user', JSON.stringify(user));
    safeSetLocalStorage('quekart_user_token', token);
    navigateTo('/shop'); // Directly enters into the customer panel (homepage with products)
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    safeRemoveLocalStorage('quekart_current_user');
    safeRemoveLocalStorage('quekart_user_token');
    safeRemoveLocalStorage('quekart_browsing_guest');
    safeRemoveLocalStorage('quekart_user_session');
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem('quekart_browsing_guest');
      }
    } catch (_) {}
    setIsBrowsingGuest(false);
    navigateTo('/shop'); // Redirects to mobile number OTP verification
  };

  const handleUpdateUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    safeSetLocalStorage('quekart_current_user', JSON.stringify(updatedUser));
  };

  // Database-driven products state (initialized with cached or mock products to prevent blank flash)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = safeGetLocalStorage('quekart_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  // Database-driven orders state
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Database-driven coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);

  // Database-driven categories state (pre-initialized from cache)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const cached = safeGetLocalStorage('quekart_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  // Database-driven category filters state (left sidebar on /shop/categories)
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);

  // Dynamic persistent banners state (pre-initialized from cache)
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = safeGetLocalStorage('quekart_cached_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return initialBanners;
  });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoadingShopData, setIsLoadingShopData] = useState<boolean>(false);

  // Fetch / Refresh shop data with Prioritized Critical-First Streaming (Banners & Products first)
  const refreshShopData = useCallback(async () => {
    // 1. Critical visual pipeline (Banners, Categories, Products) - render immediately without waiting for background data
    const loadCriticalVisualData = async () => {
      try {
        const [bannersData, categoriesData, productsData, subCatsData] = await Promise.all([
          fetchBannersUnified(),
          fetchCategoriesUnified(),
          fetchProductsUnified(),
          fetchSubCategoriesUnified()
        ]);

        if (subCatsData && Array.isArray(subCatsData)) {
          setSubCategories(subCatsData);
        }

        if (bannersData && Array.isArray(bannersData) && bannersData.length > 0) {
          setBanners(bannersData);
        }

        if (categoriesData && Array.isArray(categoriesData)) {
          const hasAllCat = categoriesData.some(c => c && (c.id === 'cat-all' || c.name.toLowerCase() === 'all categories'));
          if (!hasAllCat) {
            const allCat: Category = {
              id: 'cat-all',
              name: 'All Categories',
              icon: 'shopping-bag',
              image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=75&w=300'
            };
            setCategories([allCat, ...categoriesData]);
          } else {
            setCategories(categoriesData);
          }
        }

        if (productsData && Array.isArray(productsData)) {
          setProducts(productsData);
        }
      } catch (err) {
        console.warn('⚠️ Critical visual loading notice:', err);
      }
    };

    // 2. Background data pipeline (Orders, Coupons, Category Filters) - non-blocking
    const loadSecondaryData = async () => {
      try {
        const [ordersData, couponsData, categoryFiltersData] = await Promise.all([
          fetchOrdersUnified(),
          fetchCouponsUnified(),
          fetchCategoryFiltersUnified()
        ]);

        if (ordersData && Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
        if (couponsData && Array.isArray(couponsData)) {
          setCoupons(couponsData);
        }
        if (categoryFiltersData && Array.isArray(categoryFiltersData)) {
          setCategoryFilters(categoryFiltersData);
        }
      } catch (err) {
        console.warn('⚠️ Secondary data loading notice:', err);
      }
    };

    // Execute in parallel with priority to critical visuals
    loadCriticalVisualData();
    loadSecondaryData();
  }, []);

  useEffect(() => {
    let isMounted = true;
    refreshShopData();

    const fetchUserProfile = async () => {
      const token = safeGetLocalStorage('quekart_user_token');
      const savedUser = safeGetLocalStorage('quekart_current_user');
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
              safeSetLocalStorage('quekart_current_user', JSON.stringify(data.user));
            }
          }
        } catch (_) {}
      }
    };
    
    refreshShopData();
    fetchUserProfile();
    return () => { isMounted = false; };
  }, []);

  const selectedProduct = productId ? products.find((p) => p.id === productId) || null : null;
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Wishlist state (product IDs) - fully backed by localStorage
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = safeGetLocalStorage('quekart_wishlist');
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
    safeSetLocalStorage('quekart_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSelectCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategory('All');
    } else {
      navigateTo('/shop/categories/' + encodeURIComponent(category));
    }
  };

  const handleCategoryBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/shop');
    }
  };

  // Sync scroll behavior on route/product/subpage changes across all portals & views
  useEffect(() => {
    resetScrollToTop();
  }, [currentPath, activePortal, activeTab, activeSubPage, selectedProduct]);

  // Dynamic Full-Site SEO & JSON-LD Synchronization for All Routes
  useEffect(() => {
    if (activePortal === 'seo') {
      // SeoHubView handles its own metadata dynamically based on the slug
      return;
    }
    if (selectedProduct) {
      updatePageSEO({
        title: `Buy ${selectedProduct.title} Online at Direct Factory Wholesale Price ₹${selectedProduct.price} | QueKart`,
        description: `Get ${selectedProduct.title} for just ₹${selectedProduct.price} (MRP ₹${selectedProduct.originalPrice}) on QueKart. Free Delivery, 100% Cash on Delivery & 7-Day Easy Returns.`,
        canonicalUrl: `https://quekart.in/shop/product/${selectedProduct.id}`,
        ogImage: selectedProduct.images?.[0] || 'https://img.icons8.com/color/512/shopping-bag--v1.png',
        structuredData: {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": selectedProduct.title,
          "image": selectedProduct.images || [],
          "description": selectedProduct.description,
          "sku": selectedProduct.id,
          "offers": {
            "@type": "Offer",
            "url": `https://quekart.in/shop/product/${selectedProduct.id}`,
            "priceCurrency": "INR",
            "price": selectedProduct.price,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": selectedProduct.soldBy || "QueKart Direct Wholesale"
            }
          }
        }
      });
    } else if (activePortal === 'shop' && activeTab === 'categories' && activeSubPage) {
      const decodedCat = decodeURIComponent(activeSubPage);
      updatePageSEO({
        title: `Wholesale ${decodedCat} Online - Direct Factory Rates & Free Delivery | QueKart`,
        description: `Shop wholesale ${decodedCat} direct from manufacturers at lowest prices in India. Cash on Delivery (COD) and 7-day returns available.`,
        canonicalUrl: `https://quekart.in/shop/categories/${encodeURIComponent(decodedCat)}`
      });
    } else if (activePortal === 'shop') {
      updatePageSEO({
        title: "QueKart Store - Direct Factory Wholesale Shopping Online in India",
        description: "Explore thousands of verified wholesale products directly from manufacturers across India at lowest prices. Free Delivery & COD available.",
        canonicalUrl: "https://quekart.in/shop"
      });
    } else if (activePortal === 'landing') {
      updatePageSEO({
        title: "QueKart™ - India's #1 Direct Factory Wholesale Online Shopping App | Alternative to Meesho, Flipkart & Amazon",
        description: "QueKart is India's leading wholesale e-commerce platform connecting buyers and suppliers directly at genuine factory rates. 0% seller commission, Free Delivery & COD.",
        canonicalUrl: "https://quekart.in/"
      });
    }
  }, [currentPath, activePortal, activeTab, activeSubPage, selectedProduct]);

  // Guest and Auth routing check: redirect new users to /shop/login
  useEffect(() => {
    const { portal, tab, subPage } = parseCurrentPath();
    if (portal === 'shop') {
      const isAuthPage = tab === 'user' && (subPage === 'login' || subPage === 'signup');
      if (!currentUser && !isBrowsingGuest && !isAuthPage) {
        navigateTo('/shop/login');
      }
    }
  }, [currentPath, currentUser, isBrowsingGuest]);

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
  const handleAddToCart = (product: Product, size: string, variantIndex: number, qtyToAdd: number = 1) => {
    if (!currentUser) {
      triggerRequireLogin('Add to Cart', 'Sign in with your mobile number to add items to your shopping cart.');
      return;
    }
    const cartItemId = `${product.id}-${variantIndex}-${size}`;
    const amount = qtyToAdd > 0 ? qtyToAdd : 1;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + amount } : item
        );
      }
      return [...prevCart, { id: cartItemId, product, selectedSize: size, selectedVariantIndex: variantIndex, quantity: amount }];
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
  const handleDirectBuyNow = (product: Product, size: string, variantIndex: number, qtyToAdd: number = 1) => {
    if (!currentUser) {
      triggerRequireLogin('Buy Now', 'Sign in with your mobile number to proceed directly to checkout.');
      return;
    }
    const cartItemId = `${product.id}-${variantIndex}-${size}`;
    const amount = qtyToAdd > 0 ? qtyToAdd : 1;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === cartItemId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === cartItemId ? { ...item, quantity: amount } : item
        );
      }
      return [...prevCart, { id: cartItemId, product, selectedSize: size, selectedVariantIndex: variantIndex, quantity: amount }];
    });
    // Navigate to cart/checkout billing
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
      const saved = safeGetLocalStorage('quekart_current_vendor');
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
      const saved = safeGetLocalStorage('quekart_current_vendor');
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
      const saved = safeGetLocalStorage('quekart_current_vendor');
      if (saved) {
        vendorId = JSON.parse(saved).id;
      }
    } catch (_) {}

    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await deleteProductUnified(productId, undefined, vendorId);
    } catch (e) {
      console.warn('Vendor delete product notice:', e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Optimistically update local state first
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    const userToken = safeGetLocalStorage('quekart_token') || '';
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Admin-Secret': adminSecret
      };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

      const res = await fetch(getApiUrl(`/api/orders/${orderId}`), {
        method: 'PUT',
        headers,
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
      const userToken = safeGetLocalStorage('quekart_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

      const res = await fetch(getApiUrl(`/api/orders/${orderId}/return`), {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: reason || 'Customer requested return' })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        }
        if (data.user && currentUser && data.user.id === currentUser.id) {
          setCurrentUser(data.user);
          safeSetLocalStorage('quekart_user_session', JSON.stringify(data.user));
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    const userToken = safeGetLocalStorage('quekart_token') || '';
    try {
      const headers: Record<string, string> = {
        'X-Admin-Secret': adminSecret
      };
      if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

      const res = await fetch(getApiUrl(`/api/orders/${orderId}`), {
        method: 'DELETE',
        headers
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
    setCoupons((prev) => prev.some(c => c.code === newCoupon.code) ? prev.map(c => c.code === newCoupon.code ? newCoupon : c) : [newCoupon, ...prev]);
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
    setBanners((prev) => prev.some(b => b.id === newBanner.id) ? prev.map(b => b.id === newBanner.id ? newBanner : b) : [newBanner, ...prev]);
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
    const adminSecret = safeGetLocalStorage('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
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
        ['terms', 'privacy', 'refund', 'contact'].includes(activeTab) ? (
          <ComplianceView 
            type={activeTab as any} 
            onBack={() => navigateTo('/')} 
            onNavigate={navigateTo}
          />
        ) : (
          <LandingGateway onNavigate={navigateTo} />
        )
      ) : activePortal === 'vendor' ? (
        /* 2. VENDOR PORTAL (Isolated Supplier Web App at /vendor) */
        <VendorDashboard
          categories={categories}
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
          categoryFilters={categoryFilters}
          onSetCategoryFilters={setCategoryFilters}
          onRefreshShopData={refreshShopData}
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
      ) : activePortal === 'seo' ? (
        /* 4. DEDICATED SEO COMPARISON & DISCOVERY HUB */
        <SeoHubView
          slug={activeSubPage || 'compare/quekart-vs-meesho'}
          products={approvedProducts}
          onNavigate={navigateTo}
          onSelectProduct={(p) => navigateTo('/shop/product/' + p.id)}
        />
      ) : (
        /* 5. CUSTOMER SHOPPING STOREFRONT (/shop) */
        <div 
          className="w-full h-[100svh] max-h-[100svh] bg-white flex flex-col relative overflow-hidden" 
          id="customer-shop-container"
        >
          {/* Dynamic content rendering body */}
          <div 
            className={`flex-1 flex flex-col min-h-0 ${
              (!currentUser && activeTab === 'user' && (activeSubPage === 'login' || activeSubPage === 'signup'))
                ? 'overflow-y-auto h-[100svh] max-h-[100svh] pb-0 bg-white'
                : (activeTab === 'categories' && !activeSubPage) 
                ? 'overflow-hidden pb-2 bg-gray-50' 
                : 'overflow-y-auto pb-6 bg-gray-50'
            }`} 
            id="applet-content-viewport"
          >
            {/* If user explicitly clicked login/signup or is on auth tab without logging in */}
            {!currentUser && activeTab === 'user' && (activeSubPage === 'login' || activeSubPage === 'signup') ? (
              <UserAuthView
                onLoginSuccess={handleLoginUserSuccess}
                onSkip={() => {
                  safeSetSessionStorage('quekart_browsing_guest', 'true');
                  safeSetLocalStorage('quekart_browsing_guest', 'true');
                  setIsBrowsingGuest(true);
                  navigateTo('/shop');
                }}
                navigateTo={navigateTo}
                isSignup={activeSubPage === 'signup'}
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
                {activeTab !== 'profile' && activeTab !== 'user' && activeTab !== 'logo' && activeTab !== 'cart' && activeTab !== 'orders' && !(activeTab === 'categories' && activeSubPage) && (
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
                    onSelectCategory={handleSelectCategory}
                  />
                )}

                {/* Tab Switcher with Motion Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + (activeSubPage || '')}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="w-full flex-1 flex flex-col min-h-0"
                  >
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
                        isLoading={isLoadingShopData}
                      />
                    )}

                    {activeTab === 'categories' && (
                      activeSubPage ? (
                        <CategoryProductsView
                          filterName={decodeURIComponent(activeSubPage)}
                          subCategoryFilter={activeSubCategoryName || undefined}
                          products={products}
                          categories={categories}
                          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                          wishlistCount={wishlist.length}
                          onOpenCart={() => navigateTo('/shop/cart')}
                          onOpenWishlist={() => navigateTo('/shop/wishlist')}
                          onBack={handleCategoryBack}
                          onSelectProduct={(id) => navigateTo('/shop/product/' + id)}
                          wishlist={wishlist}
                          onToggleWishlist={handleToggleWishlist}
                          currentUser={currentUser}
                          onRequireLogin={triggerRequireLogin}
                          isLoading={isLoadingShopData}
                        />
                      ) : (
                        <CategoriesView
                          categories={categories}
                          subCategories={subCategories}
                          onSelectCategory={(categoryName, subCategoryName) => {
                            if (subCategoryName) {
                              navigateTo('/shop/categories/' + encodeURIComponent(categoryName) + '?subCategory=' + encodeURIComponent(subCategoryName));
                            } else {
                              navigateTo('/shop/categories/' + encodeURIComponent(categoryName));
                            }
                          }}
                          onSelectTab={(tab) => navigateTo(tab === 'home' ? '/shop' : '/shop/' + tab)}
                          isLoading={isLoadingShopData}
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
                        isLoading={isLoadingShopData}
                      />
                    )}

                    {activeTab === 'wishlist' && (
                      <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 w-full" id="wishlist-page">
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
                                <motion.div
                                  key={p.id}
                                  whileHover={{ y: -3, scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => navigateTo('/shop/product/' + p.id)}
                                  className="bg-white rounded-xl overflow-hidden border border-gray-200/80 p-2.5 relative cursor-pointer hover:shadow-md transition-all"
                                >
                                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300'} alt={p.title} className="w-full aspect-square object-cover rounded-lg" referrerPolicy="no-referrer" />
                                  <h3 className="text-xs font-bold text-gray-700 truncate mt-2">{p.title}</h3>
                                  <p className="text-xs font-black text-gray-950 mt-1 premium-rupee">₹{p.price}</p>
                                  <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleWishlist(p.id);
                                    }}
                                    className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full text-red-500 shadow-xs hover:scale-110 active:scale-95 transition-transform"
                                  >
                                    <Heart className="w-4 h-4 fill-current" />
                                  </motion.button>
                                </motion.div>
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
                  </motion.div>
                </AnimatePresence>

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
                        safeSetSessionStorage('quekart_browsing_guest', 'true');
                        safeSetLocalStorage('quekart_browsing_guest', 'true');
                        setIsBrowsingGuest(true);
                        navigateTo('/shop');
                      }}
                      navigateTo={navigateTo}
                      isSignup={activeSubPage === 'signup'}
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
          
          {/* Global Bottom Navigation shown across customer storefront (hidden on dedicated login/signup pages & cart/billing checkout page) */}
          {activePortal === 'shop' && activeTab !== 'cart' && !(activeTab === 'user' && (activeSubPage === 'login' || activeSubPage === 'signup')) && (
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

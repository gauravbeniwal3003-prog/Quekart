import { useState, useEffect } from 'react';
import { Sparkles, Heart, HelpCircle, ArrowLeft, Smile, Search } from 'lucide-react';
import { mockProducts, initialOrders, initialBanners } from './data';
import { Product, CartItem, Order, Coupon, Banner } from './types';
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
  // 1. Path-based routing state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Sync with browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
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
  };

  // Helper to parse current pathname
  const parseCurrentPath = () => {
    const parts = currentPath.split('/').filter(Boolean);
    let tab = 'home';
    let productId: string | null = null;
    let subPage: string | null = null;

    if (parts.length === 0) {
      tab = 'home';
    } else if (parts[0] === 'product' && parts[1]) {
      productId = parts[1];
      tab = 'home'; // default background tab
    } else if (parts[0] === 'profile') {
      tab = 'profile';
      if (parts[1]) {
        subPage = parts[1];
      }
    } else if (parts[0] === 'admin') {
      tab = 'admin';
      if (parts[1]) {
        subPage = parts[1];
      }
    } else if (parts[0] === 'vendor') {
      tab = 'vendor';
      if (parts[1]) {
        subPage = parts[1];
      }
    } else if (['home', 'categories', 'orders', 'wishlist', 'cart', 'logo'].includes(parts[0])) {
      tab = parts[0];
    } else {
      tab = 'home';
    }

    return { tab, productId, subPage };
  };

  const { tab: activeTab, productId, subPage: activeSubPage } = parseCurrentPath();

  // Database-driven products state
  const [products, setProducts] = useState<Product[]>([]);

  // Database-driven orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Database-driven coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Dynamic persistent banners state
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  // Fetch initial data from server-side secure database intermediate proxy
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, ordersRes, couponsRes] = await Promise.all([
          fetch('/api/products?all=true'),
          fetch('/api/orders'),
          fetch('/api/coupons')
        ]);
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
        if (couponsRes.ok) {
          const couponsData = await couponsRes.json();
          setCoupons(couponsData);
        }
      } catch (err) {
        console.warn('⚠️ Server offline or loading failed. Operating in local fallback mode.', err);
      }
    };
    
    fetchInitialData();
  }, []);

  const selectedProduct = productId ? products.find((p) => p.id === productId) || null : null;
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Wishlist state (product IDs)
  const [wishlist, setWishlist] = useState<string[]>(['prod-watch-lr05']);

  // Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sync scroll behavior on route/product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, selectedProduct]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string, variantIndex: number) => {
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

  // Order placement (Server-side verified)
  const handlePlaceOrder = async (newOrder: Order, couponCode?: string, isUpi?: boolean) => {
    try {
      const payload = {
        items: newOrder.items,
        appliedCouponCode: couponCode || null,
        isUpiPayment: isUpi || false,
        shippingAddress: newOrder.shippingAddress
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const verifiedOrder = await res.json();
        setOrders((prevOrders) => [verifiedOrder, ...prevOrders]);
        setCart([]); // Clear cart
      } else {
        const err = await res.json();
        alert(`Order validation failed: ${err.error}. Resetting Order.`);
      }
    } catch (e) {
      console.warn("Placing order failed on server. Falling back to secure local emulation.", e);
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      setCart([]); // Clear cart
    }
  };

  // Direct checkout buy now
  const handleDirectBuyNow = (product: Product, size: string, variantIndex: number) => {
    // Add item first
    handleAddToCart(product, size, variantIndex);
    // Navigate to cart
    navigateTo('/cart');
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        // Replace optimistic product with actual saved product from backend
        setProducts((prev) => prev.map(p => p.id === newProduct.id ? saved : p));
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Product Addition: ${err.error || 'Using local optimistic item'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local product listing', e);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    // Optimistically update local state first
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret
        },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Product Update: ${err.error || 'Using local optimistic update'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local product modification', e);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    // Optimistically update local state first
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn(`Admin API Refused Product Deletion: ${err.error || 'Using local optimistic deletion'}`);
      }
    } catch (e) {
      console.warn('Network issue: keeping local product deletion', e);
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

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Vendor-ID': vendorId
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => [saved, ...prev]);
      } else {
        const err = await res.json();
        alert(`Failed to list product: ${err.error}`);
      }
    } catch (e) {
      setProducts((prev) => [newProduct, ...prev]);
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

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Vendor-ID': vendorId
        },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      } else {
        const err = await res.json();
        alert(`Failed to update product: ${err.error}`);
      }
    } catch (e) {
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
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

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'X-Vendor-ID': vendorId
        }
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        const err = await res.json();
        alert(`Failed to delete product: ${err.error}`);
      }
    } catch (e) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
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
      const res = await fetch('/api/coupons', {
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
      const res = await fetch(`/api/coupons/${code}`, {
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

  const handleAddBanner = (newBanner: Banner) => {
    setBanners(prev => {
      const updated = [newBanner, ...prev];
      localStorage.setItem('lucky_banners', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteBanner = (id: string) => {
    setBanners(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem('lucky_banners', JSON.stringify(updated));
      return updated;
    });
  };

  // Buyer view filtered products (only approved or default legacy products)
  const approvedProducts = products.filter((p) => p.approvalStatus === 'approved' || !p.approvalStatus);

  // Filtered products for Search query based only on approved ones
  const searchedProducts = approvedProducts.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const subMatch = p.subCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || catMatch || subMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" id="applet-root">
      {/* Premium Web App Container (Adapts dynamically to Mobile and Laptop/Tablet) */}
      <div className="w-full bg-white min-h-screen flex flex-col relative" id="phone-container">
        
        {/* Dynamic content rendering body */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 md:pb-10" id="applet-content-viewport">
          
          {selectedProduct ? (
            /* PRODUCT DETAILS VIEW */
            <ProductDetail
              product={selectedProduct}
              suggestedProducts={approvedProducts.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 10)}
              onSelectProduct={(id) => navigateTo('/product/' + id)}
              onBack={() => navigateTo('/' + activeTab)}
              onAddToCart={handleAddToCart}
              onDirectBuy={handleDirectBuyNow}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />
          ) : (
            <>
              {/* Render Header on most tabs */}
              {activeTab !== 'profile' && activeTab !== 'admin' && activeTab !== 'logo' && (
                <Header
                  cart={cart}
                  onOpenCart={() => navigateTo('/cart')}
                  onSearch={setSearchQuery}
                  searchQuery={searchQuery}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                  activeTab={activeTab}
                  products={approvedProducts}
                />
              )}

 
              {/* Tab Switcher */}
              {activeTab === 'home' && (
                <HomeFeed
                  products={searchedProducts}
                  banners={banners}
                  onSelectProduct={(p) => navigateTo('/product/' + p.id)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                />
              )}

 
              {activeTab === 'categories' && (
                <CategoriesView
                  onSelectCategory={setSelectedCategory}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                />
              )}

 
              {activeTab === 'orders' && (
                <OrdersView
                  orders={orders}
                  onSelectProduct={(id) => navigateTo('/product/' + id)}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                />
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 w-full" id="wishlist-page">
                  <div className="sticky top-[60px] md:top-[120px] z-[90] bg-gray-50 px-4 pt-3 pb-3 border-b border-gray-200/80 shadow-xs flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => navigateTo('/home')} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                      </button>
                      <h1 className="text-sm font-black text-gray-800 tracking-wider">MY WISHLIST</h1>
                    </div>
                    {/* Local Search for Wishlist */}
                    <div className="relative flex-1 w-full">
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

                  <div className="px-4 mt-4" id="wishlist-list-content">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-16" id="empty-wishlist-view">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold">Your wishlist is currently empty.</p>
                      <button
                        onClick={() => navigateTo('/home')}
                        className="mt-4 bg-lucky-magenta text-white font-extrabold text-xs py-2 px-6 rounded-full"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3" id="wishlist-grid">
                      {products
                        .filter((p) => wishlist.includes(p.id) && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((p) => (
                          <div
                            key={p.id}
                            onClick={() => navigateTo('/product/' + p.id)}
                            className="bg-white rounded-lg overflow-hidden border border-gray-200/60 p-2.5 relative cursor-pointer hover:shadow-xs transition-shadow"
                          >
                            <img src={p.images[0]} alt={p.title} className="w-full aspect-square object-cover rounded-md" />
                            <h3 className="text-xs font-bold text-gray-700 truncate mt-2">{p.title}</h3>
                            <p className="text-xs font-black text-gray-950 mt-1">₹{p.price}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleWishlist(p.id);
                              }}
                              className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full text-red-500 shadow-xs"
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
                <LogoView onBack={() => navigateTo('/home')} />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  onBack={() => navigateTo('/home')}
                  onOpenCart={() => navigateTo('/cart')}
                  cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                  wishlistCount={wishlist.length}
                  ordersCount={orders.length}
                  activeSubPage={activeSubPage}
                  setActiveSubPage={(sub) => navigateTo(sub ? `/profile/${sub}` : '/profile')}
                />
              )}

              {activeTab === 'cart' && (
                <CartView
                  isOpen={true}
                  onClose={() => navigateTo('/home')}
                  cart={cart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onPlaceOrder={handlePlaceOrder}
                  coupons={coupons}
                />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  products={products}
                  orders={orders}
                  coupons={coupons}
                  banners={banners}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleDeleteOrder}
                  onAddCoupon={handleAddCoupon}
                  onDeleteCoupon={handleDeleteCoupon}
                  onAddBanner={handleAddBanner}
                  onDeleteBanner={handleDeleteBanner}
                  onClose={() => navigateTo('/home')}
                  activeSubPage={activeSubPage}
                  setActiveSubPage={(sub) => navigateTo(sub ? `/admin/${sub}` : '/admin')}
                />
              )}

              {activeTab === 'vendor' && (
                <VendorDashboard
                  products={products}
                  orders={orders}
                  onAddProduct={handleVendorAddProduct}
                  onEditProduct={handleVendorEditProduct}
                  onDeleteProduct={handleVendorDeleteProduct}
                  onClose={() => navigateTo('/home')}
                  activeSubPage={activeSubPage}
                  setActiveSubPage={(sub) => navigateTo(sub ? `/vendor/${sub}` : '/vendor')}
                />
              )}
            </>
          )}
        </div>
        
        {/* Global Bottom Navigation shown except on detailed product checkout screens */}
        {!selectedProduct && activeTab !== 'admin' && activeTab !== 'vendor' && activeTab !== 'logo' && (
          <BottomNav
            activeTab={activeTab}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            onSelectTab={(tab) => {
              navigateTo('/' + tab);
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        )}
      </div>
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

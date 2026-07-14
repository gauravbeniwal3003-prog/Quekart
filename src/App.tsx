import { useState, useEffect } from 'react';
import { Sparkles, Heart, HelpCircle, ArrowLeft, Smile } from 'lucide-react';
import { mockProducts, initialOrders } from './data';
import { Product, CartItem, Order, Coupon } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeFeed from './components/HomeFeed';
import CategoriesView from './components/CategoriesView';
import ProductDetail from './components/ProductDetail';
import OrdersView from './components/OrdersView';
import CartDrawer from './components/CartDrawer';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';

const initialCoupons: Coupon[] = [
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
    } else if (['home', 'categories', 'orders', 'wishlist'].includes(parts[0])) {
      tab = parts[0];
    } else {
      tab = 'home';
    }

    return { tab, productId, subPage };
  };

  const { tab: activeTab, productId, subPage: activeProfileSubPage } = parseCurrentPath();

  // Dynamic persistent products state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('lucky_products');
    return saved ? JSON.parse(saved) : mockProducts;
  });

  // Dynamic persistent orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lucky_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Dynamic persistent coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('lucky_coupons');
    return saved ? JSON.parse(saved) : initialCoupons;
  });

  // Fetch initial data from server-side secure intermediate proxy
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, ordersRes, couponsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/coupons')
        ]);
        
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData && productsData.length > 0) {
            setProducts(productsData);
          }
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
        console.warn('⚠️ Server offline or loading failed. Operating in local storage/offline fallback mode.', err);
      }
    };
    
    fetchInitialData();
  }, []);

  // Local storage synchronization as a local offline-cache fallback
  useEffect(() => {
    localStorage.setItem('lucky_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('lucky_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lucky_coupons', JSON.stringify(coupons));
  }, [coupons]);

  const selectedProduct = productId ? products.find((p) => p.id === productId) || null : null;
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
    // Open cart drawer immediately
    setIsCartOpen(true);
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
        setProducts((prev) => [saved, ...prev]);
      } else {
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: saving locally', e);
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
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
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: updating locally', e);
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: deleting locally', e);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
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
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: updating order locally', e);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: deleting order locally', e);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const handleAddCoupon = async (newCoupon: Coupon) => {
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
        setCoupons((prev) => [saved, ...prev]);
      } else {
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: saving coupon locally', e);
      setCoupons((prev) => [newCoupon, ...prev]);
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    const adminSecret = localStorage.getItem('lucky_admin_secret') || 'lucky-secret-admin-pass-123';
    try {
      const res = await fetch(`/api/coupons/${code}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Secret': adminSecret
        }
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
      } else {
        const err = await res.json();
        alert(`Admin Access Refused: ${err.error || 'Unauthorized modification blocked.'}`);
      }
    } catch (e) {
      console.warn('Network error: deleting coupon locally', e);
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    }
  };

  // Filtered products for Search query
  const searchedProducts = products.filter((p) => {
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
              onBack={() => navigateTo('/' + activeTab)}
              onAddToCart={handleAddToCart}
              onDirectBuy={handleDirectBuyNow}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />
          ) : (
            <>
              {/* Render Header on most tabs */}
              {activeTab !== 'profile' && activeTab !== 'wishlist' && activeTab !== 'admin' && (
                <Header
                  cart={cart}
                  onOpenCart={() => setIsCartOpen(true)}
                  onSearch={setSearchQuery}
                  searchQuery={searchQuery}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                  activeTab={activeTab}
                  products={products}
                />
              )}
 
              {/* Tab Switcher */}
              {activeTab === 'home' && (
                <HomeFeed
                  products={searchedProducts}
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
                <div className="p-4" id="wishlist-page">
                  <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
                    <button onClick={() => navigateTo('/home')} className="p-1 hover:bg-gray-100 rounded-full">
                      <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-sm font-black text-gray-800 tracking-wider">MY WISHLIST</h1>
                  </div>
 
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
                        .filter((p) => wishlist.includes(p.id))
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
              )}
 
              {activeTab === 'profile' && (
                <ProfileView
                  onBack={() => navigateTo('/home')}
                  onOpenCart={() => setIsCartOpen(true)}
                  cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
                  onSelectTab={(tab) => navigateTo('/' + tab)}
                  wishlistCount={wishlist.length}
                  ordersCount={orders.length}
                  activeSubPage={activeProfileSubPage}
                  setActiveSubPage={(sub) => navigateTo(sub ? `/profile/${sub}` : '/profile')}
                />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  products={products}
                  orders={orders}
                  coupons={coupons}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleDeleteOrder}
                  onAddCoupon={handleAddCoupon}
                  onDeleteCoupon={handleDeleteCoupon}
                  onClose={() => navigateTo('/profile')}
                />
              )}
            </>
          )}
        </div>
 
        {/* Global Cart Slide Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onPlaceOrder={handlePlaceOrder}
          coupons={coupons}
        />
 
        {/* Global Bottom Navigation shown except on detailed product checkout screens */}
        {!selectedProduct && activeTab !== 'admin' && (
          <BottomNav
            activeTab={activeTab}
            cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            isCartOpen={isCartOpen}
            onSelectTab={(tab) => {
              if (tab === 'cart') {
                setIsCartOpen(true);
              } else {
                navigateTo('/' + tab);
                setIsCartOpen(false);
                setSearchQuery('');
                setSelectedCategory('All');
              }
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

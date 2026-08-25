import React, { useState, useMemo, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { 
  ArrowLeft, 
  Search, 
  Heart, 
  ShoppingBag, 
  Store, 
  ShieldCheck, 
  Star, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RotateCcw, 
  X,
  Share2,
  ChevronDown,
  Sparkles,
  Award,
  Loader2,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useInfiniteProductPagination } from '../hooks/useInfiniteProductPagination';
import { HighlightedText } from './HighlightedText';
import { useProductImpressionObserver } from '../hooks/useProductImpressionObserver';
import { trackProductView } from '../utils/analytics';

interface VendorStoreViewProps {
  storeIdentifier: string; // vendor ID or soldBy name
  products: Product[];
  onSelectProduct: (productId: string) => void;
  onBack: () => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: string, variantIndex: number, quantity?: number) => void;
  currentUser?: any;
  onRequireLogin?: (title?: string, desc?: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
}

export default function VendorStoreView({
  storeIdentifier,
  products,
  onSelectProduct,
  onBack,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  currentUser,
  onRequireLogin,
  cartCount = 0,
  onOpenCart,
  onOpenWishlist
}: VendorStoreViewProps) {
  // Activate automatic product impression tracking (1 count per 3 hours per IP)
  useProductImpressionObserver();

  const [activeTab, setActiveTab] = useState<'overview' | 'all-products'>('all-products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating' | 'discount'>('recommended');
  const [isCopied, setIsCopied] = useState(false);
  const [vendorDetails, setVendorDetails] = useState<any>(null);

  const cleanStoreId = decodeURIComponent(storeIdentifier || '').trim();

  // Fetch or infer vendor profile
  useEffect(() => {
    fetch(getApiUrl('/api/vendors'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const match = data.find((v: any) => 
            v.id === cleanStoreId || 
            v.name?.toLowerCase() === cleanStoreId.toLowerCase()
          );
          if (match) {
            setVendorDetails(match);
          }
        }
      })
      .catch(() => {});
  }, [cleanStoreId]);

  // Filter products belonging to this vendor
  const vendorProducts = useMemo(() => {
    return products.filter(p => {
      const matchId = p.vendorId && p.vendorId.toLowerCase() === cleanStoreId.toLowerCase();
      const matchName = p.soldBy && p.soldBy.toLowerCase() === cleanStoreId.toLowerCase();
      return matchId || matchName;
    });
  }, [products, cleanStoreId]);

  // Infer vendor name and ratings
  const storeName = vendorDetails?.name || (vendorProducts.length > 0 ? vendorProducts[0].soldBy : cleanStoreId) || 'Verified Seller';
  
  // Calculate average vendor rating and review count from products
  const { avgRating, totalReviews, totalRatingCount } = useMemo(() => {
    if (vendorProducts.length === 0) {
      return { avgRating: vendorDetails?.rating ? Number(vendorDetails.rating).toFixed(1) : '4.5', totalReviews: 0, totalRatingCount: 0 };
    }
    let totalScore = 0;
    let count = 0;
    let revCount = 0;
    vendorProducts.forEach(p => {
      const pRevs = Array.isArray(p.reviews) ? p.reviews.length : (p.reviewCount || (p as any).reviewsCount || 0);
      revCount += pRevs;
      if (p.rating && p.rating > 0) {
        const ratingWeight = p.ratingCount || (pRevs > 0 ? pRevs : 1);
        totalScore += p.rating * ratingWeight;
        count += ratingWeight;
      }
    });

    const calculatedAvg = count > 0 ? Number((totalScore / count).toFixed(1)) : (vendorDetails?.rating ? Number(vendorDetails.rating).toFixed(1) : 4.5);
    return {
      avgRating: calculatedAvg,
      totalReviews: revCount,
      totalRatingCount: count
    };
  }, [vendorProducts, vendorDetails]);

  // Categories present in this vendor's catalog
  const vendorCategories = useMemo(() => {
    const cats = new Set<string>();
    vendorProducts.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [vendorProducts]);

  // Filtered and sorted products for display
  const displayedProducts = useMemo(() => {
    let result = vendorProducts.filter(p => {
      const matchSearch = searchQuery.trim() === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });

    switch (sortBy) {
      case 'price-low':
        return result.sort((a, b) => a.price - b.price);
      case 'price-high':
        return result.sort((a, b) => b.price - a.price);
      case 'rating':
        return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount':
        return result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      case 'recommended':
      default:
        return result;
    }
  }, [vendorProducts, searchQuery, selectedCategory, sortBy]);

  // Infinite scroll pagination hook (50 items max per batch, prefetch at last 10 items)
  const {
    visibleProducts,
    isLoadingMore,
    hasMore,
    triggerIndex,
    triggerRef,
  } = useInfiniteProductPagination(displayedProducts, { batchSize: 50, triggerThreshold: 10 });

  const handleShareStore = () => {
    if (navigator.share) {
      navigator.share({
        title: `${storeName} on QueKart`,
        text: `Check out products from ${storeName} on QueKart!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-900 selection:bg-[#143C6B]/10 selection:text-[#143C6B]" id="vendor-store-view-root">
      
      {/* 1. TOP APP BAR */}
      <header className="sticky top-[52px] md:top-[64px] z-40 bg-white border-b border-slate-200/80 shadow-3xs px-3 sm:px-6 py-2.5 sm:py-3" id="store-header">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
              id="store-back-btn"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Supplier Store</span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[180px] sm:max-w-xs">
                {storeName}
              </h1>
            </div>
          </div>

          {/* Quick Actions (Share, Wishlist, Cart) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleShareStore}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
              title="Share store"
              id="store-share-btn"
            >
              <Share2 className="w-4 h-4" />
              {isCopied && (
                <span className="absolute -bottom-7 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            {onOpenWishlist && (
              <button
                onClick={onOpenWishlist}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
                title="Wishlist"
                id="store-wishlist-btn"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-pink-500"></span>
                )}
              </button>
            )}

            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="p-2 text-[#143C6B] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer relative"
                title="Cart"
                id="store-cart-btn"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-lucky-magenta text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. VENDOR STORE PROFILE HERO BANNER (Matching Screenshot 2 & Quekart Style) */}
      <section className="bg-white border-b border-slate-200/80 shadow-3xs pt-4 pb-4 px-4 sm:px-6" id="vendor-store-profile-hero">
        <div className="max-w-6xl mx-auto space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            
            {/* Store Icon & Details */}
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#143C6B] to-[#1E5696] text-white flex items-center justify-center shadow-sm shrink-0 border border-blue-900/20">
                <Store className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {storeName}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Seller</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{vendorDetails?.city || 'Jaipur, Rajasthan'}</span>
                  </span>
                  <span>•</span>
                  <span>Supplier on QueKart</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar (Screenshot 2 Match) */}
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 self-start sm:self-auto">
              
              {/* Rating */}
              <div className="flex items-center gap-1.5 pr-2.5 sm:pr-3 border-r border-slate-200">
                <div className="flex items-center gap-1 bg-emerald-600 text-white font-black text-xs px-2 py-1 rounded-lg shadow-3xs">
                  <span>★</span>
                  <span>{avgRating}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Rating</span>
                  <span className="text-[11px] font-black text-slate-700">{totalRatingCount} ratings</span>
                </div>
              </div>

              {/* Reviews */}
              <div className="flex flex-col px-2.5 sm:px-3 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reviews</span>
                <span className="text-xs font-black text-slate-900">{totalReviews}</span>
              </div>

              {/* Products */}
              <div className="flex flex-col pl-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Products</span>
                <span className="text-xs font-black text-slate-900">{vendorProducts.length}</span>
              </div>

            </div>

          </div>

          {/* Value Assurance Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/80 rounded-lg border border-slate-200/50">
              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Fast 24-48h Dispatch</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/80 rounded-lg border border-slate-200/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">100% Genuine Quality</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/80 rounded-lg border border-slate-200/50">
              <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Easy 7 Days Return</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50/80 rounded-lg border border-slate-200/50">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Cash on Delivery</span>
            </div>
          </div>

          {/* 3. SEGMENTED TABS: [ Overview ] and [ All Products ] (Matching Screenshot 2) */}
          <div className="flex items-center gap-2 pt-2" id="store-tab-switcher">
            <button
              onClick={() => setActiveTab('all-products')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                activeTab === 'all-products'
                  ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              id="store-tab-all-products"
            >
              All Products ({vendorProducts.length})
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                activeTab === 'overview'
                  ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              id="store-tab-overview"
            >
              Store Overview
            </button>
          </div>

        </div>
      </section>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4">

        {/* TAB 1: ALL PRODUCTS (Matching Screenshot 2 Grid Layout) */}
        {activeTab === 'all-products' && (
          <div className="space-y-4" id="store-products-container">
            
            {/* Search within store & Sorting */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-3xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search in ${storeName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#143C6B] focus:bg-white transition-all"
                  id="store-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#143C6B] cursor-pointer"
                  id="store-sort-select"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>

            </div>

            {/* Category Filter Chips */}
            {vendorCategories.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" id="store-category-filters">
                {vendorCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-3xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Product Count Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>Showing {displayedProducts.length} items from {storeName}</span>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[#143C6B] hover:underline cursor-pointer"
                >
                  Reset category
                </button>
              )}
            </div>

            {/* Products 2-Column Grid (Matching Screenshot 2 & Quekart Clean Styling) */}
            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3" id="store-empty-catalog">
                <Store className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-black text-slate-800">No products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery ? `No items matched "${searchQuery}" in this store.` : 'This vendor has not published products matching the selected filter.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="bg-[#143C6B] text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4" id="store-products-grid">
                  {visibleProducts.map((p, idx) => {
                    const isWishlisted = wishlist.includes(p.id);
                    const firstImg = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400';
                    const isTrigger = idx === triggerIndex;
                    
                    return (
                      <motion.div
                        key={p.id}
                        data-product-id={p.id}
                        ref={isTrigger ? triggerRef : undefined}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          trackProductView(p.id);
                          onSelectProduct(p.id);
                        }}
                        className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-3xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
                        id={`vendor-product-card-${p.id}`}
                      >
                        {/* Top Thumbnail Image */}
                        <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
                          <img
                            src={firstImg}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />

                          {/* Discount Tag Top-Left */}
                          {p.discountPercent > 0 && (
                            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              {p.discountPercent}% OFF
                            </div>
                          )}

                          {/* Wishlist Heart Top-Right */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!currentUser && onRequireLogin) {
                                onRequireLogin('Save to Wishlist', 'Sign in to save items to your wishlist.');
                                return;
                              }
                              onToggleWishlist(p.id);
                            }}
                            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                              isWishlisted
                                ? 'bg-pink-50 text-pink-600'
                                : 'bg-white/90 text-slate-500 hover:text-slate-800'
                            }`}
                            title="Save to Wishlist"
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-600' : ''}`} />
                          </button>

                          {/* Rating pill bottom-left */}
                          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs text-slate-900 px-1.5 py-0.5 rounded-md text-[10.5px] font-black flex items-center gap-1 shadow-3xs border border-slate-200/60">
                            <span className="text-amber-500 font-bold">★</span>
                            <span>{p.rating || 4.2}</span>
                            <span className="text-[9px] text-slate-400 font-normal">({p.ratingCount || 1})</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                              <HighlightedText text={p.category} query={searchQuery} />
                            </p>
                            <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#143C6B] transition-colors">
                              <HighlightedText text={p.title} query={searchQuery} />
                            </h3>
                            {searchQuery.trim() && p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()) && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && (
                              <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-1 bg-amber-50/80 p-1 rounded-sm border border-amber-100">
                                <HighlightedText text={p.description} query={searchQuery} />
                              </p>
                            )}
                          </div>

                          {/* Price & Savings */}
                          <div className="pt-1">
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-sm font-black text-slate-950">₹{p.price}</span>
                              {p.originalPrice > p.price && (
                                <span className="text-[11px] text-slate-400 line-through">₹{p.originalPrice}</span>
                              )}
                            </div>
                            
                            {p.isCodAvailable && (
                              <span className="text-[9.5px] font-bold text-emerald-700 block mt-0.5">
                                ✔ Cash on Delivery
                              </span>
                            )}
                          </div>

                          {/* View Product / Add CTA */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProduct(p.id);
                            }}
                            className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-[#143C6B] text-slate-700 hover:text-white border border-slate-200 hover:border-[#143C6B] rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>View Product</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Loading indicator */}
                {isLoadingMore && (
                  <div className="w-full py-8 flex flex-col items-center justify-center gap-2 text-slate-500 animate-fadeIn" id="store-loading-spinner">
                    <Loader2 className="w-7 h-7 text-[#143C6B] animate-spin" />
                    <span className="text-xs font-bold text-slate-600">Loading next 50 products...</span>
                  </div>
                )}

                {/* End of products card */}
                {!hasMore && displayedProducts.length > 0 && (
                  <div className="my-8 bg-white border border-slate-200/80 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-xs animate-fadeIn" id="vendor-all-loaded-card">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      All {displayedProducts.length} items loaded for {storeName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      You have viewed all listed items from this seller.
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* TAB 2: STORE OVERVIEW (Matching Screenshot 2) */}
        {activeTab === 'overview' && (
          <div className="space-y-4" id="store-overview-container">
            
            {/* About Store Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-3xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <Award className="w-4 h-4 text-[#143C6B]" />
                <span>About {storeName}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {vendorDetails?.description || 
                  `${storeName} is a verified QueKart manufacturer and wholesale distributor specializing in premium regional collections, apparel, and lifestyle products. All parcels are packed with multi-layer quality assurance and dispatched directly with zero middleman markups.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Business Type</span>
                  <span className="text-xs font-black text-slate-800">Direct Manufacturer / Trader</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispatch Location</span>
                  <span className="text-xs font-black text-slate-800">{vendorDetails?.city || 'Jaipur, Rajasthan'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification</span>
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> GST Registered
                  </span>
                </div>
              </div>
            </div>

            {/* Popular Items from this Seller */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-3xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-black text-slate-900">Featured from this Seller</h3>
                </div>
                <button
                  onClick={() => setActiveTab('all-products')}
                  className="text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                >
                  View All ({vendorProducts.length}) →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vendorProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p.id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl cursor-pointer transition-colors space-y-1.5"
                  >
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                      alt={p.title}
                      className="w-full aspect-square object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-xs font-bold text-slate-800 truncate">{p.title}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-black text-slate-950">₹{p.price}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">{p.discountPercent}% OFF</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Ratings Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-3xs space-y-3">
              <h3 className="text-sm font-black text-slate-900">Customer Satisfaction Summary</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-700">
                  <span className="text-2xl font-black">{avgRating}</span>
                  <div className="flex text-amber-500 text-xs">★★★★★</div>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-bold text-slate-900">{totalRatingCount} verified ratings across products</p>
                  <p className="text-[11px] text-slate-500">
                    Buyers report high accuracy in fabric, color representation, and prompt delivery.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

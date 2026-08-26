import { useState, useMemo, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, ShoppingBag, Loader2, ChevronDown, Check, Star, X, Sparkles, Filter, Zap } from 'lucide-react';
import { Product, Category } from '../types';
import { resetScrollToTop } from '../utils/scroll';
import { useInfiniteProductPagination } from '../hooks/useInfiniteProductPagination';
import { getProductPricing } from '../utils/pricing';
import { HighlightedText } from './HighlightedText';
import { useProductImpressionObserver } from '../hooks/useProductImpressionObserver';
import { trackProductView } from '../utils/analytics';
import { SmartImage } from './common/SmartImage';
import { ProductCardSkeleton, ProductGridSkeleton } from './common/Skeletons';

interface CategoryProductsViewProps {
  filterName: string;
  products: Product[];
  categories?: Category[];
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentUser: any;
  onRequireLogin: (title?: string, desc?: string) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

export default function CategoryProductsView({
  filterName,
  products,
  categories = [],
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart = () => {},
  onOpenWishlist = () => {},
  onBack,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  currentUser,
  onRequireLogin,
  searchQuery = '',
  isLoading = false
}: CategoryProductsViewProps) {
  // Activate automatic product impression tracking (1 count per 3 hours per IP)
  useProductImpressionObserver();

  useEffect(() => {
    resetScrollToTop();
  }, [filterName]);

  // Local Search State
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Sorting & Filtering States
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);

  // Sync incoming search query (if any) to local state
  useEffect(() => {
    if (searchQuery) {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery]);

  // Find parent Category object from the category tree
  const parentCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return categories.find(c => c.name.toLowerCase() === filterName.toLowerCase()) || null;
  }, [categories, filterName]);

  // 1. Filter products by Category, Attributes (Price/Rating), and local Search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Basic approval check
      const isApproved = p.approvalStatus === 'approved' || !p.approvalStatus;
      if (!isApproved) return false;

      // Category matching
      if (parentCategory) {
        const matchesParent = (p.category || '').toLowerCase() === parentCategory.name.toLowerCase();
        if (!matchesParent) return false;
      } else {
        // Fallback: match by filterName directly
        const cat = (p.category || '').toLowerCase();
        const query = filterName.toLowerCase();
        const matchesCategory = cat === query || cat.includes(query);
        if (!matchesCategory) return false;
      }

      // Attributes filter: Price
      if (maxPrice !== null && maxPrice > 0 && p.price > maxPrice) {
        return false;
      }

      // Attributes filter: Rating
      if (minRating > 0 && (p.rating || 0) < minRating) {
        return false;
      }

      // Local search query filter
      if (localSearchQuery.trim()) {
        const sQuery = localSearchQuery.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(sQuery);
        const descMatch = (p.description || '').toLowerCase().includes(sQuery);
        const brandMatch = (p.soldBy || '').toLowerCase().includes(sQuery);
        if (!titleMatch && !descMatch && !brandMatch) {
          return false;
        }
      }

      return true;
    });
  }, [products, parentCategory, filterName, maxPrice, minRating, localSearchQuery]);

  // 2. Sort filtered products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    // Default / Popularity (Sponsored items first, then newer or highest rating)
    return list.sort((a, b) => {
      const aSponsor = a.sponsoredUntil && new Date(a.sponsoredUntil) > new Date() ? 1 : 0;
      const bSponsor = b.sponsoredUntil && new Date(b.sponsoredUntil) > new Date() ? 1 : 0;
      if (bSponsor !== aSponsor) {
        return bSponsor - aSponsor;
      }
      return b.rating - a.rating;
    });
  }, [filteredProducts, sortBy]);

  // Infinite scroll pagination hook (50 items max per batch, prefetch at last 10 items)
  const {
    visibleProducts,
    isLoadingMore,
    hasMore,
    triggerIndex,
    triggerRef,
  } = useInfiniteProductPagination(sortedProducts, { batchSize: 50, triggerThreshold: 10 });

  const handleWishlistToggle = (productId: string, e: MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onRequireLogin(
        'Wishlist Required',
        'Add items to your personal wishlist to save them for later.'
      );
      return;
    }
    onToggleWishlist(productId);
  };

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full" id="category-products-page">
      {/* 1. Header Row (Sticky) */}
      <div className="sticky top-[0px] z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-3xs" id="category-page-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer"
              aria-label="Go back"
              id="category-back-button"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight font-display capitalize" id="category-page-title">
                {parentCategory ? parentCategory.name : filterName}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold" id="category-product-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWishlist}
              className="p-2 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer relative"
              aria-label="View Wishlist"
              id="category-wishlist-header-btn"
            >
              <Heart className="w-5 h-5 text-slate-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-3xs animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenCart}
              className="p-2 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer relative"
              aria-label="View Cart"
              id="category-cart-header-btn"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#143C6B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-3xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pink/Rose search container matching the screenshot */}
      <div className="bg-[#FFF1F2] px-4 py-3 border-b border-[#FFE4E6]" id="category-search-container">
        <div className="max-w-7xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder={`Search in ${parentCategory ? parentCategory.name : filterName}...`}
              className="w-full bg-white text-slate-800 text-xs px-4 py-2.5 rounded-lg border border-[#FCA5A5]/30 focus:outline-hidden focus:ring-2 focus:ring-[#143C6B]/20 focus:border-[#143C6B] placeholder-gray-400 font-semibold"
              id="category-search-input"
            />
            {localSearchQuery && (
              <button
                onClick={() => setLocalSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white px-4 rounded-lg flex items-center justify-center transition-colors shadow-xs active:scale-95 cursor-pointer"
            id="category-search-submit-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. Sorting & Filter Controls Row */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between" id="category-quick-filters">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {/* Price Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setShowBudgetDropdown(!showBudgetDropdown);
                  setShowSortDropdown(false);
                  setShowRatingDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                  maxPrice !== null ? 'border-[#143C6B] text-[#143C6B] bg-blue-50 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                id="category-budget-btn"
              >
                <span>{maxPrice ? `≤ ₹${maxPrice}` : 'Budget'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showBudgetDropdown && (
                <div className="absolute left-0 mt-1.5 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1" id="category-budget-dropdown">
                  {[
                    { label: 'Any Price', value: null },
                    { label: 'Under ₹299', value: 299 },
                    { label: 'Under ₹499', value: 499 },
                    { label: 'Under ₹999', value: 999 },
                    { label: 'Under ₹1,999', value: 1999 },
                    { label: 'Under ₹4,999', value: 4999 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => { setMaxPrice(opt.value); setShowBudgetDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                        maxPrice === opt.value ? 'text-[#143C6B] font-bold bg-blue-50/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {maxPrice === opt.value && <Check className="w-3.5 h-3.5 text-[#143C6B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => {
                  setShowRatingDropdown(!showRatingDropdown);
                  setShowSortDropdown(false);
                  setShowBudgetDropdown(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                  minRating > 0 ? 'border-amber-500 text-amber-700 bg-amber-50 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                id="category-rating-btn"
              >
                <Star className={`w-3 h-3 ${minRating > 0 ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                <span>{minRating > 0 ? `${minRating}★+` : 'Rating'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showRatingDropdown && (
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1" id="category-rating-dropdown">
                  {[
                    { label: 'All Ratings', value: 0 },
                    { label: '4.5★ & above', value: 4.5 },
                    { label: '4.0★ & above', value: 4.0 },
                    { label: '3.5★ & above', value: 3.5 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => { setMinRating(opt.value); setShowRatingDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 text-xs hover:bg-amber-50 cursor-pointer flex items-center justify-between ${
                        minRating === opt.value ? 'text-amber-800 font-bold bg-amber-50/60' : 'text-gray-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {minRating === opt.value && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sort trigger */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowBudgetDropdown(false);
                setShowRatingDropdown(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
              id="category-sort-trigger"
            >
              <Filter className="w-3 h-3" />
              <span className="capitalize">
                {sortBy === 'popular' ? 'Popular' : sortBy === 'price-low' ? 'Price: L-H' : sortBy === 'price-high' ? 'Price: H-L' : 'Rating'}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50 animate-fadeIn" id="category-sort-options">
                {[
                  { value: 'popular', label: 'Popularity' },
                  { value: 'price-low', label: 'Price: Low-High' },
                  { value: 'price-high', label: 'Price: High-Low' },
                  { value: 'rating', label: 'Top Rated' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 block transition-colors ${
                      sortBy === opt.value ? 'text-[#143C6B] bg-blue-50/50 font-bold' : 'text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Active Filter Indicator Badges */}
      {(maxPrice !== null || minRating > 0 || localSearchQuery) && (
        <div className="bg-[#F1F5F9]/50 border-b border-slate-100 px-4 py-2 flex flex-wrap gap-2 items-center text-xs">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Filters:</span>
          {maxPrice !== null && (
            <span className="inline-flex items-center gap-1 bg-[#143C6B]/10 text-[#143C6B] px-2 py-0.5 rounded-md text-[11px] font-bold">
              <span>≤ ₹{maxPrice}</span>
              <button onClick={() => setMaxPrice(null)} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-950 px-2 py-0.5 rounded-md text-[11px] font-bold">
              <span>★ {minRating}+</span>
              <button onClick={() => setMinRating(0)} className="text-amber-500 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {localSearchQuery && (
            <span className="inline-flex items-center gap-1 bg-[#FFF1F2] text-[#F43F5E] border border-[#FECDD3] px-2 py-0.5 rounded-md text-[11px] font-bold">
              <span>"{localSearchQuery}"</span>
              <button onClick={() => setLocalSearchQuery('')} className="hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => { setMaxPrice(null); setMinRating(0); setLocalSearchQuery(''); }}
            className="text-[10px] font-black text-red-500 hover:underline cursor-pointer ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 6. Main Listing View Grid */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto max-w-7xl mx-auto w-full" id="category-products-container">
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto" id="category-empty-state">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-[#143C6B] mb-4 shadow-3xs">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="text-sm font-black text-slate-800 tracking-tight font-display">No Products Found</h2>
            <p className="text-xs text-gray-400 mt-1.5 font-semibold leading-relaxed">
              We couldn't find any items matching your active filter criteria inside "{parentCategory ? parentCategory.name : filterName}".
            </p>
            <button
              onClick={() => { setMaxPrice(null); setMinRating(0); setLocalSearchQuery(''); }}
              className="mt-6 px-6 py-2.5 bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-black rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer uppercase tracking-wider"
              id="category-empty-back-btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 2-Column Responsive Layout strictly like the screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5" id="category-products-grid">
              {visibleProducts.map((product, idx) => {
                const isWishlisted = wishlist.includes(product.id);
                const isTrigger = idx === triggerIndex;
                return (
                  <motion.div
                    key={product.id}
                    data-product-id={product.id}
                    ref={isTrigger ? triggerRef : undefined}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.22, delay: Math.min(idx * 0.015, 0.15) }}
                    onClick={() => {
                      trackProductView(product.id);
                      onSelectProduct(product.id);
                    }}
                    className="bg-white border border-slate-100/90 rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group relative shadow-3xs"
                    id={`category-product-card-${product.id}`}
                  >
                    {/* Portrait Image frame aspect-[3/4] strictly like Meesho/Myntra style */}
                    <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <SmartImage
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=350'}
                        alt={product.title}
                        aspectRatioClassName="aspect-[3/4]"
                        containerClassName="w-full h-full"
                      />

                      {/* Floating Wishlist Button strictly overlayed on top right */}
                      <button
                        onClick={(e) => handleWishlistToggle(product.id, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 bg-white active:scale-90 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer z-10 hover:shadow-md border border-slate-50"
                        aria-label="Toggle Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            isWishlisted ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-400'
                          }`}
                        />
                      </button>

                      {/* Left Side Badge Overlay for high-discount items */}
                      {product.sponsoredUntil && new Date(product.sponsoredUntil) > new Date() && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="bg-[#143C6B] text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-sm border border-white/10 uppercase tracking-wide shadow-3xs">
                            Sponsored
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details Block matching screenshot labels, ratings, discounts & price pairing */}
                    <div className="p-3 flex-1 flex flex-col justify-between bg-white">
                      <div className="space-y-1.5">
                        {/* Title */}
                        <h3 className="text-[12px] font-semibold text-slate-800 line-clamp-1 leading-snug tracking-tight truncate break-words overflow-hidden" title={product.title}>
                          <HighlightedText text={product.title} query={localSearchQuery} />
                        </h3>

                        {/* Rating and Discount Badges */}
                        <div className="flex items-center gap-1.5">
                          {/* Star Rating Badge */}
                          <span className="bg-amber-50 text-amber-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded-sm border border-amber-200/55 flex items-center gap-0.5">
                            ★ {product.rating || '4.0'}
                          </span>

                          {/* Green Discount Badge */}
                          {product.discountPercent > 0 && (
                            <span className="bg-[#E6FDF5] text-[#03a685] font-black text-[10px] px-1.5 py-0.5 rounded-sm border border-[#03a685]/15">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {(() => {
                          const pricing = getProductPricing(product);
                          return (
                            <>
                              {/* Price Display Block: Original and Effective Final */}
                              <div className="flex items-baseline justify-between pt-1">
                                <span className="text-[11px] text-gray-400 line-through font-semibold">
                                  ₹{pricing.originalPrice}
                                </span>
                                <span className="text-sm font-black text-[#143C6B] premium-rupee">
                                  ₹{pricing.effectivePrice}
                                </span>
                              </div>

                              {/* Dual COD & UPI representation */}
                              <div className="mt-1 space-y-0.5 border-t border-slate-50 pt-1">
                                {pricing.hasUpiOffer && (
                                  <div className="text-[10px] font-extrabold text-[#143C6B] flex items-center justify-between">
                                    <span className="flex items-center gap-0.5">
                                      <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-600" />
                                      ₹{pricing.upiPrice} with UPI
                                    </span>
                                  </div>
                                )}
                                {pricing.isCodAvailable ? (
                                  <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                                    <span className="text-emerald-600 text-[9px] font-bold">✔</span>
                                    <span>₹{pricing.codPrice} with COD</span>
                                  </div>
                                ) : (
                                  <div className="text-[9.5px] text-indigo-700 font-bold">
                                    Online Payment Only
                                  </div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Fast scroll loader */}
            {isLoadingMore && (
              <div className="py-4" id="category-loading-skeletons">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <ProductCardSkeleton key={`cat-inf-skel-${idx}`} />
                  ))}
                </div>
              </div>
            )}

            {/* End of results card */}
            {!hasMore && sortedProducts.length > 0 && (
              <div className="my-8 bg-white border border-slate-100 rounded-xl p-5 text-center max-w-md mx-auto shadow-3xs animate-fadeIn" id="category-all-loaded-card">
                <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xs font-black text-slate-800 tracking-tight">
                  You've viewed all {sortedProducts.length} items
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                  Looks like you've reached the end of this collection.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

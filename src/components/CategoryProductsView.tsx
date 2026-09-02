import { useState, useMemo, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, ShoppingBag, Loader2, ChevronDown, Check, Star, X, Sparkles, Filter, Zap, Search } from 'lucide-react';
import { Product, Category, SubCategory } from '../types';
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
  subCategoryFilter?: string;
  products: Product[];
  categories?: Category[];
  subCategories?: SubCategory[];
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onSelectSubCategory?: (subCat: string | null) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentUser: any;
  onRequireLogin: (title?: string, desc?: string) => void;
  searchQuery?: string;
  isLoading?: boolean;
}

export default function CategoryProductsView({
  filterName,
  subCategoryFilter,
  products,
  categories = [],
  subCategories = [],
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart = () => {},
  onOpenWishlist = () => {},
  onBack,
  onSelectProduct,
  onSelectSubCategory,
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
  }, [filterName, subCategoryFilter]);

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

  // Get relevant subcategories for the chips row
  const siblingSubCategories = useMemo(() => {
    if (!parentCategory) return [];
    return subCategories.filter(sc => sc.categoryId === parentCategory.id || (sc.categoryName && sc.categoryName.toLowerCase() === parentCategory.name.toLowerCase()));
  }, [subCategories, parentCategory]);

  // 1. Filter products by Category, SubCategory, Attributes (Price/Rating), and local Search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Basic approval check
      const isApproved = p.approvalStatus === 'approved' || !p.approvalStatus;
      if (!isApproved) return false;

      // Sub-category matching if subCategoryFilter is present
      if (subCategoryFilter) {
        const matchesSub = (p.subCategory || '').toLowerCase() === subCategoryFilter.toLowerCase() ||
                           (p.subCategory || '').toLowerCase().includes(subCategoryFilter.toLowerCase()) ||
                           (p.title || '').toLowerCase().includes(subCategoryFilter.toLowerCase());
        if (!matchesSub) return false;
      } else if (parentCategory) {
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
  }, [products, parentCategory, filterName, maxPrice, minRating, localSearchQuery, subCategoryFilter]);

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
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm flex items-center justify-between" id="category-page-header">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer"
          aria-label="Go back"
          id="category-back-button"
        >
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        
        <h1 className="text-lg font-normal text-slate-800 tracking-tight font-display capitalize absolute left-1/2 -translate-x-1/2" id="category-page-title">
          {subCategoryFilter || (parentCategory ? parentCategory.name : filterName)}
        </h1>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={onOpenWishlist}
            className="p-2 hover:bg-slate-100 active:scale-95 rounded-full transition-all cursor-pointer relative"
            aria-label="View Wishlist"
            id="category-wishlist-header-btn"
          >
            <Heart className="w-6 h-6 text-[#143C6B]" />
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
            <ShoppingBag className="w-6 h-6 text-[#143C6B]" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#143C6B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-3xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Search container matching Home Page */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 shadow-3xs" id="category-search-container">
        <div className="max-w-2xl mx-auto flex items-center w-full relative">
          <div className="absolute left-3.5 text-gray-400 pointer-events-none">
            <Search className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
          </div>
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full pl-10 md:pl-11 pr-10 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs md:text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-[#143C6B] focus:bg-white transition-colors duration-150 shadow-inner"
            id="category-search-input"
            autoComplete="off"
          />
          {localSearchQuery && (
            <button
              onClick={() => setLocalSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Sub-Category Chips (Horizontal Scroll) */}
      {siblingSubCategories.length > 0 && (
        <div className="bg-white border-b border-slate-100 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
            <button
              onClick={() => onSelectSubCategory?.(null)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border shadow-sm ${
                !subCategoryFilter ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100'
              }`}
            >
              All Products
            </button>
            {siblingSubCategories.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onSelectSubCategory?.(sc.name)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border shadow-sm ${
                  subCategoryFilter === sc.name ? 'bg-[#143C6B] text-white border-[#143C6B]' : 'bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100'
                }`}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Listing View Grid */}
      <div className="flex-1 p-2 md:p-4 overflow-y-auto max-w-7xl mx-auto w-full" id="category-products-container">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2" id="category-products-grid">
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
                    className="bg-white border-0 rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group relative shadow-sm m-1"
                    id={`category-product-card-${product.id}`}
                  >
                    {/* Portrait Image frame aspect-[3/4] strictly like Meesho/Myntra style */}
                    <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <SmartImage
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=350'}
                        alt={product.title}
                        aspectRatioClassName="aspect-[4/5]"
                        containerClassName="w-full h-full"
                        targetWidth={400}
                        loading={idx < 6 ? 'eager' : 'lazy'}
                        fetchPriority={idx < 4 ? 'high' : 'auto'}
                      />

                      {/* Floating Wishlist Button strictly overlayed on top right */}
                      <button
                        onClick={(e) => handleWishlistToggle(product.id, e)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm active:scale-90 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer z-10 hover:shadow-md border border-slate-50"
                        aria-label="Toggle Wishlist"
                      >
                        <Heart
                          className={`w-4 h-4 transition-all ${
                            isWishlisted ? 'text-[#143C6B] fill-[#143C6B] scale-110' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Details Block matching screenshot labels, ratings, discounts & price pairing */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between bg-white">
                      <div className="space-y-1.5">
                        {/* Title */}
                        <h3 className="text-[13px] font-semibold text-slate-800 line-clamp-1 leading-snug tracking-tight truncate break-words overflow-hidden" title={product.title}>
                          <HighlightedText text={product.title} query={localSearchQuery} />
                        </h3>

                        {/* Rating and Discount Badges */}
                        <div className="flex items-center justify-between">
                          <span className="bg-amber-50 text-amber-600 font-extrabold text-[10px] px-1.5 py-0.5 rounded-sm border border-amber-200/55 flex items-center gap-0.5">
                            ★ {product.rating || '4.0'}
                          </span>
                          {product.discountPercent > 0 && (
                            <span className="bg-[#2e7d32] text-white font-bold text-[10px] px-2 py-0.5 rounded border border-[#2e7d32]">
                              {product.discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {(() => {
                          const pricing = getProductPricing(product);
                          return (
                            <>
                              {/* Price Display Block: Original and Effective Final */}
                              <div className="flex items-baseline gap-1.5 pt-0.5">
                                <span className="text-[11px] text-gray-400 line-through font-semibold">
                                  ₹{pricing.originalPrice}
                                </span>
                                <span className="text-sm font-black text-[#143C6B] premium-rupee">
                                  ₹{pricing.effectivePrice}
                                </span>
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

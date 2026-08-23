import { useState, useMemo, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, SlidersHorizontal, ShoppingBag, Heart, CheckCircle2, ChevronDown } from 'lucide-react';
import { Product } from '../types';

interface CategoryProductsViewProps {
  filterName: string;
  products: Product[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentUser: any;
  onRequireLogin: (title?: string, desc?: string) => void;
}

export default function CategoryProductsView({
  filterName,
  products,
  onBack,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  currentUser,
  onRequireLogin
}: CategoryProductsViewProps) {
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter products by category/subCategory
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const isApproved = p.approvalStatus === 'approved' || !p.approvalStatus;
      if (!isApproved) return false;
      
      const cat = (p.category || '').toLowerCase();
      const sub = (p.subCategory || '').toLowerCase();
      const query = filterName.toLowerCase();
      
      // Strict exact match first
      if (cat === query || sub === query) return true;
      // Substring fallback
      return cat.includes(query) || sub.includes(query);
    });
  }, [products, filterName]);

  // Sort products
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
    // Default/Popular
    return list.sort((a, b) => {
      const aSponsor = a.sponsoredUntil && new Date(a.sponsoredUntil) > new Date() ? 1 : 0;
      const bSponsor = b.sponsoredUntil && new Date(b.sponsoredUntil) > new Date() ? 1 : 0;
      return bSponsor - aSponsor; // Sponsored items first
    });
  }, [filteredProducts, sortBy]);

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
    <div className="flex flex-col bg-gray-50 min-h-full" id="category-products-page">
      {/* Sticky Header Row */}
      <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3 shadow-3xs" id="category-page-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Go back"
              id="category-back-button"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-black text-slate-800 tracking-tight" id="category-page-title">
                {filterName}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold" id="category-product-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
              </p>
            </div>
          </div>

          {/* Sorting Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200/60 rounded-lg text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              id="category-sort-dropdown-trigger"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="capitalize">
                {sortBy === 'popular' ? 'Popularity' : sortBy === 'price-low' ? 'Price: L-H' : sortBy === 'price-high' ? 'Price: H-L' : 'Top Rated'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-fadeIn" id="category-sort-options">
                {[
                  { value: 'popular', label: 'Popularity' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Customer Rating' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-blue-50/50 block transition-colors ${
                      sortBy === opt.value ? 'text-lucky-magenta bg-blue-50/40 font-black' : 'text-gray-600'
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

      {/* Main Listing View Body */}
      <div className="flex-1 p-4 overflow-y-auto max-w-7xl mx-auto w-full" id="category-products-container">
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto" id="category-empty-state">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-lucky-magenta mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-sm font-black text-gray-800 tracking-tight">No Products Available</h2>
            <p className="text-xs text-gray-400 mt-1 font-semibold">
              Currently there are no products listed under "{filterName}". Please check back later or check other collections.
            </p>
            <button
              onClick={onBack}
              className="mt-5 px-6 py-2.5 bg-[#143C6B] hover:bg-[#0c2340] active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer uppercase tracking-wider"
              id="category-empty-back-btn"
            >
              Back to Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4" id="category-products-grid">
            {sortedProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-white border border-gray-100/80 rounded-xl overflow-hidden hover:shadow-md active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between group h-full relative"
                  id={`category-product-card-${product.id}`}
                >
                  {/* Image container */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex-shrink-0">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Wishlist Button Overlay */}
                    <button
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/95 active:scale-90 hover:bg-white border border-gray-100/60 rounded-full flex items-center justify-center shadow-xs transition-all cursor-pointer z-10"
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition-all ${
                          isWishlisted ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-400'
                        }`}
                      />
                    </button>

                    {/* Badge Row on top left */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                      {product.discountPercent >= 40 && (
                        <span className="bg-lucky-magenta text-white font-black text-[9px] px-1.5 py-0.2 rounded-sm border border-lucky-magenta/25 uppercase tracking-wide">
                          🔥 {product.discountPercent}% OFF
                        </span>
                      )}
                      {product.sponsoredUntil && new Date(product.sponsoredUntil) > new Date() && (
                        <span className="bg-amber-50 text-amber-700 font-black text-[9px] px-1.5 py-0.2 rounded-sm border border-amber-200/55 uppercase tracking-wide">
                          ⭐ Sponsored
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Card Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Title */}
                      <h3 className="text-xs font-medium text-gray-500 line-clamp-1 leading-tight tracking-tight mb-1 break-words overflow-hidden" title={product.title}>
                        {product.title}
                      </h3>

                      {/* Vendor Name */}
                      <div className="text-[10px] font-extrabold text-[#C49B48] mb-1.5 flex items-center gap-1 truncate">
                        <span>🏪</span>
                        <span className="truncate">{product.soldBy || 'Jaipur Wholesale'}</span>
                      </div>

                      {/* Price Grid */}
                      <div className="flex items-baseline gap-1.5 flex-wrap overflow-hidden">
                        <span className="text-[16px] font-black text-slate-900 premium-rupee">
                          ₹{product.price}
                        </span>
                        <span className="text-xs text-gray-400 line-through font-medium">
                          ₹{product.originalPrice}
                        </span>
                        <span className="text-xs text-lucky-green font-extrabold tracking-tight">
                          {product.discountPercent}% off
                        </span>
                      </div>

                      {/* COD Info */}
                      <div className="text-[11px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                        <span className="text-emerald-600 text-[10px]">✔</span>
                        <span>₹{product.codPrice} with COD</span>
                      </div>
                    </div>

                    {/* Bottom Stats & Ratings */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-3xs">
                          {product.rating} <span className="text-[9px]">★</span>
                        </span>
                      </div>

                      {product.tag && (
                        <span className="text-[9px] badge-gradient-magenta font-extrabold px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-lucky-magenta" />
                          {product.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

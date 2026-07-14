import { useState, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, SlidersHorizontal, Heart, Sparkles, CheckCircle2, Loader2, Search, ShoppingBag, Tag } from 'lucide-react';
import { Product } from '../types';

interface HomeFeedProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery?: string;
}

export default function HomeFeed({
  products,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  selectedCategory,
  onSelectCategory,
  searchQuery = ''
}: HomeFeedProps) {
  // State for sorting & filtering
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Smart AI Search Recommendation states
  const [smartSearchLoading, setSmartSearchLoading] = useState(false);
  const [smartResult, setSmartResult] = useState<{
    recommendationsText: string;
    onlineFallbackItems: any[];
    alternativeSuggestions: string[];
  } | null>(null);

  // Countdown clock simulation for the flash deals (as seen in Lucky screenshots)
  const [timerText, setTimerText] = useState('01h : 25m : 26s');

  // Apply filters and sort (hoisted above useEffects to prevent temporal dead zone)
  // Shoppers should only see verified/approved items
  let filteredProducts = products.filter(
    (p) => !p.approvalStatus || p.approvalStatus === 'approved'
  );

  // 1. Category Filter
  if (selectedCategory !== 'All') {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === selectedCategory || p.subCategory === selectedCategory
    );
  }

  // 2. Gender Filter
  if (selectedGender !== 'All') {
    if (selectedGender === 'Men') {
      filteredProducts = filteredProducts.filter((p) => p.category === 'Men');
    } else if (selectedGender === 'Women') {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === 'Kurti, Saree & Lehenga' || p.category === 'Women Western' || p.category === 'Lingerie'
      );
    } else if (selectedGender === 'Kids') {
      filteredProducts = filteredProducts.filter((p) => p.category === 'Kids & Toys');
    }
  }

  // 3. Sorting
  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'discount') {
    filteredProducts.sort((a, b) => b.discountPercent - a.discountPercent);
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(23 - now.getHours()).padStart(2, '0');
      const minutes = String(59 - now.getMinutes()).padStart(2, '0');
      const seconds = String(59 - now.getSeconds()).padStart(2, '0');
      setTimerText(`${hours}h : ${minutes}m : ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch smart search results when local filtered products is 0 and search query exists
  useEffect(() => {
    if (searchQuery && filteredProducts.length === 0) {
      setSmartSearchLoading(true);
      setSmartResult(null);

      const delayDebounce = setTimeout(() => {
        fetch('/api/smart-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        })
          .then((res) => {
            if (!res.ok) throw new Error('API request failed');
            return res.json();
          })
          .then((data) => {
            if (data && data.recommendationsText) {
              setSmartResult(data);
            } else {
              setSmartResult(null);
            }
            setSmartSearchLoading(false);
          })
          .catch((err) => {
            console.error('Failed to load smart search results:', err);
            setSmartSearchLoading(false);
          });
      }, 500);

      return () => clearTimeout(delayDebounce);
    } else {
      setSmartResult(null);
      setSmartSearchLoading(false);
    }
  }, [searchQuery, filteredProducts.length]);

  // Category circles data matching Screenshot 4
  const categoryBubbles = [
    { label: 'All Categories', value: 'All', bg: 'bg-blue-100', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150' },
    { label: 'Kurtis & Dress', value: 'Kurti, Saree & Lehenga', bg: 'bg-pink-100', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150' },
    { label: 'Kids', value: 'Kids & Toys', bg: 'bg-yellow-100', img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=150' },
    { label: 'Home', value: 'Home & Kitchen', bg: 'bg-orange-100', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=150' },
    { label: 'Saree', value: 'Kurti, Saree & Lehenga', bg: 'bg-purple-100', img: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=150' },
    { label: 'Western Wear', value: 'Women Western', bg: 'bg-green-100', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=150' },
  ];

  return (
    <div className="pb-20 max-w-7xl mx-auto w-full px-0 md:px-4" id="home-feed-container">
      {/* Horizontal Categories Slider */}
      <div className="bg-white py-4 border-b border-gray-100 overflow-x-auto scrollbar-hide flex items-center gap-4 px-4 shadow-2xs" id="category-bubbles-slider">
        {categoryBubbles.map((item, index) => {
          const isActive = selectedCategory === item.value;
          return (
            <button
              key={index}
              onClick={() => onSelectCategory(item.value)}
              className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
              id={`bubble-${index}`}
            >
              <div className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative transition-all border-2 ${
                isActive ? 'border-lucky-magenta scale-105 shadow-md' : 'border-gray-100 group-hover:border-pink-300'
              } ${item.bg}`}>
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className={`text-[10px] mt-1 text-center font-medium max-w-[70px] truncate tracking-tight text-gray-700 ${
                isActive ? 'text-lucky-magenta font-bold' : ''
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sorting / Filter Bar */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between gap-1 relative z-20" id="filters-bar">
        {/* Sort Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowGenderDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
              sortBy !== 'popular' ? 'border-lucky-magenta text-lucky-magenta bg-pink-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            id="sort-btn"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSortDropdown && (
            <div className="absolute left-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1" id="sort-dropdown">
              <button
                onClick={() => { setSortBy('popular'); setShowSortDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${sortBy === 'popular' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
              >
                Relevance / Popular
              </button>
              <button
                onClick={() => { setSortBy('price-asc'); setShowSortDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${sortBy === 'price-asc' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => { setSortBy('price-desc'); setShowSortDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${sortBy === 'price-desc' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => { setSortBy('discount'); setShowSortDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${sortBy === 'discount' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
              >
                Highest Discount
              </button>
              <button
                onClick={() => { setSortBy('rating'); setShowSortDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${sortBy === 'rating' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
              >
                Customer Rating
              </button>
            </div>
          )}
        </div>

        {/* Gender Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowGenderDropdown(!showGenderDropdown);
              setShowSortDropdown(false);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
              selectedGender !== 'All' ? 'border-lucky-magenta text-lucky-magenta bg-pink-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            id="gender-filter-btn"
          >
            <span>Gender: {selectedGender}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showGenderDropdown && (
            <div className="absolute left-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1" id="gender-dropdown">
              {['All', 'Men', 'Women', 'Kids'].map((g) => (
                <button
                  key={g}
                  onClick={() => { setSelectedGender(g); setShowGenderDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-pink-50 cursor-pointer ${selectedGender === g ? 'text-lucky-magenta font-semibold bg-pink-50/50' : 'text-gray-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Clear Filter if active */}
        {(selectedCategory !== 'All' || selectedGender !== 'All') && (
          <button
            onClick={() => {
              onSelectCategory('All');
              setSelectedGender('All');
            }}
            className="text-[10px] text-pink-600 font-bold hover:underline cursor-pointer"
            id="clear-filters-btn"
          >
            Clear All
          </button>
        )}

        {/* Static Filters Button to mimic UI */}
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer" id="filters-sidebar-btn">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* active filters info */}
      {(selectedCategory !== 'All' || selectedGender !== 'All') && (
        <div className="bg-pink-50/40 px-4 py-1.5 text-[11px] text-gray-500 font-medium flex items-center gap-2 border-b border-gray-100" id="active-filters-info">
          <span>Active filter:</span>
          {selectedCategory !== 'All' && <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded-sm">{selectedCategory}</span>}
          {selectedGender !== 'All' && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm">Gender: {selectedGender}</span>}
        </div>
      )}

      {/* Grid view of Products */}
      {filteredProducts.length === 0 ? (
        <div className="w-full px-4 py-8 animate-fadeIn" id="empty-feed">
          {smartSearchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-xl shadow-xs max-w-2xl mx-auto">
              <Loader2 className="w-10 h-10 text-lucky-magenta animate-spin mb-4" />
              <p className="text-gray-700 font-bold text-sm">Consulting QueKart Smart AI Assistant...</p>
              <p className="text-xs text-gray-400 mt-1">Finding the best online recommendations and alternatives for you.</p>
            </div>
          ) : smartResult ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* AI Recommendation Message Card */}
              <div className="bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-pink-50/20 border border-pink-100 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/30 rounded-full blur-2xl -z-10"></div>
                <div className="absolute bottom-0 left-10 w-24 h-24 bg-purple-100/30 rounded-full blur-xl -z-10"></div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 border border-pink-200">
                    <Sparkles className="w-5 h-5 text-lucky-magenta animate-pulse" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-lucky-magenta bg-pink-50 px-2 py-0.5 rounded-sm border border-pink-100">
                        QueKart AI Assistant
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Smart Shopping Guidance</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-semibold">
                      {smartResult.recommendationsText}
                    </p>
                  </div>
                </div>

                {/* Alternative Suggestions tags */}
                {smartResult.alternativeSuggestions && smartResult.alternativeSuggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Try Searching:
                    </span>
                    {smartResult.alternativeSuggestions.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          const searchInput = document.getElementById('search-input') as HTMLInputElement;
                          if (searchInput) {
                            searchInput.value = term;
                            const event = new Event('input', { bubbles: true });
                            searchInput.dispatchEvent(event);
                          }
                          onSelectCategory('All');
                        }}
                        className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-150 text-gray-600 hover:text-lucky-magenta hover:border-pink-200 hover:bg-pink-50/50 cursor-pointer transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Online Recommended Items Catalog */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <h3 className="text-sm font-black uppercase tracking-tight text-gray-800">
                      Popular Recommended Matches Online
                    </h3>
                  </div>
                  <span className="text-[10px] bg-green-50 text-green-700 border border-green-100 font-bold px-2 py-0.5 rounded-sm">
                    In Stock & Shoppable
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4" id="recommended-online-grid">
                  {smartResult.onlineFallbackItems.map((item) => {
                    // Create standard Product wrapper for details page redirection
                    const mappedProduct: Product = {
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      category: item.category,
                      subCategory: item.subCategory,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      discountPercent: item.discountPercent,
                      codPrice: item.price,
                      rating: item.rating,
                      ratingCount: item.ratingCount,
                      reviewCount: Math.round(item.ratingCount / 10),
                      images: [item.image],
                      variants: [
                        {
                          colorName: "Standard",
                          imageUrl: item.image,
                          price: item.price,
                          originalPrice: item.originalPrice
                        }
                      ],
                      soldBy: "QueKart Verified Smart Partner",
                      soldByRating: 4.8,
                      productHighlights: [
                        { label: "Delivery", value: "Free & Fast Shipping" },
                        { label: "Warranty", value: "1 Year Brand Warranty" },
                        { label: "Payment", value: "Cash on Delivery Available" }
                      ],
                      additionalDetails: [
                        { label: "Type", value: "Smart Curated Online Recommendation" },
                        { label: "Origin", value: "Imported" }
                      ],
                      sizeOptions: ["Free Size"],
                      timeLeftText: "Limited Stock",
                      reviews: [
                        {
                          id: "rev1",
                          userName: "Amit Kumar",
                          rating: 5,
                          title: "Highly Satisfied",
                          comment: "Bought this based on QueKart recommendations. Exceptional quality and fast shipping!",
                          postedDate: "2 days ago",
                          helpfulCount: 12,
                          images: []
                        }
                      ]
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={() => onSelectProduct(mappedProduct)}
                        className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-pink-200 transition-all cursor-pointer flex flex-col relative group"
                        id={`online-item-${item.id}`}
                      >
                        <div className="absolute top-2 left-2 z-10 bg-lucky-magenta/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-xs tracking-wider shadow-xs">
                          AI Match
                        </div>
                        <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate block">
                            {item.category} • {item.subCategory}
                          </span>
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-lucky-magenta transition-colors break-words">
                            {item.title}
                          </h4>
                          
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-gray-950">₹{item.price}</span>
                            <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice}</span>
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1 rounded-sm">{item.discountPercent}% OFF</span>
                          </div>

                          <div className="mt-1.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
                            <span className="flex items-center gap-0.5 bg-yellow-50 px-1 py-0.5 rounded text-amber-700 font-bold">
                              ★ {item.rating}
                            </span>
                            <span>{item.ratingCount} Ratings</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-100 rounded-xl shadow-xs max-w-md mx-auto" id="fallback-empty-card">
              <Sparkles className="w-12 h-12 text-pink-300 mb-3 animate-spin" />
              <p className="text-gray-600 font-bold text-sm">No items match your active filters.</p>
              <button
                onClick={() => { onSelectCategory('All'); setSelectedGender('All'); }}
                className="mt-4 text-xs bg-lucky-magenta text-white px-5 py-2 rounded-full font-bold hover:bg-opacity-90 cursor-pointer shadow-md transition-transform active:scale-95"
                id="reset-filters-grid-btn"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[6px] md:gap-4 p-[6px] md:p-4 bg-gray-100 md:bg-transparent" id="product-grid">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-md overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                id={`product-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
              >
                {/* Wishlist Icon Overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  id={`wishlist-btn-${product.id}`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'
                    }`}
                  />
                </button>

                {/* Main Product Image Container */}
                <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Ad tag indicator */}
                  {product.isAd && (
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1 rounded-xs font-semibold tracking-wider">
                      Ad
                    </span>
                  )}

                  {/* Countdown deal banner if available */}
                  {product.timeLeftText && (
                    <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white py-1 px-2 text-[10px] font-semibold flex items-center justify-between gap-1">
                      <span className="flex items-center gap-0.5">⏱️ {timerText}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-95 animate-pulse">Flash Deal</span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                  <div>
                    {/* Title */}
                    <h3 className="text-xs font-medium text-gray-500 line-clamp-1 leading-tight tracking-tight mb-1 break-words overflow-hidden" title={product.title}>
                      {product.title}
                    </h3>

                    {/* Vendor Name Display */}
                    <div className="text-[10px] font-extrabold text-[#e91e63] mb-1.5 flex items-center gap-1 truncate">
                      <span>🏪</span>
                      <span className="truncate">{product.soldBy || 'Jaipur Wholesale'}</span>
                    </div>

                    {/* Price and Strikethrough Row */}
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
                      {product.hasUpiOffer && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded-sm border border-emerald-200/50 uppercase tracking-wider">
                          UPI
                        </span>
                      )}
                    </div>

                    {/* COD Info - True Lucky Style */}
                    <div className="text-[11px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                      <span className="text-emerald-600 text-[10px]">✔</span>
                      <span>₹{product.codPrice} with COD</span>
                    </div>
                  </div>

                  {/* Bottom Stats Row */}
                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      {/* Star Rating pill */}
                      <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-3xs">
                        {product.rating} <span className="gold-star-glow text-[9px]">★</span>
                      </span>
                    </div>

                    {/* Top Rated Check badge */}
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
  );
}

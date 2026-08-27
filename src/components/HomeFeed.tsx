import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpDown, ChevronDown, ChevronUp, SlidersHorizontal, Heart, Sparkles, CheckCircle2, Loader2, Search, ShoppingBag, Tag, X, Star, Check, RotateCcw, Zap } from 'lucide-react';
import { Product, Banner, Category } from '../types';
import { initialBanners } from '../data';

// Preload all default promotional banner images to browser cache immediately when file is parsed
if (typeof window !== 'undefined') {
  try {
    initialBanners.forEach(banner => {
      if (banner && banner.imageUrl) {
        const img = new Image();
        img.src = banner.imageUrl;
      }
    });
  } catch (_) {}
}
import { useInfiniteProductPagination } from '../hooks/useInfiniteProductPagination';
import { sortHomeFeedByPerformance } from '../utils/productSorting';
import { getProductPricing } from '../utils/pricing';
import { HighlightedText } from './HighlightedText';
import { useProductImpressionObserver } from '../hooks/useProductImpressionObserver';
import { trackProductView } from '../utils/analytics';
import { getApiUrl } from '../utils/api';
import { SmartImage } from './common/SmartImage';
import { CategoryIcon } from './common/CategoryIcon';
import { ProductCardSkeleton, ProductGridSkeleton, BannerSkeleton, CategoryRowSkeleton } from './common/Skeletons';

interface HomeFeedProps {
  categories?: Category[];
  products: Product[];
  banners: Banner[];
  onSelectProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery?: string;
  currentUser?: any;
  onRequireLogin?: (actionTitle?: string, actionDesc?: string) => void;
  isLoading?: boolean;
}

export default function HomeFeed({
  categories,
  products,
  banners,
  onSelectProduct,
  wishlist,
  onToggleWishlist,
  selectedCategory,
  onSelectCategory,
  searchQuery = '',
  currentUser,
  onRequireLogin,
  isLoading = false
}: HomeFeedProps) {
  // Activate automatic product impression tracking (1 count per 3 hours per IP)
  useProductImpressionObserver();

  // State for sorting & filtering
  const [sortBy, setSortBy] = useState<string>('popular');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Attribute Filter States
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [codOnly, setCodOnly] = useState<boolean>(false);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Smart AI Search Recommendation states
  const [smartSearchLoading, setSmartSearchLoading] = useState(false);
  const [smartResult, setSmartResult] = useState<{
    recommendationsText: string;
    onlineFallbackItems: any[];
    alternativeSuggestions: string[];
  } | null>(null);

  // Countdown clock simulation for the flash deals (as seen in Lucky screenshots)
  const [timerText, setTimerText] = useState('01h : 25m : 26s');

  // Category Bubbles expand/collapse state (3 categories + See More initially)
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  // Fallback to initialBanners if banners array is empty
  const displayBanners = useMemo(() => {
    return (banners && banners.length > 0) ? banners : initialBanners;
  }, [banners]);

  // Separate banners by placement (Main Banner vs Double Banners) with robust fallbacks
  const row1Banners = useMemo(() => {
    const mainMatches = displayBanners.filter((b) => b.row === 'main' || b.id === 'banner-rakhi-1');
    if (mainMatches.length > 0) return mainMatches;

    const upperMatches = displayBanners.filter((b) => b.row === 'upper');
    if (upperMatches.length > 0) return upperMatches;

    return displayBanners.length > 0 ? [displayBanners[0]] : initialBanners.slice(0, 1);
  }, [displayBanners]);

  const row2Banners = useMemo(() => {
    const doubleMatches = displayBanners.filter((b) => b.row === 'double' || b.row === 'lower' || b.id === 'banner-rakhi-2' || b.id === 'banner-rakhi-3');
    if (doubleMatches.length > 0) return doubleMatches;

    // Fallback: use any banners not in row 1
    const remaining = displayBanners.filter((b) => !row1Banners.some((r1) => r1.id === b.id));
    if (remaining.length > 0) return remaining;

    // Fallback to default double banners from initialBanners
    return initialBanners.filter((b) => b.row === 'double' || b.id === 'banner-rakhi-2' || b.id === 'banner-rakhi-3');
  }, [displayBanners, row1Banners]);

  // Banner Carousel Index tracking & automatic loop animation state
  const [row1Index, setRow1Index] = useState(0);
  const [row2Index, setRow2Index] = useState(0);
  const [isRow1Transitioning, setIsRow1Transitioning] = useState(false);
  const [isRow2Transitioning, setIsRow2Transitioning] = useState(false);

  // Row 1 Swipe handlers (Touch & Mouse dragging support)
  const [row1TouchStart, setRow1TouchStart] = useState<number | null>(null);
  const [row1TouchEnd, setRow1TouchEnd] = useState<number | null>(null);
  const [row1IsDragging, setRow1IsDragging] = useState(false);

  // Row 2 Swipe handlers (Touch & Mouse dragging support)
  const [row2TouchStart, setRow2TouchStart] = useState<number | null>(null);
  const [row2TouchEnd, setRow2TouchEnd] = useState<number | null>(null);
  const [row2IsDragging, setRow2IsDragging] = useState(false);

  const nextRow1 = () => {
    if (!row1Banners || row1Banners.length <= 1) return;
    setIsRow1Transitioning(true);
    setRow1Index((prev) => prev + 1);
  };

  const prevRow1 = () => {
    if (!row1Banners || row1Banners.length <= 1) return;
    setIsRow1Transitioning(true);
    setRow1Index((prev) => prev - 1);
  };

  const nextRow2 = () => {
    if (!row2Banners || row2Banners.length <= 1) return;
    setIsRow2Transitioning(true);
    setRow2Index((prev) => prev + 1);
  };

  const prevRow2 = () => {
    if (!row2Banners || row2Banners.length <= 1) return;
    setIsRow2Transitioning(true);
    setRow2Index((prev) => prev - 1);
  };

  // Synchronize base starting offsets to middle clone set
  useEffect(() => {
    if (row1Banners && row1Banners.length > 0) {
      setRow1Index(row1Banners.length);
    }
  }, [row1Banners.length]);

  useEffect(() => {
    if (row2Banners && row2Banners.length > 0) {
      setRow2Index(row2Banners.length);
    }
  }, [row2Banners.length]);

  // Handle silent seamless boundary resets when transitions complete
  const handleRow1TransitionEnd = () => {
    if (!row1Banners || row1Banners.length === 0) return;
    setIsRow1Transitioning(false);
    if (row1Index >= row1Banners.length * 2) {
      setRow1Index(row1Index - row1Banners.length);
    } else if (row1Index < row1Banners.length) {
      setRow1Index(row1Index + row1Banners.length);
    }
  };

  const handleRow2TransitionEnd = () => {
    if (!row2Banners || row2Banners.length === 0) return;
    setIsRow2Transitioning(false);
    if (row2Index >= row2Banners.length * 2) {
      setRow2Index(row2Index - row2Banners.length);
    } else if (row2Index < row2Banners.length) {
      setRow2Index(row2Index + row2Banners.length);
    }
  };

  // Auto loop triggers
  useEffect(() => {
    if (!row1Banners || row1Banners.length <= 1) return;
    const interval = setInterval(() => {
      nextRow1();
    }, 4000); // Top single banner auto-rotates every 4 seconds
    return () => clearInterval(interval);
  }, [row1Banners.length, row1Index]);

  useEffect(() => {
    if (!row2Banners || row2Banners.length <= 1) return;
    const interval = setInterval(() => {
      nextRow2();
    }, 5500); // Bottom double banners auto-rotate every 5.5 seconds (staggered slightly)
    return () => clearInterval(interval);
  }, [row2Banners.length, row2Index]);

  // Touch Swipe Handlers for Row 1
  const handleRow1TouchStart = (e: React.TouchEvent) => {
    setRow1TouchStart(e.targetTouches[0].clientX);
  };

  const handleRow1TouchMove = (e: React.TouchEvent) => {
    setRow1TouchEnd(e.targetTouches[0].clientX);
  };

  const handleRow1TouchEnd = () => {
    if (row1TouchStart !== null && row1TouchEnd !== null) {
      const diff = row1TouchStart - row1TouchEnd;
      if (diff > 50) {
        nextRow1();
      } else if (diff < -50) {
        prevRow1();
      }
    }
    setRow1TouchStart(null);
    setRow1TouchEnd(null);
  };

  const handleRow1MouseDown = (e: React.MouseEvent) => {
    setRow1TouchStart(e.clientX);
    setRow1IsDragging(true);
  };

  const handleRow1MouseMove = (e: React.MouseEvent) => {
    if (row1IsDragging) {
      setRow1TouchEnd(e.clientX);
    }
  };

  const handleRow1MouseUpOrLeave = () => {
    if (row1IsDragging) {
      if (row1TouchStart !== null && row1TouchEnd !== null) {
        const diff = row1TouchStart - row1TouchEnd;
        if (diff > 50) {
          nextRow1();
        } else if (diff < -50) {
          prevRow1();
        }
      }
    }
    setRow1TouchStart(null);
    setRow1TouchEnd(null);
    setRow1IsDragging(false);
  };

  // Touch Swipe Handlers for Row 2
  const handleRow2TouchStart = (e: React.TouchEvent) => {
    setRow2TouchStart(e.targetTouches[0].clientX);
  };

  const handleRow2TouchMove = (e: React.TouchEvent) => {
    setRow2TouchEnd(e.targetTouches[0].clientX);
  };

  const handleRow2TouchEnd = () => {
    if (row2TouchStart !== null && row2TouchEnd !== null) {
      const diff = row2TouchStart - row2TouchEnd;
      if (diff > 50) {
        nextRow2();
      } else if (diff < -50) {
        prevRow2();
      }
    }
    setRow2TouchStart(null);
    setRow2TouchEnd(null);
  };

  const handleRow2MouseDown = (e: React.MouseEvent) => {
    setRow2TouchStart(e.clientX);
    setRow2IsDragging(true);
  };

  const handleRow2MouseMove = (e: React.MouseEvent) => {
    if (row2IsDragging) {
      setRow2TouchEnd(e.clientX);
    }
  };

  const handleRow2MouseUpOrLeave = () => {
    if (row2IsDragging) {
      if (row2TouchStart !== null && row2TouchEnd !== null) {
        const diff = row2TouchStart - row2TouchEnd;
        if (diff > 50) {
          nextRow2();
        } else if (diff < -50) {
          prevRow2();
        }
      }
    }
    setRow2TouchStart(null);
    setRow2TouchEnd(null);
    setRow2IsDragging(false);
  };

  // Apply filters and sort (hoisted above useEffects to prevent temporal dead zone)
  // Shoppers should only see verified/approved items
  const filteredProducts = useMemo(() => {
    let list = (products || []).filter(Boolean).filter(
      (p) => p && (!p.approvalStatus || p.approvalStatus === 'approved')
    );

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Popular') {
        list = list.filter(
          (p) => p && (p.category === 'Popular' || p.isBestSeller || (p.rating && p.rating >= 4.0))
        );
      } else {
        list = list.filter(
          (p) => p && p.category === selectedCategory
        );
      }
    }

    // 2. Gender Filter
    if (selectedGender !== 'All') {
      if (selectedGender === 'Men') {
        list = list.filter((p) => p && p.category === 'Men');
      } else if (selectedGender === 'Women') {
        list = list.filter(
          (p) => p && (p.category === 'Kurti, Saree & Lehenga' || p.category === 'Women Western' || p.category === 'Lingerie')
        );
      } else if (selectedGender === 'Kids') {
        list = list.filter((p) => p && p.category === 'Kids & Toys');
      }
    }

    // 3. Max Budget Filter
    if (maxPrice !== null && maxPrice > 0) {
      list = list.filter((p) => p && p.price <= maxPrice);
    }

    // 4. Minimum Rating Filter
    if (minRating > 0) {
      list = list.filter((p) => p && (p.rating || 0) >= minRating);
    }

    // 5. COD Available Filter
    if (codOnly) {
      list = list.filter((p) => p && p.isCodAvailable);
    }

    // 6. Minimum Discount Filter
    if (minDiscount > 0) {
      list = list.filter((p) => p && (p.discountPercent || 0) >= minDiscount);
    }

    // 7. Sorting
    const sorted = [...list];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    } else if (sortBy === 'discount') {
      sorted.sort((a, b) => ((b?.discountPercent || 0) - (a?.discountPercent || 0)));
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => ((b?.rating || 0) - (a?.rating || 0)));
    }

    return sorted;
  }, [products, selectedCategory, selectedGender, maxPrice, minRating, codOnly, minDiscount, sortBy]);

  // Processed products for home feed (performance weighted random order when browsing home without active search)
  const processedProducts = useMemo(() => {
    if (!searchQuery && sortBy === 'popular') {
      return sortHomeFeedByPerformance(filteredProducts);
    }
    return filteredProducts;
  }, [filteredProducts, searchQuery, sortBy]);

  // Infinite scroll pagination Hook (50 items max per batch, prefetch at last 10 items)
  const {
    visibleProducts,
    isLoadingMore,
    hasMore,
    triggerIndex,
    triggerRef,
    totalCount,
  } = useInfiniteProductPagination(processedProducts, { batchSize: 50, triggerThreshold: 10 });

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
        fetch(getApiUrl('/api/smart-search'), {
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

  // Helper to select category and scroll smoothly to products list
  const handleSelectCategoryAndScroll = (categoryVal: string) => {
    onSelectCategory(categoryVal);
    // Only scroll if they chose All (staying on home feed) or another category already active
    setTimeout(() => {
      const el = document.getElementById('filters-bar');
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - 80, // Offset for sticky headers
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Dynamic Category bubbles loaded from categories prop
  const dynamicCategories = (categories && categories.length > 0 ? categories : []).filter(Boolean);
  
  // Custom 'All Categories' item from DB/state if present
  const allCatObj = dynamicCategories.find(c => c && (c.id === 'cat-all' || c.name.toLowerCase() === 'all categories'));
  const allCatImage = allCatObj?.image;
  const allCatLabel = allCatObj?.name || 'All Categories';
  const allCatIcon = allCatObj?.icon || 'shopping-bag';

  // Exclude 'cat-all' from the dynamic list loop so it doesn't duplicate
  const userCategories = dynamicCategories.filter(c => c && c.id !== 'cat-all' && c.name.toLowerCase() !== 'all categories');

  const categoryBubbles = [
    { label: allCatLabel, value: 'All', bg: 'bg-blue-100', img: allCatImage, icon: allCatIcon },
    ...userCategories.map((cat, index) => {
      if (!cat) return null;
      const colors = ['bg-pink-50', 'bg-blue-50', 'bg-yellow-50', 'bg-orange-50', 'bg-green-50', 'bg-purple-50', 'bg-teal-50'];
      const bg = colors[index % colors.length];
      return {
        label: cat.name || 'Category',
        value: cat.name || '',
        bg,
        img: cat.image,
        icon: cat.icon || 'shopping-bag'
      };
    }).filter(Boolean) as { label: string; value: string; bg: string; img?: string; icon?: string }[]
  ];

  return (
    <div className="pb-20 max-w-7xl mx-auto w-full px-0 md:px-4" id="home-feed-container">
      {/* Categories Grid (Skeleton when loading) */}
      {isLoading ? (
        <div className="bg-white py-3 px-3 border-b border-gray-100 shadow-3xs">
          <CategoryRowSkeleton count={7} />
        </div>
      ) : (
        <motion.div
          layout
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white py-4 px-3 border-b border-gray-100 grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-y-4 gap-x-2 justify-items-center shadow-3xs overflow-hidden"
          id="category-bubbles-slider"
        >
        {/* Permanent first 4 categories */}
        {categoryBubbles.slice(0, 4).map((item, index) => {
          const isActive = selectedCategory === item.value;
          return (
            <motion.button
              layout
              key={`cat-perm-${index}-${item.value}`}
              onClick={() => handleSelectCategoryAndScroll(item.value)}
              className="flex flex-col items-center cursor-pointer group w-full max-w-[80px]"
              id={`bubble-${index}`}
              whileTap={{ scale: 0.94 }}
            >
              <div className={`w-12 h-12 rounded-xl overflow-hidden aspect-square flex items-center justify-center relative transition-all duration-200 border-2 ${
                isActive ? 'border-[#143C6B] scale-105 shadow-md ring-2 ring-[#143C6B]/20' : 'border-gray-100 group-hover:border-blue-300'
              } ${item.bg}`}>
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('svg')) {
                        const iconEl = document.createElement('div');
                        iconEl.className = 'flex items-center justify-center w-full h-full text-[#143C6B] font-black text-xs';
                        iconEl.innerText = item.label.charAt(0).toUpperCase();
                        parent.appendChild(iconEl);
                      }
                    }}
                  />
                ) : (
                  <CategoryIcon icon={item.icon} className="w-5 h-5 text-[#143C6B]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 text-center font-medium w-full truncate tracking-tight text-gray-700 px-0.5 ${
                isActive ? 'text-[#143C6B] font-black' : 'font-semibold'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Expandable categories (items beyond index 3) */}
        <AnimatePresence>
          {isCategoriesExpanded &&
            categoryBubbles.slice(4).map((item, subIndex) => {
              const actualIndex = subIndex + 4;
              const isActive = selectedCategory === item.value;
              return (
                <motion.button
                  layout
                  key={`cat-exp-${actualIndex}-${item.value}`}
                  initial={{ opacity: 0, scale: 0.75, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.75, y: -8 }}
                  transition={{
                    duration: 0.24,
                    delay: Math.min(subIndex * 0.02, 0.15),
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSelectCategoryAndScroll(item.value)}
                  className="flex flex-col items-center cursor-pointer group w-full max-w-[80px]"
                  id={`bubble-${actualIndex}`}
                >
                  <div className={`w-12 h-12 rounded-xl overflow-hidden aspect-square flex items-center justify-center relative transition-all duration-200 border-2 ${
                    isActive ? 'border-[#143C6B] scale-105 shadow-md ring-2 ring-[#143C6B]/20' : 'border-gray-100 group-hover:border-blue-300'
                  } ${item.bg}`}>
                    {item.img ? (
                      <img
                        src={item.img}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent && !parent.querySelector('svg')) {
                            const iconEl = document.createElement('div');
                            iconEl.className = 'flex items-center justify-center w-full h-full text-[#143C6B] font-black text-xs';
                            iconEl.innerText = item.label.charAt(0).toUpperCase();
                            parent.appendChild(iconEl);
                          }
                        }}
                      />
                    ) : (
                      <CategoryIcon icon={item.icon} className="w-5 h-5 text-[#143C6B]" />
                    )}
                  </div>
                  <span className={`text-[10px] mt-1 text-center font-medium w-full truncate tracking-tight text-gray-700 px-0.5 ${
                    isActive ? 'text-[#143C6B] font-black' : 'font-semibold'
                  }`}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* AnimatePresence for See More / See Less buttons */}
        <AnimatePresence mode="wait">
          {!isCategoriesExpanded && categoryBubbles.length > 4 ? (
            <motion.button
              layout
              key="btn-see-more"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCategoriesExpanded(true)}
              className="flex flex-col items-center cursor-pointer group w-full max-w-[80px]"
              id="see-more-categories-bubble"
              title="View all categories"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center relative transition-all border-2 border-blue-200/90 bg-gradient-to-b from-blue-50 to-indigo-50/70 group-hover:border-[#143C6B] group-hover:bg-blue-100 shadow-2xs group-hover:scale-105">
                <ChevronDown className="w-5 h-5 text-[#143C6B] group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black tracking-tight text-[#143C6B] px-0.5 whitespace-nowrap">
                See More
              </span>
            </motion.button>
          ) : isCategoriesExpanded && categoryBubbles.length > 4 ? (
            <motion.button
              layout
              key="btn-see-less"
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCategoriesExpanded(false)}
              className="flex flex-col items-center cursor-pointer group w-full max-w-[80px]"
              id="see-less-categories-bubble"
              title="Collapse categories"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden aspect-square flex flex-col items-center justify-center relative transition-all border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100 group-hover:border-slate-500 group-hover:bg-slate-200 shadow-2xs group-hover:scale-105">
                <ChevronUp className="w-5 h-5 text-slate-700 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
              </div>
              <span className="text-[10px] mt-1 text-center font-black tracking-tight text-slate-700 px-0.5 whitespace-nowrap">
                See Less
              </span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </motion.div>
      )}

      {/* Dynamic Banners Poster Section */}
      {displayBanners && displayBanners.length > 0 && (() => {
        const row1Slides = [...row1Banners, ...row1Banners, ...row1Banners];
        const row2Slides = [...row2Banners, ...row2Banners, ...row2Banners];
        return (
          <div className="w-full bg-gray-50 py-0.5 px-1 md:px-2 space-y-1">
            {/* Row 1: Main Carousel Banner (Top single poster - slides independently) */}
            {row1Banners.length > 0 && (
              <div className="relative">
                <div 
                  className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
                  onTouchStart={handleRow1TouchStart}
                  onTouchMove={handleRow1TouchMove}
                  onTouchEnd={handleRow1TouchEnd}
                  onMouseDown={handleRow1MouseDown}
                  onMouseMove={handleRow1MouseMove}
                  onMouseUp={handleRow1MouseUpOrLeave}
                  onMouseLeave={handleRow1MouseUpOrLeave}
                >
                  <div 
                    className={`flex gap-1 ${isRow1Transitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                    style={{ transform: `translateX(calc(-${row1Index} * (100% + 4px)))` }}
                    onTransitionEnd={handleRow1TransitionEnd}
                  >
                    {row1Slides.map((banner, index) => (
                      <div 
                        key={`row1-${banner.id}-${index}`} 
                        onClick={() => banner.targetCategory && onSelectCategory(banner.targetCategory)}
                        className="w-full shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-200/80 group cursor-pointer bg-slate-900"
                      >
                        <div className="aspect-[2.1/1] sm:aspect-[2.5/1] md:aspect-[3.2/1] w-full relative">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title || banner.type} 
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            loading="eager"
                            fetchPriority="high"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200';
                            }}
                            draggable="false"
                          />
                          {/* Dark Gradient Overlay for Readability */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#143C6B]/90 via-[#143C6B]/60 to-transparent flex flex-col justify-between p-3.5 sm:p-5 md:p-6 text-white pointer-events-none select-none">
                            <div className="flex items-center justify-between gap-2">
                              <span className="bg-[#FF8C00] text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                {banner.code ? `CODE: ${banner.code}` : (banner.type === 'promotional' ? 'FESTIVE PROMO' : 'NEWS')}
                              </span>
                              <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold tracking-tight px-2 py-0.5 rounded-md border border-white/30">
                                QueKart Exclusive
                              </span>
                            </div>

                            <div className="max-w-[80%] sm:max-w-[70%]">
                              <h3 className="text-xs sm:text-base md:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-xs line-clamp-2">
                                {banner.title || 'Festive Offers & Deals'}
                              </h3>
                              {banner.subtitle && (
                                <p className="text-[10px] sm:text-xs text-amber-200 font-medium mt-1 line-clamp-2 drop-shadow-xs">
                                  {banner.subtitle}
                                </p>
                              )}
                              <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#FF8C00] group-hover:translate-x-1 transition-transform">
                                <span>Explore Collection</span>
                                <span>→</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Two Side-by-Side Banners of Same Type (slides independently) */}
            {row2Banners.length > 0 && (
              <div className="relative">
                <div 
                  className="w-full overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
                  onTouchStart={handleRow2TouchStart}
                  onTouchMove={handleRow2TouchMove}
                  onTouchEnd={handleRow2TouchEnd}
                  onMouseDown={handleRow2MouseDown}
                  onMouseMove={handleRow2MouseMove}
                  onMouseUp={handleRow2MouseUpOrLeave}
                  onMouseLeave={handleRow2MouseUpOrLeave}
                >
                  <div 
                    className={`flex gap-1 ${isRow2Transitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                    style={{ transform: `translateX(calc(-${row2Index} * (50% + 2px)))` }}
                    onTransitionEnd={handleRow2TransitionEnd}
                  >
                    {row2Slides.map((banner, index) => (
                      <div 
                        key={`row2-${banner.id}-${index}`}
                        onClick={() => banner.targetCategory && onSelectCategory(banner.targetCategory)}
                        className="w-[calc(50%-2px)] shrink-0 relative rounded-xl overflow-hidden shadow-sm border border-gray-200/80 group cursor-pointer bg-slate-900"
                      >
                        <div className="aspect-[1.5/1] sm:aspect-[1.8/1] md:aspect-[2.2/1] w-full relative">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title || banner.type} 
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            loading="eager"
                            fetchPriority="high"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200';
                            }}
                            draggable="false"
                          />
                          {/* Dark Gradient Overlay for Readability */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#143C6B]/90 via-[#143C6B]/60 to-transparent flex flex-col justify-between p-2.5 sm:p-4 text-white pointer-events-none select-none">
                            <div className="flex items-center justify-between gap-1">
                              <span className="bg-[#FF8C00] text-slate-950 text-[7px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2 py-0.5 rounded-full shadow-xs truncate">
                                {banner.code ? `CODE: ${banner.code}` : (banner.type === 'promotional' ? 'PROMO' : 'NEWS')}
                              </span>
                              <span className="bg-white/20 backdrop-blur-md text-white text-[7px] sm:text-[8px] font-bold tracking-tight px-1.5 py-0.5 rounded border border-white/30 truncate">
                                Exclusive
                              </span>
                            </div>

                            <div className="max-w-[95%]">
                              <h3 className="text-[9.5px] sm:text-xs md:text-sm font-extrabold text-white tracking-tight leading-tight drop-shadow-xs line-clamp-2">
                                {banner.title || 'Special Deals'}
                              </h3>
                              {banner.subtitle && (
                                <p className="text-[7.5px] sm:text-[10px] text-amber-200 font-medium mt-0.5 line-clamp-1 drop-shadow-xs">
                                  {banner.subtitle}
                                </p>
                              )}
                              <div className="mt-1 flex items-center gap-1 text-[7.5px] sm:text-[10px] font-bold text-[#FF8C00] group-hover:translate-x-0.5 transition-transform">
                                  <span>Explore</span>
                                  <span>→</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      {/* Sorting / Filter Bar */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-hide relative z-20" id="filters-bar">
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowGenderDropdown(false);
                setShowBudgetDropdown(false);
                setShowRatingDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                sortBy !== 'popular' ? 'border-lucky-magenta text-lucky-magenta bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
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
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${sortBy === 'popular' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
                >
                  Relevance / Popular
                </button>
                <button
                  onClick={() => { setSortBy('price-asc'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${sortBy === 'price-asc' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => { setSortBy('price-desc'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${sortBy === 'price-desc' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
                >
                  Price: High to Low
                </button>
                <button
                  onClick={() => { setSortBy('discount'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${sortBy === 'discount' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
                >
                  Highest Discount
                </button>
                <button
                  onClick={() => { setSortBy('rating'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${sortBy === 'rating' ? 'text-lucky-magenta font-semibold' : 'text-gray-700'}`}
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
                setShowBudgetDropdown(false);
                setShowRatingDropdown(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                selectedGender !== 'All' ? 'border-lucky-magenta text-lucky-magenta bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
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
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer ${selectedGender === g ? 'text-lucky-magenta font-semibold bg-blue-50/50' : 'text-gray-700'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Max Budget Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBudgetDropdown(!showBudgetDropdown);
                setShowSortDropdown(false);
                setShowGenderDropdown(false);
                setShowRatingDropdown(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                maxPrice !== null ? 'border-[#143C6B] text-[#143C6B] bg-blue-50 font-bold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              id="budget-filter-btn"
            >
              <span>{maxPrice ? `Budget: Under ₹${maxPrice}` : 'Max Budget'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showBudgetDropdown && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1" id="budget-dropdown">
                {[
                  { label: 'Any Budget', value: null },
                  { label: 'Under ₹299', value: 299 },
                  { label: 'Under ₹499', value: 499 },
                  { label: 'Under ₹999', value: 999 },
                  { label: 'Under ₹1,999', value: 1999 },
                  { label: 'Under ₹4,999', value: 4999 },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => { setMaxPrice(option.value); setShowBudgetDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                      maxPrice === option.value ? 'text-[#143C6B] font-bold bg-blue-50/50' : 'text-gray-700'
                    }`}
                  >
                    <span>{option.label}</span>
                    {maxPrice === option.value && <Check className="w-3.5 h-3.5 text-[#143C6B]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRatingDropdown(!showRatingDropdown);
                setShowSortDropdown(false);
                setShowGenderDropdown(false);
                setShowBudgetDropdown(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                minRating > 0 ? 'border-amber-600 text-amber-700 bg-amber-50 font-bold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              id="rating-filter-btn"
            >
              <Star className={`w-3.5 h-3.5 ${minRating > 0 ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
              <span>{minRating > 0 ? `${minRating}★ & above` : 'Rating'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRatingDropdown && (
              <div className="absolute left-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1" id="rating-dropdown">
                {[
                  { label: 'All Ratings', value: 0 },
                  { label: '4.5★ & above', value: 4.5 },
                  { label: '4.0★ & above', value: 4.0 },
                  { label: '3.5★ & above', value: 3.5 },
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => { setMinRating(option.value); setShowRatingDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-amber-50 cursor-pointer flex items-center justify-between ${
                      minRating === option.value ? 'text-amber-800 font-bold bg-amber-50/60' : 'text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-amber-500 font-bold">★</span>
                      <span>{option.label}</span>
                    </span>
                    {minRating === option.value && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Drawer Toggle Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
              maxPrice !== null || minRating > 0 || codOnly || minDiscount > 0
                ? 'border-[#143C6B] text-white bg-[#143C6B] shadow-xs'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
            id="filters-sidebar-btn"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {(maxPrice !== null || minRating > 0 || codOnly || minDiscount > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategory !== 'All' || selectedGender !== 'All' || maxPrice !== null || minRating > 0 || codOnly || minDiscount > 0) && (
        <div className="bg-slate-50 px-3 py-2 text-xs font-medium flex items-center gap-2 border-b border-slate-200/80 overflow-x-auto scrollbar-hide" id="active-filters-info">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex-shrink-0">Active:</span>
          
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>{selectedCategory}</span>
              <button onClick={() => handleSelectCategoryAndScroll('All')} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedGender !== 'All' && (
            <span className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>Gender: {selectedGender}</span>
              <button onClick={() => setSelectedGender('All')} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {maxPrice !== null && (
            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#143C6B] px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>Under ₹{maxPrice}</span>
              <button onClick={() => setMaxPrice(null)} className="text-blue-400 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minRating > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>★ {minRating}+</span>
              <button onClick={() => setMinRating(0)} className="text-amber-500 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {codOnly && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>COD Only</span>
              <button onClick={() => setCodOnly(false)} className="text-emerald-500 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minDiscount > 0 && (
            <span className="inline-flex items-center gap-1 bg-pink-50 border border-pink-200 text-pink-800 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-3xs flex-shrink-0">
              <span>{minDiscount}%+ OFF</span>
              <button onClick={() => setMinDiscount(0)} className="text-pink-400 hover:text-red-500 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={() => {
              onSelectCategory('All');
              setSelectedGender('All');
              setMaxPrice(null);
              setMinRating(0);
              setCodOnly(false);
              setMinDiscount(0);
            }}
            className="text-[10.5px] font-bold text-red-600 hover:underline cursor-pointer flex-shrink-0 ml-1"
            id="clear-all-filters-btn"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Attribute Filter Modal / Drawer */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn" id="attribute-filter-modal">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-slideLeft">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#143C6B]" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Filter Products</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Max Budget Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Max Budget Price
                  </label>
                  <span className="text-xs font-black text-[#143C6B] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {maxPrice !== null ? `Under ₹${maxPrice}` : 'Any Budget'}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={maxPrice || 10000}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#143C6B] cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Under ₹299', val: 299 },
                    { label: 'Under ₹499', val: 499 },
                    { label: 'Under ₹999', val: 999 },
                    { label: 'Under ₹1,999', val: 1999 },
                    { label: 'Clear Limit', val: null },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setMaxPrice(preset.val)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer transition-colors ${
                        maxPrice === preset.val
                          ? 'bg-[#143C6B] text-white border-[#143C6B]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Customer Rating */}
              <div className="space-y-3 pt-4 border-t border-slate-150">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Minimum Customer Rating
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'All', val: 0 },
                    { label: '3.5★+', val: 3.5 },
                    { label: '4.0★+', val: 4.0 },
                    { label: '4.5★+', val: 4.5 },
                  ].map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setMinRating(r.val)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        minRating === r.val
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Discount % */}
              <div className="space-y-3 pt-4 border-t border-slate-150">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Minimum Discount %
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All Discounts', val: 0 },
                    { label: '10%+ OFF', val: 10 },
                    { label: '20%+ OFF', val: 20 },
                    { label: '30%+ OFF', val: 30 },
                    { label: '50%+ OFF', val: 50 },
                  ].map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setMinDiscount(d.val)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-colors ${
                        minDiscount === d.val
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash on Delivery Only Toggle */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Cash on Delivery Available</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Show items that support COD payment at doorstep</p>
                </div>
                <button
                  onClick={() => setCodOnly(!codOnly)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    codOnly ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 shadow-xs ${
                      codOnly ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => {
                  setMaxPrice(null);
                  setMinRating(0);
                  setCodOnly(false);
                  setMinDiscount(0);
                }}
                className="w-1/2 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="w-1/2 py-2.5 bg-[#143C6B] text-white rounded-xl text-xs font-black hover:bg-opacity-90 transition-colors cursor-pointer shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Search Query Header */}
      {searchQuery && (
        <div className="bg-[#E8EEF5] border-y border-blue-100 px-4 py-2.5 flex items-center justify-between text-xs animate-fadeIn" id="search-active-bar">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#143C6B]" />
            <span className="font-medium text-slate-700">
              Showing matching products for: <strong className="text-slate-900 font-bold">"{searchQuery}"</strong>
            </span>
            <span className="bg-[#143C6B] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredProducts.length} items found
            </span>
          </div>
          <button
            onClick={() => {
              const searchInput = document.getElementById('search-input') as HTMLInputElement;
              if (searchInput) {
                searchInput.value = '';
                const event = new Event('input', { bubbles: true });
                searchInput.dispatchEvent(event);
              }
            }}
            className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
            id="clear-search-btn"
          >
            <span>Clear Search</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid view of Products */}
      {isLoading ? (
        <div className="p-3 md:p-4">
          <ProductGridSkeleton count={10} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="w-full px-4 py-8 animate-fadeIn" id="empty-feed">
          {smartSearchLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-gray-100 rounded-xl shadow-xs max-w-2xl mx-auto">
              <Loader2 className="w-10 h-10 text-lucky-magenta animate-spin mb-4" />
              <p className="text-gray-700 font-bold text-sm">Consulting <span style={{ color: '#143C6B' }}>Que</span><span style={{ color: '#C89D1F' }}>Kart</span> Smart AI Assistant...</p>
              <p className="text-xs text-gray-400 mt-1">Finding the best online recommendations and alternatives for you.</p>
            </div>
          ) : smartResult ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* AI Recommendation Message Card */}
              <div className="bg-gradient-to-r from-blue-50/50 via-blue-50/30 to-blue-50/20 border border-blue-100 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl -z-10"></div>
                <div className="absolute bottom-0 left-10 w-24 h-24 bg-blue-100/30 rounded-full blur-xl -z-10"></div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                    <Sparkles className="w-5 h-5 text-lucky-magenta animate-pulse" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-100 flex items-center">
                        <span style={{ color: '#143C6B' }}>Que</span>
                        <span style={{ color: '#C89D1F' }}>Kart</span>
                        <span className="text-lucky-magenta ml-1">AI Assistant</span>
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
                        className="text-xs px-2.5 py-1 rounded-full bg-white border border-gray-150 text-gray-600 hover:text-lucky-magenta hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-colors"
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
                        className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col relative group"
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
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-lucky-magenta transition-colors break-words">
                            {item.title}
                          </h4>
                          
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-gray-950 premium-rupee">₹{item.price}</span>
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
              <Sparkles className="w-12 h-12 text-blue-300 mb-3 animate-spin" />
              <p className="text-gray-600 font-bold text-sm">No items match your active filters.</p>
              <button
                onClick={() => { handleSelectCategoryAndScroll('All'); setSelectedGender('All'); }}
                className="mt-4 text-xs bg-lucky-magenta text-white px-5 py-2 rounded-full font-bold hover:bg-opacity-90 cursor-pointer shadow-md transition-transform active:scale-95"
                id="reset-filters-grid-btn"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[6px] md:gap-4 p-[6px] md:p-4 bg-gray-100 md:bg-transparent" id="product-grid">
            {visibleProducts.map((product, idx) => {
              const isWishlisted = wishlist.includes(product.id);
              const isTrigger = idx === triggerIndex;
              return (
                <motion.div
                  key={product.id}
                  data-product-id={product.id}
                  ref={isTrigger ? triggerRef : undefined}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.02, 0.2) }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-md overflow-hidden shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                  id={`product-card-${product.id}`}
                  onClick={() => {
                    trackProductView(product.id);
                    onSelectProduct(product);
                  }}
                >
                  {/* Wishlist Icon Overlay */}
                  <motion.button
                    whileTap={{ scale: 0.78 }}
                    whileHover={{ scale: 1.12 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser && onRequireLogin) {
                        onRequireLogin('Save to Wishlist', 'Sign in to add items to your personal wishlist and track prices.');
                        return;
                      }
                      onToggleWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs cursor-pointer transition-all"
                    id={`wishlist-btn-${product.id}`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'
                      }`}
                    />
                  </motion.button>

                  {/* Main Product Image Container */}
                  <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    <SmartImage
                      src={(product.images && product.images[0]) || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300'}
                      alt={product.title}
                      aspectRatioClassName="aspect-square"
                      containerClassName="w-full h-full"
                    />

                    {/* Ad tag indicator */}
                    {product.isAd && (
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] px-1 rounded-xs font-semibold tracking-wider">
                        Ad
                      </span>
                    )}

                    {/* Countdown deal banner if available */}
                    {product.timeLeftText && (
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white py-1 px-1.5 text-[10px] font-semibold flex items-center justify-between whitespace-nowrap overflow-hidden">
                        <span className="flex items-center gap-0.5 truncate flex-shrink min-w-0">⏱️ {timerText}</span>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold text-amber-50 animate-pulse flex-shrink-0 ml-1">Flash Deal</span>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      {/* ID and Sponsored Indicators */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {product.numericId && (
                          <span className="bg-slate-100 text-slate-700 font-mono font-black text-[9px] px-1.5 py-0.2 rounded-sm border border-slate-200/55">
                            ID: {product.numericId}
                          </span>
                        )}
                        {product.sponsoredUntil && new Date(product.sponsoredUntil) > new Date() && (
                          <span className="bg-amber-50 text-amber-700 font-black text-[9px] px-1.5 py-0.2 rounded-sm border border-amber-200/55 uppercase tracking-wide">
                            ⭐ Sponsored
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-medium text-gray-500 line-clamp-1 leading-tight tracking-tight mb-1 break-words overflow-hidden" title={product.title}>
                        <HighlightedText text={product.title} query={searchQuery} />
                      </h3>

                      {/* Vendor Name Display */}
                      <div className="text-[10px] font-extrabold text-[#C49B48] mb-1.5 flex items-center gap-1 truncate">
                        <span>🏪</span>
                        <span className="truncate">
                          <HighlightedText text={product.soldBy || 'Jaipur Wholesale'} query={searchQuery} />
                        </span>
                      </div>

                      {(() => {
                        const pricing = getProductPricing(product);
                        return (
                          <>
                            {/* Price and Strikethrough Row */}
                            <div className="flex items-baseline gap-1.5 flex-wrap overflow-hidden">
                              <span className="text-[16px] font-black text-slate-900 premium-rupee">
                                ₹{pricing.effectivePrice}
                              </span>
                              <span className="text-xs text-gray-400 line-through font-medium">
                                ₹{pricing.originalPrice}
                              </span>
                              <span className="text-xs text-lucky-green font-extrabold tracking-tight">
                                {pricing.discountPercent}% off
                              </span>
                            </div>

                            {/* Dual Price Representation: COD & UPI Options */}
                            <div className="mt-1 space-y-0.5">
                              {/* UPI Special Price (only if explicitly enabled by vendor) */}
                              {pricing.hasUpiOffer && (
                                <div className="text-[11px] font-extrabold text-[#143C6B] flex items-center gap-1">
                                  <span className="text-emerald-600 text-[10px]">⚡</span>
                                  <span className="text-slate-900 font-bold">₹{pricing.upiPrice} with UPI</span>
                                </div>
                              )}

                              {/* COD Price */}
                              {pricing.isCodAvailable ? (
                                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                  <span className="text-emerald-600 text-[10px] font-bold">✔</span>
                                  <span>₹{pricing.codPrice} with COD</span>
                                </div>
                              ) : (
                                <div className="text-[10.5px] text-indigo-700 font-bold flex items-center gap-1">
                                  <span className="text-indigo-600 text-[10px]">⚡</span>
                                  <span>Online Payment Only</span>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
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
                </motion.div>
              );
            })}
          </div>

          {/* Loading Animation Row underneath last product row when fast scrolling or loading next batch */}
          {isLoadingMore && (
            <div className="px-[6px] md:px-4 py-3" id="feed-loading-spinner">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[6px] md:gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <ProductCardSkeleton key={`inf-skel-${idx}`} />
                ))}
              </div>
            </div>
          )}

          {/* End of results message: Switch Category or Search option */}
          {!hasMore && processedProducts.length > 0 && (
            <div className="w-full px-4 py-6">
              {searchQuery ? (
                <div className="bg-white border border-blue-100 rounded-2xl p-6 text-center max-w-lg mx-auto shadow-xs animate-fadeIn" id="search-end-card">
                  <div className="w-12 h-12 bg-blue-50 text-[#143C6B] rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
                    <CheckCircle2 className="w-6 h-6 text-[#143C6B]" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    All {processedProducts.length} related products loaded for "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    No more matching items for this search query. Try switching to another category or clearing search.
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={() => {
                        const searchInput = document.getElementById('search-input') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.value = '';
                          const event = new Event('input', { bubbles: true });
                          searchInput.dispatchEvent(event);
                        }
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#143C6B] hover:bg-[#0c2340] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      id="clear-search-switch-btn"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Search & View Feed</span>
                    </button>

                    <button
                      onClick={() => {
                        const searchInput = document.getElementById('search-input') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.value = '';
                          const event = new Event('input', { bubbles: true });
                          searchInput.dispatchEvent(event);
                        }
                        onSelectCategory('All');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      id="switch-category-btn"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Switch Category</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-150 rounded-2xl p-5 text-center max-w-lg mx-auto shadow-3xs animate-fadeIn" id="home-end-card">
                  <div className="w-10 h-10 bg-amber-50 text-[#C89D1F] rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-100">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">
                    You've viewed all {processedProducts.length} top performing products!
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Select a category above or search to discover more collections.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

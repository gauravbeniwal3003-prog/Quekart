import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingCart, Mic, Camera, Gift, Sparkles, TrendingUp, Tag, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '../types';

interface HeaderProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onSelectTab: (tab: string) => void;
  activeTab?: string;
  products?: Product[];
}

const TRENDING_SEARCHES = ['Kurtis', 'Watches', 'Sarees', 'Earphones', 'Sunglasses', 'Jeans', 'T-shirts', 'Bags'];

export default function Header({
  cart,
  onOpenCart,
  onSearch,
  searchQuery,
  onSelectTab,
  activeTab = 'home',
  products = []
}: HeaderProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute suggestions based on products & current input
  const query = searchQuery.trim().toLowerCase();
  
  let suggestionsList: { text: string; type: 'category' | 'subcategory' | 'product'; subText?: string }[] = [];

  if (query) {
    const matchedCategories = new Set<string>();
    const matchedSubcategories = new Set<string>();
    const matchedProducts: { text: string; subText?: string }[] = [];

    products.forEach((p) => {
      // Category match
      if (p.category.toLowerCase().includes(query)) {
        matchedCategories.add(p.category);
      }
      // Subcategory match
      if (p.subCategory.toLowerCase().includes(query)) {
        matchedSubcategories.add(p.subCategory);
      }
      // Product title match
      if (p.title.toLowerCase().includes(query)) {
        matchedProducts.push({ text: p.title, subText: p.category });
      }
    });

    // Populate suggestions
    matchedCategories.forEach(cat => {
      suggestionsList.push({ text: cat, type: 'category' });
    });
    matchedSubcategories.forEach(sub => {
      suggestionsList.push({ text: sub, type: 'subcategory' });
    });
    matchedProducts.slice(0, 5).forEach(prod => {
      suggestionsList.push({ text: prod.text, type: 'product', subText: prod.subText });
    });

    // Trim list
    suggestionsList = suggestionsList.slice(0, 8);
  }

  const handleSuggestionClick = (text: string) => {
    onSearch(text);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const listSize = query ? suggestionsList.length : TRENDING_SEARCHES.length;
      setActiveSuggestionIndex(prev => (prev + 1) % listSize);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const listSize = query ? suggestionsList.length : TRENDING_SEARCHES.length;
      setActiveSuggestionIndex(prev => (prev - 1 + listSize) % listSize);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0) {
        e.preventDefault();
        const selectedText = query 
          ? suggestionsList[activeSuggestionIndex].text 
          : TRENDING_SEARCHES[activeSuggestionIndex];
        handleSuggestionClick(selectedText);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs px-4 md:px-8 py-2 md:py-3" id="lucky-header">
      {/* Container to restrict max width on desktop but let it stay fluid */}
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          
          {/* Logo & Refer row on Mobile, Logo on Left on Desktop */}
          <div className="flex items-center justify-between md:justify-start gap-4 flex-shrink-0 w-full md:w-auto">
            {/* Left Section (Profile & Refer) - Mobile Only */}
            <div className="flex items-center gap-2 md:hidden flex-shrink-0">
              <button
                onClick={() => onSelectTab('profile')}
                className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                id="avatar-btn-mobile"
              >
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  alt="Gaurav Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              <div
                className="hidden sm:flex items-center gap-1.5 bg-pink-50 border border-pink-200 rounded-full px-2.5 py-1 text-[11px] font-semibold text-pink-700 animate-pulse cursor-pointer"
                id="refer-pill-mobile"
              >
                <Gift className="w-3.5 h-3.5 text-pink-600 animate-bounce" />
                <span>Refer and Earn</span>
              </div>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center md:justify-start cursor-pointer flex-shrink min-w-0 overflow-hidden" onClick={() => onSelectTab('home')}>
              <img 
                src="https://i.ibb.co/dwTX49yG/37145-removebg-preview.png" 
                alt="QueKart Logo" 
                className="h-7 sm:h-9 md:h-10 lg:h-11 w-auto max-w-[40px] sm:max-w-[150px] md:max-w-none object-contain flex-shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-black text-lucky-magenta text-lg sm:text-xl md:text-2xl tracking-tight truncate">QueKart</span>
            </div>

            {/* Action icons - Mobile Only */}
            <div className="flex items-center gap-3 md:hidden flex-shrink-0">
              <button
                onClick={() => onSelectTab('wishlist')}
                className="p-1.5 hover:bg-gray-100 rounded-full relative cursor-pointer text-gray-700 transition-colors"
                id="wishlist-header-btn-mobile"
              >
                <Heart className="w-6 h-6 stroke-2 hover:fill-red-500 hover:text-red-500 transition-colors" />
              </button>
              
              <button
                onClick={onOpenCart}
                className="p-1.5 hover:bg-gray-100 rounded-full relative cursor-pointer text-gray-700 transition-colors"
                id="cart-header-btn-mobile"
              >
                <ShoppingCart className="w-6 h-6 stroke-2" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-lucky-magenta text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scaleIn border border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar (responsive width) */}
          <div className="relative flex flex-col flex-1 max-w-2xl md:mx-auto w-full" id="search-container" ref={containerRef}>
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 text-gray-400">
                <Search className="w-5 h-5 stroke-2" />
              </div>
              <input
                type="text"
                placeholder="Search by Keyword, Product or Category..."
                value={searchQuery}
                onChange={(e) => {
                  onSearch(e.target.value);
                  setShowSuggestions(true);
                  setActiveSuggestionIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-20 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-all shadow-inner"
                id="search-input"
                autoComplete="off"
              />
              <div className="absolute right-3 flex items-center gap-3 text-gray-400">
                <button className="hover:text-lucky-magenta transition-colors cursor-pointer" title="Voice Search" id="mic-btn">
                  <Mic className="w-5 h-5" />
                </button>
                <div className="h-4 w-[1px] bg-gray-300"></div>
                <button className="hover:text-lucky-magenta transition-colors cursor-pointer" title="Search by Photo" id="camera-btn">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-150 rounded-xl shadow-xl z-50 overflow-hidden animate-scaleIn divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {!query ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold tracking-wider uppercase">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term, index) => (
                        <button
                          key={term}
                          onClick={() => handleSuggestionClick(term)}
                          className={`text-xs px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-lucky-magenta hover:border-pink-200 cursor-pointer font-semibold transition-all ${
                            activeSuggestionIndex === index ? 'bg-pink-50 text-lucky-magenta border-pink-200' : ''
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestionsList.length > 0 ? (
                      <>
                        <div className="px-4 py-1.5 text-[10px] text-gray-400 font-extrabold tracking-wider uppercase flex items-center justify-between">
                          <span>Smart Matches</span>
                          <span className="text-[9px] text-lucky-magenta font-black flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            QueKart AI Engine
                          </span>
                        </div>
                        <div className="mt-1 divide-y divide-gray-50">
                          {suggestionsList.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(item.text)}
                              className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                                activeSuggestionIndex === index ? 'bg-gray-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {item.type === 'category' || item.type === 'subcategory' ? (
                                  <Tag className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                ) : (
                                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-gray-800 break-words">{item.text}</span>
                                  {item.subText && (
                                    <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-wide bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                      {item.subText}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase">
                                  {item.type}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="px-4 py-4 text-center">
                        <p className="text-xs text-gray-500 font-bold">
                          No instant match for "<span className="text-pink-600">{searchQuery}</span>"
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-relaxed">
                          Press <kbd className="bg-gray-100 px-1 py-0.5 border border-gray-200 rounded-sm">Enter</kbd> or click search for online fallback recommendations!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Header Actions - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {/* Refer and Earn */}
            <div
              className="flex items-center gap-1.5 bg-pink-50 border border-pink-100 hover:border-pink-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-pink-700 cursor-pointer hover:bg-pink-100/40 transition-colors"
              id="refer-pill-desktop"
              onClick={() => onSelectTab('profile')}
            >
              <Gift className="w-4 h-4 text-pink-600 animate-bounce" />
              <span>Refer & Earn</span>
            </div>

            {/* Wishlist Link */}
            <button
              onClick={() => onSelectTab('wishlist')}
              className="flex items-center gap-1.5 text-gray-700 hover:text-lucky-magenta text-xs font-bold transition-colors cursor-pointer py-1"
              id="wishlist-desktop-btn"
            >
              <Heart className={`w-5 h-5 stroke-2 ${activeTab === 'wishlist' ? 'fill-lucky-magenta text-lucky-magenta' : 'hover:fill-red-500'}`} />
              <span>Wishlist</span>
            </button>

            {/* Cart Link */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 text-gray-700 hover:text-lucky-magenta text-xs font-bold transition-colors cursor-pointer relative py-1"
              id="cart-desktop-btn"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 stroke-2" />
                {totalItems > 0 && (
                  <span className="absolute -top-2.5 -right-2 bg-lucky-magenta text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </button>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-gray-200"></div>

            {/* User Profile menu button */}
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
              id="profile-desktop-btn"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-3xs">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                  alt="Gaurav Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden lg:block leading-none">
                <p className="text-xs font-extrabold text-gray-800">Gaurav B.</p>
                <span className="text-[9px] font-bold text-lucky-magenta">Gold Member</span>
              </div>
            </button>
          </div>

        </div>

        {/* Desktop Navigation Sub-bar - Hidden on Mobile */}
        <div className="hidden md:flex items-center justify-center lg:justify-start gap-8 md:gap-10 py-3 border-t border-gray-100 mt-3 text-xs md:text-sm font-extrabold text-gray-600 tracking-wide uppercase">
          <button
            onClick={() => onSelectTab('home')}
            className={`hover:text-lucky-magenta transition-all cursor-pointer relative pb-1 ${activeTab === 'home' ? 'text-lucky-magenta font-black border-b-2 border-lucky-magenta' : ''}`}
          >
            Home Feed
          </button>
          <button
            onClick={() => onSelectTab('categories')}
            className={`hover:text-lucky-magenta transition-all cursor-pointer relative pb-1 ${activeTab === 'categories' ? 'text-lucky-magenta font-black border-b-2 border-lucky-magenta' : ''}`}
          >
            All Categories
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`hover:text-lucky-magenta transition-all cursor-pointer relative pb-1 ${activeTab === 'orders' ? 'text-lucky-magenta font-black border-b-2 border-lucky-magenta' : ''}`}
          >
            My Orders
          </button>
          <button
            onClick={() => onSelectTab('admin')}
            className={`hover:text-lucky-magenta transition-all cursor-pointer relative pb-1 flex items-center gap-1 ${activeTab === 'admin' ? 'text-lucky-magenta font-black border-b-2 border-lucky-magenta' : ''}`}
          >
            <span className="text-[10px] bg-red-100 text-red-600 font-black px-1.5 py-0.5 rounded-sm tracking-wider mr-1">ADMIN</span>
            Admin Panel
          </button>
        </div>

      </div>
    </header>
  );
}

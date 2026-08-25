import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, ShoppingCart, Mic, Camera, Gift, Sparkles, TrendingUp, Tag, ArrowRight, User, LogOut, LogIn, ChevronDown, Package, ShieldCheck, Store, History, Trash2, X } from 'lucide-react';
import { CartItem, Product } from '../types';
import Logo, { BrandLogo } from './Logo';
import { HighlightedText } from './HighlightedText';

interface HeaderProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  onSelectTab: (tab: string) => void;
  activeTab?: string;
  products?: Product[];
  currentUser?: any;
  onLogout?: () => void;
}

const TRENDING_SEARCHES = ['Kurtis', 'Watches', 'Sarees', 'Earphones', 'Sunglasses', 'Jeans', 'T-shirts', 'Bags'];

export default function Header({
  cart,
  onOpenCart,
  onSearch,
  searchQuery,
  onSelectTab,
  activeTab = 'home',
  products = [],
  currentUser = null,
  onLogout
}: HeaderProps) {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const viewport = document.getElementById('applet-content-viewport');
      const scrollTop = viewport ? viewport.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
      if (scrollTop > 20) {
        setIsScrolled(true);
      } else if (scrollTop < 10) {
        setIsScrolled(false);
      }
    };

    const viewport = document.getElementById('applet-content-viewport');
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      if (viewport) {
        viewport.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Search History from LocalStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('quekart_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read search history:', e);
    }
    return ['Kurtis', 'Watches', 'Sarees', 'Shoes'];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const saveSearchToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('quekart_search_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save search history:', err);
      }
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('quekart_search_history');
    } catch (err) {}
  };

  const removeFromSearchHistory = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== termToRemove.toLowerCase());
      try {
        localStorage.setItem('quekart_search_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
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
    saveSearchToHistory(text);
    onSearch(text);
    if (activeTab !== 'home') {
      onSelectTab('home');
    }
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
        if (searchQuery.trim()) {
          saveSearchToHistory(searchQuery.trim());
        }
        if (activeTab !== 'home') {
          onSelectTab('home');
        }
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out ${isScrolled ? 'shadow-md border-b border-gray-200 py-1.5 md:py-2.5 px-3 md:px-8' : 'border-b border-gray-100 shadow-xs py-2 md:py-3 px-4 md:px-8'}`} id="lucky-header">
      {/* Container to restrict max width on desktop but let it stay fluid */}
      <div className="max-w-7xl mx-auto w-full">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-6">
          
          {/* Logo & Refer row on Mobile, Logo on Left on Desktop */}
          <div 
            className={`transition-all duration-300 ease-in-out flex items-center justify-between md:justify-start gap-3 flex-shrink-0 w-full md:w-auto ${
              isScrolled 
                ? 'max-h-0 opacity-0 mb-0 overflow-hidden pointer-events-none md:max-h-none md:opacity-100 md:overflow-visible md:pointer-events-auto' 
                : 'max-h-16 opacity-100 mb-1 md:mb-0 overflow-visible pointer-events-auto'
            }`}
          >
            {/* Left Section (Profile & Refer) - Mobile Only */}
            <div className="flex items-center gap-2 md:hidden flex-shrink-0">
              <button
                onClick={() => onSelectTab('profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
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
                className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 text-[11px] font-semibold text-blue-700 animate-pulse cursor-pointer"
                id="refer-pill-mobile"
              >
                <Gift className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                <span>Refer and Earn</span>
              </div>
            </div>

            {/* Logo */}
            <BrandLogo size="md" onClick={() => onSelectTab('home')} />

            {/* Action icons - Mobile Only */}
            <div className="flex items-center gap-3 md:hidden flex-shrink-0">
              <button
                onClick={() => onSelectTab('wishlist')}
                className="p-1.5 hover:bg-gray-100 rounded-full relative cursor-pointer text-gray-700 transition-colors"
                id="wishlist-header-btn-mobile"
              >
                <Heart className="w-5 h-5 stroke-2 hover:fill-red-500 hover:text-red-500 transition-colors" />
              </button>
              
              <button
                onClick={onOpenCart}
                className="p-1.5 hover:bg-gray-100 rounded-full relative cursor-pointer text-gray-700 transition-colors"
                id="cart-header-btn-mobile"
              >
                <ShoppingCart className="w-5 h-5 stroke-2" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-lucky-magenta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn border border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar Container */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-1">
            {/* Inline mini logo on mobile when scrolled */}
            <div 
              className={`transition-all duration-300 ease-in-out md:hidden flex items-center gap-2 flex-shrink-0 ${
                isScrolled 
                  ? 'max-w-[120px] opacity-100 pointer-events-auto' 
                  : 'max-w-0 opacity-0 overflow-hidden pointer-events-none'
              }`}
            >
              <BrandLogo size="sm" onClick={() => onSelectTab('home')} />
            </div>

            {/* Search Bar (responsive width) */}
            <div className="relative flex flex-col flex-1 max-w-2xl md:mx-auto w-full" id="search-container" ref={containerRef}>
              <div className="relative flex items-center w-full">
                <div className="absolute left-3.5 text-gray-400">
                  <Search className="w-4 h-4 md:w-5 md:h-5 stroke-2" />
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
                  className="w-full pl-10 md:pl-11 pr-16 md:pr-20 py-1.5 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs md:text-sm text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-all shadow-inner"
                  id="search-input"
                  autoComplete="off"
                />
                <div className="absolute right-3 flex items-center gap-2 md:gap-3 text-gray-400">
                  <button className="hover:text-lucky-magenta transition-colors cursor-pointer" title="Voice Search" id="mic-btn">
                    <Mic className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <div className="h-3.5 md:h-4 w-[1px] bg-gray-300"></div>
                  <button className="hover:text-lucky-magenta transition-colors cursor-pointer" title="Search by Photo" id="camera-btn">
                    <Camera className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

            {/* Smart Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-150 rounded-xl shadow-xl z-50 overflow-hidden animate-scaleIn divide-y divide-gray-100 max-h-96 overflow-y-auto" id="search-suggestions-dropdown">
                {!query ? (
                  <div className="p-4 space-y-4">
                    {/* Recent Searches Section */}
                    {recentSearches.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-[#143C6B]" />
                            <span>Recent Searches</span>
                          </div>
                          <button
                            onClick={clearSearchHistory}
                            className="text-[10px] text-gray-400 hover:text-red-500 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            id="clear-recent-searches-btn"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <div
                              key={term}
                              onClick={() => handleSuggestionClick(term)}
                              className="group inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-[#143C6B]/10 hover:text-[#143C6B] hover:border-[#143C6B]/30 cursor-pointer font-semibold transition-all shadow-3xs"
                            >
                              <span>{term}</span>
                              <button
                                onClick={(e) => removeFromSearchHistory(term, e)}
                                className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                                title="Remove search"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches Section */}
                    <div className="space-y-2 pt-1 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bold tracking-wider uppercase">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <span>Trending Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING_SEARCHES.map((term, index) => (
                          <button
                            key={term}
                            onClick={() => handleSuggestionClick(term)}
                            className={`text-xs px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-lucky-magenta hover:border-blue-200 cursor-pointer font-semibold transition-all ${
                              activeSuggestionIndex === index ? 'bg-blue-50 text-lucky-magenta border-blue-200' : ''
                            }`}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
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
                                  <Tag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-gray-800 break-words">
                                    <HighlightedText text={item.text} query={searchQuery} />
                                  </span>
                                  {item.subText && (
                                    <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-wide bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                      <HighlightedText text={item.subText} query={searchQuery} />
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
                          No instant match for "<span className="text-blue-600">{searchQuery}</span>"
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
        </div>

          {/* Desktop Right Header Actions - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            {/* Refer and Earn */}
            <div
              className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 hover:border-blue-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-blue-700 cursor-pointer hover:bg-blue-100/40 transition-colors"
              id="refer-pill-desktop"
              onClick={() => onSelectTab('profile')}
            >
              <Gift className="w-4 h-4 text-blue-600 animate-bounce" />
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

            {/* User Profile / Login dropdown menu button */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer text-left py-1 px-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200"
                id="profile-desktop-btn"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-3xs bg-slate-100 flex items-center justify-center">
                  {currentUser ? (
                    <div className="w-full h-full bg-[#143C6B] flex items-center justify-center text-white text-xs font-black">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-slate-500 stroke-[2]" />
                  )}
                </div>
                <div className="hidden lg:block leading-tight">
                  <p className="text-xs font-extrabold text-gray-800 flex items-center gap-1">
                    {currentUser ? currentUser.name : 'Sign In'}
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </p>
                  <span className={`text-[9px] font-bold ${currentUser ? 'text-lucky-green' : 'text-[#143C6B]'}`}>
                    {currentUser ? 'Active Customer' : 'Customer Account'}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown Card */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scaleIn divide-y divide-gray-100">
                  {/* User info header */}
                  <div className="px-4 py-3 bg-gray-50/70">
                    {currentUser ? (
                      <>
                        <p className="text-xs font-black text-gray-900 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                          {currentUser.email || (currentUser.phone ? `+91 ${currentUser.phone}` : '')}
                        </p>
                        <span className="inline-block bg-lucky-gold/20 text-[#8F6F0E] text-[9px] font-black px-2 py-0.5 rounded-full mt-1.5 uppercase">
                          QueKart Member
                        </span>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-black text-gray-900">Welcome to QueKart</p>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          Sign in to access your orders, saved cart & profile
                        </p>
                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            onSelectTab('user');
                          }}
                          className="w-full mt-2 py-1.5 bg-[#143C6B] hover:bg-[#0C2340] active:scale-95 text-white font-black text-[11px] rounded-lg shadow-xs transition-all cursor-pointer text-center uppercase tracking-wider"
                          id="header-signin-cta"
                        >
                          Sign In / Register
                        </button>
                      </>
                    )}
                  </div>

                  {/* Links */}
                  <div className="py-1 text-xs font-bold text-gray-700">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onSelectTab('profile');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50/60 hover:text-[#143C6B] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{currentUser ? 'My Profile & Settings' : 'Account & Help'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onSelectTab('orders');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50/60 hover:text-[#143C6B] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>My Orders & Tracking</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onSelectTab('wishlist');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50/60 hover:text-[#143C6B] flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>My Wishlist</span>
                    </button>


                  </div>

                  {/* Sign Out / Log In Action */}
                  {currentUser && (
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-black text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        id="header-dropdown-logout-btn"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Logout Confirmation Dialog for Header */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" id="header-logout-overlay">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 text-center animate-scaleIn space-y-3">
            <BrandLogo size="md" layout="col" className="mx-auto" />
            
            <div>
              <h3 className="text-sm font-black text-gray-900">Are you sure you want to log out?</h3>
              <p className="text-[11px] text-gray-400 font-semibold mt-1">
                Your session and active browsing data will be reset safely.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1.5">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-extrabold py-2.5 rounded-lg cursor-pointer transition-all active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) {
                    onLogout();
                  } else {
                    try {
                      localStorage.removeItem('quekart_current_user');
                      localStorage.removeItem('quekart_user_token');
                    } catch (_) {}
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Logged out successfully!' }));
                    onSelectTab('user');
                  }
                }}
                className="bg-lucky-magenta text-white hover:bg-opacity-95 text-xs font-black py-2.5 rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

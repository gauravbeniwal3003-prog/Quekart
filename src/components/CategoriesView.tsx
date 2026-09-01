import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, Layers, ChevronRight } from 'lucide-react';
import { Category, SubCategory } from '../types';
import { resetScrollToTop } from '../utils/scroll';
import { SmartImage } from './common/SmartImage';
import { CategoryIcon } from './common/CategoryIcon';
import { fetchSubCategoriesUnified } from '../supabase';

interface CategoriesViewProps {
  categories?: Category[];
  subCategories?: SubCategory[];
  onSelectCategory: (category: string, subCategory?: string) => void;
  onSelectTab?: (tab: string) => void;
  isLoading?: boolean;
}

export default function CategoriesView({
  categories = [],
  subCategories: initialSubCategories,
  onSelectCategory,
  onSelectTab: _onSelectTab,
  isLoading = false
}: CategoriesViewProps) {
  const cats = categories.filter(c => c.name !== 'All Categories');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [subCategories, setSubCategories] = useState<SubCategory[]>(initialSubCategories || []);
  const [loadingSubCats, setLoadingSubCats] = useState(false);

  // Load sub-categories from storage/cache if not provided
  useEffect(() => {
    if (!initialSubCategories || initialSubCategories.length === 0) {
      setLoadingSubCats(true);
      fetchSubCategoriesUnified().then(data => {
        setSubCategories(data);
        setLoadingSubCats(false);
      });
    } else {
      setSubCategories(initialSubCategories);
    }
  }, [initialSubCategories]);

  // Set default active category to first one or 'cat-ethnic-wear' or first in list
  useEffect(() => {
    if (cats.length > 0 && !activeCategoryId) {
      const defaultCat = cats.find(c => c.name.toLowerCase().includes('ethnic')) || cats[0];
      setActiveCategoryId(defaultCat.id);
    }
  }, [cats, activeCategoryId]);

  const currentActiveCategory = useMemo(() => {
    return cats.find(c => c.id === activeCategoryId) || cats[0] || null;
  }, [cats, activeCategoryId]);

  useEffect(() => {
    resetScrollToTop();
  }, [activeCategoryId]);

  // Get sub-categories for the selected main category
  const activeSubCategories = useMemo(() => {
    if (!currentActiveCategory) return [];
    const catNameLower = currentActiveCategory.name.toLowerCase();
    const catId = currentActiveCategory.id;

    return subCategories.filter(sc => {
      if (sc.categoryId === catId) return true;
      if (sc.categoryName && sc.categoryName.toLowerCase() === catNameLower) return true;
      
      // Fallback loose matching
      if (catNameLower.includes('ethnic') && sc.categoryId.includes('ethnic')) return true;
      if (catNameLower.includes('western') && sc.categoryId.includes('western')) return true;
      if (catNameLower.includes('popular') && sc.categoryId.includes('popular')) return true;
      if (catNameLower.includes('men') && sc.categoryId.includes('men')) return true;
      if (catNameLower.includes('electronics') && sc.categoryId.includes('electronics')) return true;
      if (catNameLower.includes('home') && sc.categoryId.includes('home')) return true;
      
      return false;
    });
  }, [subCategories, currentActiveCategory]);

  // Group sub-categories by group header
  const groupedSubCategories = useMemo(() => {
    const groups: { [key: string]: SubCategory[] } = {};
    activeSubCategories.forEach(sc => {
      const gName = sc.group || 'All Sub-Categories';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(sc);
    });
    return groups;
  }, [activeSubCategories]);

  const handleSubCategoryClick = (subCat: SubCategory) => {
    if (currentActiveCategory) {
      onSelectCategory(currentActiveCategory.name, subCat.name);
    }
  };

  const handleMainCategoryHeaderClick = () => {
    if (currentActiveCategory) {
      onSelectCategory(currentActiveCategory.name);
    }
  };

  return (
    <div className="flex bg-white flex-1 min-h-0 overflow-hidden max-w-7xl mx-auto w-full h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]" id="categories-view-container">
      {/* Left Column Sidebar - Main Categories set by Admin */}
      <div className="w-[105px] sm:w-[180px] md:w-[240px] bg-slate-50/80 border-r border-slate-200 overflow-y-auto flex-shrink-0 h-full pb-16" id="categories-sidebar">
        <div className="p-2 sm:p-3 border-b border-slate-200/60 bg-white sticky top-0 z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#143C6B] block">Categories</span>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Select to view sub-categories</p>
        </div>

        {cats.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full py-3.5 px-2 sm:px-3 text-center sm:text-left flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 border-b border-slate-100 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-white text-[#143C6B] font-extrabold border-l-4 border-l-[#143C6B] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100/60'
              }`}
              id={`sidebar-category-${cat.id}`}
            >
              {/* Category Image 1:1 Frame */}
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden aspect-square flex items-center justify-center transition-transform flex-shrink-0 border ${
                isActive ? 'border-[#143C6B] bg-blue-50/60 text-[#143C6B] scale-105 shadow-2xs' : 'border-slate-200 bg-white text-slate-400'
              }`}>
                {cat.image ? (
                  <SmartImage
                    src={cat.image}
                    alt={cat.name}
                    aspectRatioClassName="aspect-square"
                    containerClassName="w-full h-full"
                    fallbackSrc="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150"
                  />
                ) : (
                  <CategoryIcon icon={cat.icon || 'shopping-bag'} className="w-5 h-5 text-[#143C6B]" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <span className={`text-[10px] sm:text-xs leading-tight block truncate ${isActive ? 'font-bold text-[#143C6B]' : 'font-medium text-slate-700'}`}>
                  {cat.name}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Right Column Content Panel - Sub-Categories Grid with Round Avatars */}
      <div className="flex-1 bg-white overflow-y-auto h-full p-3 sm:p-5 md:p-6 pb-20" id="categories-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full"
          >
            {/* Active Main Category Banner Header */}
            {currentActiveCategory && (
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-100/60 p-3 sm:p-4 rounded-2xl mb-5" id="active-category-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden aspect-square border border-[#143C6B]/30 flex-shrink-0">
                    <img src={currentActiveCategory.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'} alt={currentActiveCategory.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide">{currentActiveCategory.name}</h2>
                    <p className="text-[10.5px] text-slate-500 font-medium">Explore all sub-categories & collection</p>
                  </div>
                </div>

                <button
                  onClick={handleMainCategoryHeaderClick}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#143C6B] hover:text-[#143C6B]/80 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs cursor-pointer transition-colors"
                  id="view-all-category-btn"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {isLoading || loadingSubCats ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-6 gap-x-3" id="subcategories-skeleton-grid">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={`subcat-skel-${idx}`} className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full skeleton-shimmer border border-slate-200" />
                    <div className="w-14 h-3 skeleton-shimmer rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedSubCategories).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" id="empty-subcategories-view">
                <Layers className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-600 font-extrabold">No sub-categories added yet for {currentActiveCategory?.name}.</p>
                <p className="text-[10px] text-slate-400 mt-1">Admin can add sub-categories from Admin Panel under Category options.</p>
                <button
                  onClick={handleMainCategoryHeaderClick}
                  className="mt-4 px-4 py-2 bg-[#143C6B] text-white text-xs font-bold rounded-xl shadow-2xs"
                >
                  Explore {currentActiveCategory?.name} Products
                </button>
              </div>
            ) : (
              <div className="space-y-6" id="grouped-subcategories-container">
                {Object.entries(groupedSubCategories).map(([groupName, subItems]) => (
                  <div key={groupName} className="space-y-3" id={`subcategory-group-${groupName.replace(/\s+/g, '-').toLowerCase()}`}>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="w-2 h-2 rounded-full bg-[#143C6B]" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{groupName}</h3>
                      <span className="text-[10px] text-slate-400 font-bold ml-auto">({subItems.length})</span>
                    </div>

                    {/* Circular Tile Grid matching Meesho / Modern Ecommerce Layout */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-5 gap-x-3 sm:gap-x-4">
                      {subItems.map((subCat, index) => (
                        <motion.button
                          key={subCat.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.25) }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleSubCategoryClick(subCat)}
                          className="flex flex-col items-center cursor-pointer group transition-all text-center"
                          id={`subcategory-item-${subCat.id}`}
                        >
                          {/* Round Image Avatar Tile */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-50 border-2 border-slate-200/80 p-0.5 shadow-2xs group-hover:border-[#143C6B] group-hover:shadow-xs transition-all relative">
                            <SmartImage
                              src={subCat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'}
                              alt={subCat.name}
                              aspectRatioClassName="aspect-square"
                              containerClassName="w-full h-full rounded-full overflow-hidden"
                            />
                          </div>

                          {/* Sub-Category Label */}
                          <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 max-w-[85px] sm:max-w-[100px] leading-tight line-clamp-2 group-hover:text-[#143C6B] transition-colors">
                            {subCat.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

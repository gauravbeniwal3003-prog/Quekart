import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronRight, Layers } from 'lucide-react';
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
      const defaultCat = cats.find(c => c.name.toLowerCase().includes('women')) || cats[0];
      setActiveCategoryId(defaultCat.id);
    }
  }, [cats, activeCategoryId]);

  const currentActiveCategory = useMemo(() => {
    return cats.find(c => c.id === activeCategoryId) || cats[0] || null;
  }, [cats, activeCategoryId]);

  useEffect(() => {
    // Intentionally removed resetScrollToTop() so the category sidebar does not scroll up
    // when clicking a different main category.
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
      if (catNameLower.includes('women') && sc.categoryId.includes('women')) return true;
      
      return false;
    });
  }, [subCategories, currentActiveCategory]);

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
      {/* Left Column Sidebar - Main Categories */}
      <div className="w-[100px] sm:w-[120px] bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 h-full pb-16 hide-scrollbar" id="categories-sidebar">
        {cats.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`w-full py-3 px-1 flex flex-col items-center gap-2 cursor-pointer relative transition-colors ${
                isActive ? 'bg-white' : 'bg-[#ffe4e4]/40 hover:bg-[#ffe4e4]/70'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#143C6B] rounded-r" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 ${
                isActive ? 'border-transparent bg-blue-100' : 'border-transparent bg-transparent'
              }`}>
                {cat.image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <CategoryIcon icon={cat.icon || 'shopping-bag'} className={`w-6 h-6 ${isActive ? 'text-[#143C6B]' : 'text-slate-600'}`} />
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] leading-tight text-center px-1 ${isActive ? 'font-bold text-[#143C6B]' : 'font-medium text-slate-700'}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Column Content Panel - Sub-Categories Grid */}
      <div className="flex-1 bg-white overflow-y-auto h-full p-4 sm:p-5 md:p-6 pb-20" id="categories-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategoryId}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className="w-full"
          >
            {isLoading || loadingSubCats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={`skel-${idx}`} className="flex flex-col space-y-2">
                    <div className="w-full aspect-square rounded-xl skeleton-shimmer bg-slate-100" />
                    <div className="w-2/3 h-3 skeleton-shimmer rounded bg-slate-200 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* "All Products" Card */}
                <button 
                  onClick={handleMainCategoryHeaderClick}
                  className="flex flex-col group items-center"
                >
                  <div className="w-full aspect-square rounded-xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center transition-all group-hover:shadow-md mb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-800">All Products</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </div>
                </button>

                {/* Sub Categories Cards */}
                {activeSubCategories.map((subCat) => (
                  <button
                    key={subCat.id}
                    onClick={() => handleSubCategoryClick(subCat)}
                    className="flex flex-col group items-center text-center"
                  >
                    <div className="w-full aspect-square rounded-xl bg-slate-50 overflow-hidden shadow-sm transition-all group-hover:shadow-md mb-2">
                       <SmartImage
                          src={subCat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'}
                          alt={subCat.name}
                          aspectRatioClassName="aspect-square"
                          containerClassName="w-full h-full"
                        />
                    </div>
                    <div className="flex items-center gap-1 justify-center w-full">
                      <span className="text-[11px] sm:text-xs font-medium text-slate-700 truncate line-clamp-1">{subCat.name}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

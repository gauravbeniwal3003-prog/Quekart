import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Category, CategoryFilter } from '../types';
import { resetScrollToTop } from '../utils/scroll';

interface CategoriesViewProps {
  categoryFilters?: CategoryFilter[];
  categories?: Category[];
  onSelectCategory: (category: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function CategoriesView({
  categoryFilters,
  categories,
  onSelectCategory,
  onSelectTab: _onSelectTab
}: CategoriesViewProps) {
  const filters = categoryFilters || [];
  const cats = categories || [];

  const [activeFilterId, setActiveFilterId] = useState('');
  const currentActiveId = activeFilterId || filters[0]?.id || '';
  const activeFilter = filters.find((f) => f.id === currentActiveId) || filters[0];

  useEffect(() => {
    resetScrollToTop();
  }, [currentActiveId]);

  // Get the categories assigned to the active filter from database categories
  const assignedCategories = cats.filter((cat) => 
    activeFilter?.categoryIds?.includes(cat.id)
  );

  const handleSubCategoryClick = (subName: string) => {
    onSelectCategory(subName);
  };

  return (
    <div className="flex bg-white flex-1 min-h-0 overflow-hidden max-w-7xl mx-auto w-full" id="categories-view-container">
      {/* Left Column Sidebar - Category Filters */}
      <div className="w-[100px] md:w-[240px] bg-gray-100 border-r border-gray-200/80 overflow-y-auto flex-shrink-0 h-full pb-10" id="categories-sidebar">
        {filters.map((filt) => {
          const isActive = filt.id === currentActiveId;
          return (
            <motion.button
              key={filt.id}
              onClick={() => setActiveFilterId(filt.id)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ x: isActive ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full py-4 px-2 md:px-4 text-center md:text-left flex flex-col md:flex-row items-center gap-1.5 md:gap-3 border-b border-gray-100 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-white text-lucky-magenta font-black border-l-4 border-l-lucky-magenta shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50'
              }`}
              id={`sidebar-item-${filt.id}`}
            >
              {/* Filter Image Circle */}
              <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-transform flex-shrink-0 border ${
                isActive ? 'border-lucky-magenta bg-blue-50 text-lucky-magenta scale-105' : 'border-gray-200 bg-white text-gray-400'
              }`}>
                {filt.image ? (
                  <img
                    src={filt.image}
                    alt={filt.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                ) : filt.id === 'filter-popular' ? (
                  <Sparkles className="w-5 h-5 fill-amber-300 stroke-amber-500 animate-pulse" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </div>
              <span className="text-[10px] md:text-xs leading-tight font-medium max-w-[85px] md:max-w-none line-clamp-2">
                {filt.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Right Column Content Panel */}
      <div className="flex-1 bg-white overflow-y-auto h-full p-4 md:p-6 pb-10" id="categories-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActiveId}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full"
          >
            {assignedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center" id="empty-categories-view">
                <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-xs text-slate-500 font-bold">No categories assigned to this filter yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Assign categories in the Admin Panel Categories section.</p>
              </div>
            ) : (
              <div className="space-y-6" id="assigned-categories-list">
                {assignedCategories.map((cat) => (
                  <div key={cat.id} className="pb-4 last:border-0" id={`category-group-${cat.id}`}>
                    {/* Subcategories bubbles grid directly */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-y-5 gap-x-3">
                      {cat.subCategories?.map((sub, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.85, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleSubCategoryClick(sub.name)}
                          className="flex flex-col items-center cursor-pointer group transition-all"
                          id={`subcategory-item-${cat.id}-${index}`}
                        >
                          {/* Image Circle */}
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-blue-50/50 border border-blue-100/40 p-0.5 flex items-center justify-center shadow-xs">
                            <img
                              src={sub.image || undefined}
                              alt={sub.name}
                              className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300';
                              }}
                            />
                          </div>

                          {/* Label */}
                          <span className="text-[10px] text-gray-600 font-semibold text-center mt-1.5 max-w-[72px] leading-tight line-clamp-2 group-hover:text-lucky-magenta transition-colors">
                            {sub.name}
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

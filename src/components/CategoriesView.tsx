import { useState } from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { mockCategories } from '../data';

interface CategoriesViewProps {
  onSelectCategory: (category: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function CategoriesView({
  onSelectCategory,
  onSelectTab
}: CategoriesViewProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(mockCategories[0].id);

  const activeCategory = mockCategories.find((c) => c.id === activeCategoryId) || mockCategories[0];

  const handleSubCategoryClick = (subName: string) => {
    // When a subcategory circle is clicked, we filter the products by that subCategory name
    // and route back to the 'home' tab
    onSelectCategory(subName);
    onSelectTab('home');
  };

  return (
    <div className="flex bg-gray-50 h-[calc(100vh-130px)] pb-12 overflow-hidden max-w-7xl mx-auto w-full md:px-4" id="categories-view-container">
      {/* Left Column Sidebar */}
      <div className="w-[100px] md:w-[240px] bg-gray-100 border-r border-gray-200 overflow-y-auto flex-shrink-0 h-full" id="categories-sidebar">
        {mockCategories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`w-full py-4 px-2 md:px-4 text-center md:text-left flex flex-col md:flex-row items-center gap-1.5 md:gap-3 border-b border-gray-100 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-lucky-magenta font-black border-l-4 border-l-lucky-magenta shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200/50'
              }`}
              id={`sidebar-item-${cat.id}`}
            >
              {/* Star or simple category indicator icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform flex-shrink-0 ${
                isActive ? 'bg-blue-50 text-lucky-magenta scale-105' : 'bg-white text-gray-400'
              }`}>
                {cat.id === 'cat-popular' ? (
                  <Sparkles className="w-5 h-5 fill-amber-300 stroke-amber-500 animate-pulse" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </div>
              <span className="text-[10px] md:text-xs leading-tight font-medium max-w-[85px] md:max-w-none line-clamp-2">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Column Content Panel */}
      <div className="flex-1 bg-white overflow-y-auto h-full p-4 md:p-6" id="categories-content-panel">
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Popular</span>
          <h2 className="text-sm md:text-base font-extrabold text-gray-800 tracking-tight" id="active-category-title">
            Featured On QueKart
          </h2>
        </div>

        {/* Subcategory circular bubbles list */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-y-5 gap-x-3" id="subcategories-grid">
          {activeCategory.subCategories.map((sub, index) => (
            <button
              key={index}
              onClick={() => handleSubCategoryClick(sub.name)}
              className="flex flex-col items-center cursor-pointer group hover:scale-105 active:scale-95 transition-all"
              id={`subcategory-item-${index}`}
            >
              {/* Image Circle */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-blue-50/50 border border-blue-100/40 p-1 flex items-center justify-center shadow-xs">
                <img
                  src={sub.image}
                  alt={sub.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Label */}
              <span className="text-[10px] md:text-xs text-gray-600 font-semibold text-center mt-1.5 max-w-[72px] md:max-w-[90px] leading-tight line-clamp-2 group-hover:text-lucky-magenta transition-colors">
                {sub.name}
              </span>
            </button>
          ))}
        </div>

        {/* All Popular Banner / Info Box */}
        <div className="mt-8 pt-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/40 to-white p-3 rounded-lg flex items-center justify-between" id="categories-banner">
          <div>
            <span className="text-xs font-bold text-lucky-magenta">Lowest Price Promise</span>
            <p className="text-[9px] text-gray-500 mt-0.5">Top-rated items directly from manufacturers.</p>
          </div>
          <button
            onClick={() => handleSubCategoryClick('All')}
            className="text-[10px] bg-lucky-magenta text-white px-2.5 py-1 rounded-full font-bold cursor-pointer"
          >
            Shop All
          </button>
        </div>
      </div>
    </div>
  );
}

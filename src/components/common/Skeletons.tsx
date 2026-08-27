import React from 'react';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

// 1. Single Product Card Skeleton (Matching exact grid layout of HomeFeed & Category pages)
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 overflow-hidden shadow-3xs flex flex-col h-full animate-fadeIn">
      {/* Image Container Aspect Ratio [4/5] with Liquid Glass shimmer */}
      <div className="aspect-[4/5] w-full skeleton-shimmer relative rounded-t-2xl">
        <div className="absolute top-2 left-2 w-12 h-4 skeleton-shimmer rounded-full bg-white/60 border border-white/80" />
        <div className="absolute top-2 right-2 w-7 h-7 skeleton-shimmer rounded-full bg-white/60 border border-white/80" />
      </div>
      
      {/* Card Content */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Brand/Supplier tag line */}
          <div className="w-16 h-2.5 skeleton-shimmer rounded bg-slate-200/80" />
          {/* Title line 1 */}
          <div className="w-full h-3.5 skeleton-shimmer rounded bg-slate-200/80" />
          {/* Title line 2 */}
          <div className="w-3/4 h-3.5 skeleton-shimmer rounded bg-slate-200/80" />
        </div>

        {/* Pricing line & add to cart button */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100/80">
          <div className="space-y-1">
            <div className="w-20 h-4 skeleton-shimmer rounded bg-slate-300/80" />
            <div className="w-12 h-2.5 skeleton-shimmer rounded bg-slate-200/80" />
          </div>
          <div className="w-16 h-7 skeleton-shimmer rounded-xl bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
};

// 2. Multi Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={`prod-skel-${idx}`} />
      ))}
    </div>
  );
};

// 3. Main Hero Banner Carousel & Double Banners Skeleton
export const BannerSkeleton: React.FC<{ type?: 'main' | 'double' }> = ({ type = 'main' }) => {
  if (type === 'double') {
    return (
      <div className="grid grid-cols-2 gap-2 w-full my-2">
        <div className="aspect-[11/5] w-full rounded-2xl skeleton-shimmer shadow-xs border border-slate-200/60" />
        <div className="aspect-[11/5] w-full rounded-2xl skeleton-shimmer shadow-xs border border-slate-200/60" />
      </div>
    );
  }

  return (
    <div className="w-full aspect-[16/5] rounded-2xl skeleton-shimmer shadow-sm border border-slate-200/80 my-1 relative overflow-hidden">
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="w-24 h-5 skeleton-shimmer rounded-full bg-slate-300/80" />
        <div className="space-y-2 max-w-[60%]">
          <div className="w-full h-5 skeleton-shimmer rounded bg-slate-300/80" />
          <div className="w-2/3 h-4 skeleton-shimmer rounded bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
};

// 4. Category Bubbles Row Skeleton
export const CategoryRowSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={`cat-skel-${idx}`} className="flex flex-col items-center shrink-0 space-y-1.5 w-14">
          <div className="w-12 h-12 rounded-2xl skeleton-shimmer border border-slate-200/60" />
          <div className="w-10 h-2.5 skeleton-shimmer rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
};

// 5. Product Detail Page Skeleton
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fadeIn">
      {/* Top Gallery Shimmer */}
      <div className="aspect-[4/4] sm:aspect-[4/3] w-full rounded-3xl skeleton-shimmer border border-slate-200/80 relative">
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full skeleton-shimmer bg-slate-300/80" />
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full skeleton-shimmer bg-slate-300/80" />
      </div>

      {/* Title & Ratings Block */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs">
        <div className="w-28 h-4 skeleton-shimmer rounded bg-slate-200" />
        <div className="w-3/4 h-6 skeleton-shimmer rounded bg-slate-300" />
        <div className="w-1/2 h-4 skeleton-shimmer rounded bg-slate-200" />
        <div className="pt-2 flex items-center gap-3">
          <div className="w-28 h-8 skeleton-shimmer rounded-xl bg-slate-300" />
          <div className="w-20 h-6 skeleton-shimmer rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Variants & Size Selector Shimmer */}
      <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs">
        <div className="w-32 h-4 skeleton-shimmer rounded bg-slate-200" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`v-skel-${i}`} className="w-12 h-10 rounded-xl skeleton-shimmer bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Cart Item List Skeleton
export const CartItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 flex gap-3 shadow-3xs animate-fadeIn">
      <div className="w-20 h-24 rounded-xl skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-2 flex flex-col justify-between py-1">
        <div className="space-y-1">
          <div className="w-3/4 h-4 skeleton-shimmer rounded bg-slate-300" />
          <div className="w-1/2 h-3 skeleton-shimmer rounded bg-slate-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="w-16 h-4 skeleton-shimmer rounded bg-slate-300" />
          <div className="w-20 h-7 skeleton-shimmer rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

// 7. Order Item Skeleton
export const OrderItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-3xs animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="w-28 h-4 skeleton-shimmer rounded bg-slate-300" />
        <div className="w-20 h-5 skeleton-shimmer rounded-full bg-emerald-100" />
      </div>
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl skeleton-shimmer shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="w-full h-4 skeleton-shimmer rounded bg-slate-300" />
          <div className="w-1/2 h-3 skeleton-shimmer rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
};

// 8. Small Inline Button Spinner for API triggers without layout jump
export const InlineButtonSpinner: React.FC<{ color?: string; size?: number; className?: string }> = ({
  color = 'currentColor',
  size = 16,
  className = ''
}) => {
  return (
    <svg
      className={`btn-spinner inline-block shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

// 9. Localized Empty or Error State (Clean retry trigger instead of endless loading)
export const LocalizedErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Unable to load details. Please try again.', onRetry }) => {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-center space-y-2.5 my-3 shadow-3xs">
      <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
      <p className="text-xs font-semibold text-amber-900">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 bg-amber-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold hover:bg-amber-700 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

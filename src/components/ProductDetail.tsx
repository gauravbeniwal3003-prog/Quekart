import { useState } from 'react';
import { ArrowLeft, Heart, Share2, HelpCircle, ChevronLeft, ChevronRight, ChevronDown, Check, ThumbsUp, ShoppingCart, Play } from 'lucide-react';
import { Product, Review, CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailProps {
  product: Product;
  suggestedProducts: Product[];
  onSelectProduct: (id: string) => void;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, variantIndex: number) => void;
  onDirectBuy: (product: Product, size: string, variantIndex: number) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

export default function ProductDetail({
  product,
  suggestedProducts,
  onSelectProduct,
  onBack,
  onAddToCart,
  onDirectBuy,
  wishlist,
  onToggleWishlist
}: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions[0] || 'Free Size');
  const [[imageIndex, direction], setImagePage] = useState([0, 0]);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Wrap around index to stay in bounds
  const activeImageIndex = ((imageIndex % product.images.length) + product.images.length) % product.images.length;

  const paginate = (newDirection: number) => {
    setImagePage([imageIndex + newDirection, newDirection]);
  };

  const getImageUrl = (index: number) => {
    const wrappedIdx = ((index % product.images.length) + product.images.length) % product.images.length;
    return wrappedIdx === 0 ? currentVariant.imageUrl : product.images[wrappedIdx];
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
      opacity: 0,
    }),
  };
  
  // Track review helps
  const [helpedReviews, setHelpedReviews] = useState<string[]>([]);
  
  // Custom toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentVariant = product.variants[selectedVariantIndex] || {
    imageUrl: product.images[0],
    price: product.price,
    originalPrice: product.originalPrice,
    colorName: 'Default'
  };

  const isWishlisted = wishlist.includes(product.id);

  const handleVariantSelect = (index: number) => {
    setSelectedVariantIndex(index);
    setImagePage([0, 0]); // reset main image to variant image
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize, selectedVariantIndex);
    triggerToast(`Added ${product.title.substring(0, 20)}... to Cart!`);
  };

  const handleBuyNowClick = () => {
    onDirectBuy(product, selectedSize, selectedVariantIndex);
  };

  const toggleHelpful = (reviewId: string) => {
    if (helpedReviews.includes(reviewId)) {
      setHelpedReviews(helpedReviews.filter(id => id !== reviewId));
    } else {
      setHelpedReviews([...helpedReviews, reviewId]);
    }
  };

  // Replicating customer photo gallery matching Screenshot 1
  const customerUploadedPhotos = [
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1434056886845-dac89ffee9b5?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=300',
  ];

  return (
    <div className="bg-gray-100 min-h-screen pb-24 relative" id="product-detail-page">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs py-2 px-4 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <Check className="w-4 h-4 text-lucky-green" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back / Action Header */}
      <div className="bg-white sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-gray-100" id="detail-header">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer" id="back-btn">
          <ArrowLeft className="w-6 h-6 text-gray-800 stroke-[2.5]" />
        </button>

        <div className="flex items-center gap-4 text-gray-700">
          <button
            onClick={() => onToggleWishlist(product.id)}
            className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
            id="detail-wishlist-btn"
          >
            <Heart className={`w-6 h-6 stroke-2 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
          </button>
          <button
            onClick={() => triggerToast("Product Link Copied! Share with friends.")}
            className="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
            id="detail-share-btn"
          >
            <Share2 className="w-6 h-6 text-gray-700 stroke-2" />
          </button>
        </div>
      </div>

      {/* Responsive layout wrapper */}
      <div className="max-w-7xl mx-auto w-full px-0 md:px-6 py-0 md:py-6 flex flex-col md:flex-row gap-6" id="product-detail-flex-container">
        
        {/* Left column (Image, swatches, trust badges, real customer photos) */}
        <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col gap-3 md:sticky md:top-24 h-fit" id="product-detail-left-col">
          
          {/* Main product photo viewport */}
          <div className="bg-white p-4 relative flex flex-col items-center border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="main-image-viewport">
            <div className="relative aspect-square w-full max-w-[340px] md:max-w-[420px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 group">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={imageIndex}
                  src={getImageUrl(imageIndex)}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(e, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      paginate(1);
                    } else if (info.offset.x > swipeThreshold) {
                      paginate(-1);
                    }
                  }}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover select-none cursor-grab active:cursor-grabbing"
                  id="detail-main-image"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Desktop slide arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      paginate(-1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 hidden md:flex"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      paginate(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-0 group-hover:opacity-100 hidden md:flex"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </>
              )}

              {/* More Like This floating button overlay */}
              <button
                onClick={() => triggerToast("Showing visually similar items...")}
                className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-xs border border-gray-200 text-gray-800 text-xs font-bold px-3 py-2 rounded-full shadow-md flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
                id="more-like-this-overlay"
              >
                <span className="text-sm">+</span>
                <span>More Like This</span>
              </button>
            </div>

            {/* Carousel Dots indicator */}
            <div className="flex items-center gap-1.5 mt-3" id="carousel-dots">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const diff = idx - activeImageIndex;
                    if (diff !== 0) {
                      setImagePage([idx, diff > 0 ? 1 : -1]);
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'w-6 bg-lucky-magenta' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Color / Variant Swatches */}
          <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="variants-swatches-section">
            <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">Select Variant</span>
            <div className="flex gap-2.5 mt-2 overflow-x-auto py-1 scrollbar-hide" id="variants-swatches-row">
              {product.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVariantSelect(idx)}
                  className={`w-[60px] flex-shrink-0 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all p-0.5 bg-white shadow-xs cursor-pointer ${
                    selectedVariantIndex === idx ? 'border-lucky-magenta scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  id={`variant-swatch-${idx}`}
                >
                  <img
                    src={v.imageUrl}
                    alt={v.colorName}
                    className="w-full h-full object-cover rounded-sm"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Selected: <span className="font-bold text-gray-700">{currentVariant.colorName}</span>
            </p>
          </div>

          {/* Trust Badges - Lucky Quality Indicators */}
          <div className="grid grid-cols-3 bg-white border-y border-gray-100/80 md:border md:rounded-xl p-4 text-center" id="trust-indicators-grid">
            <div className="flex flex-col items-center justify-center py-1">
              <div className="w-12 h-12 rounded-full bg-[#E8F0F8] text-[#17436B] flex items-center justify-center mb-2 shadow-2xs hover:scale-105 transition-transform">
                <span className="font-black text-base font-sans">7</span>
              </div>
              <span className="text-[11px] md:text-xs font-extrabold text-[#1e293b] leading-tight mb-0.5">7 Days Return</span>
              <span className="text-[10px] text-slate-400 font-bold">Easy Policy</span>
            </div>
            <div className="flex flex-col items-center justify-center py-1 border-x border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center mb-2 shadow-2xs hover:scale-105 transition-transform">
                <span className="font-black text-lg">₹</span>
              </div>
              <span className="text-[11px] md:text-xs font-extrabold text-[#1e293b] leading-tight mb-0.5">COD Available</span>
              <span className="text-[10px] text-slate-400 font-bold">Pay on Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center py-1">
              <div className="w-12 h-12 rounded-full bg-[#fffbeb] text-[#d97706] flex items-center justify-center mb-2 shadow-2xs hover:scale-105 transition-transform">
                <span className="font-black text-base">★</span>
              </div>
              <span className="text-[11px] md:text-xs font-extrabold text-[#1e293b] leading-tight mb-0.5">Lowest Price</span>
              <span className="text-[10px] text-slate-400 font-bold">Direct Factory</span>
            </div>
          </div>

          {/* Real Photos List (Screenshot 1) - Desktop only (placed on left) */}
          <div className="hidden md:block bg-white p-4 border border-gray-200 rounded-xl shadow-3xs" id="real-photos-section-desktop">
            <h3 className="text-xs font-bold text-gray-700 tracking-tight mb-2 uppercase">Real Customer Photos (157)</h3>
            <div className="flex gap-2.5 overflow-x-auto py-1.5 scrollbar-hide" id="real-photos-row">
              {customerUploadedPhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-3xs cursor-pointer hover:opacity-90 relative"
                  onClick={() => triggerToast(`Opening review image ${idx+1} full view`)}
                  id={`customer-photo-desktop-${idx}`}
                >
                  <img src={photoUrl} alt="User Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {idx === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                      <span className="font-extrabold text-sm text-center font-sans">+153</span>
                      <span className="text-[8px] font-semibold text-center uppercase tracking-wider">More</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (Pricing details, action buttons, size selector, seller card, reviews) */}
        <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col gap-3" id="product-detail-right-col">
          
          {/* Product Information Card */}
          <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs overflow-hidden" id="pricing-info-card">
            <h1 className="text-sm md:text-base font-semibold text-gray-700 leading-snug break-words overflow-hidden" id="detail-title">
              {product.title}
            </h1>

            {/* Price grid - Real Lucky Style */}
            <div className="flex items-baseline gap-2 mt-2 flex-wrap" id="detail-prices">
              <span className="text-2xl md:text-3xl font-black text-slate-900 premium-rupee">
                ₹{currentVariant.price}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">
                ₹{currentVariant.originalPrice}
              </span>
              <span className="text-sm text-lucky-green font-extrabold tracking-tight">
                {product.discountPercent}% off
              </span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors" title="Pricing Details">
                <HelpCircle className="w-4 h-4 inline" />
              </button>
            </div>

            {/* UPI Offer banner */}
            {product.hasUpiOffer && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/20 border border-blue-200/60 rounded-lg p-2.5 mt-3 flex items-center justify-between shadow-3xs" id="upi-banner">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center">
                    <span className="bg-emerald-500 text-white font-black text-[10px] w-5 h-5 rounded-xs flex items-center justify-center rotate-12 shadow-3xs">▲</span>
                    <span className="bg-yellow-500 text-white font-black text-[10px] w-5 h-5 rounded-xs flex items-center justify-center -translate-x-1.5 -rotate-12 shadow-3xs">▶</span>
                  </div>
                  <span className="text-xs text-blue-950 font-extrabold tracking-tight">
                    UPI Offer applied for you! Extra discount at checkout
                  </span>
                </div>
                <span className="text-[9px] badge-gradient-magenta font-black px-2 py-0.5 rounded-sm shadow-3xs">APPLIED</span>
              </div>
            )}

            {/* COD prices */}
            <div className="text-xs text-slate-700 font-extrabold mt-2.5 bg-slate-100/60 p-2 rounded-lg inline-flex items-center gap-1 border border-slate-200/50">
              <span className="text-emerald-600 font-black">✔</span>
              <span>₹{product.codPrice} with Cash on Delivery (COD)</span>
            </div>

            {/* Rating and reviewer aggregate indicators */}
            <div className="flex items-center gap-2.5 mt-3.5" id="aggregate-review-summary">
              <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-3xs">
                {product.rating} <span className="gold-star-glow text-[11px]">★</span>
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {product.ratingCount.toLocaleString()} Ratings & {product.reviewCount.toLocaleString()} Reviews
              </span>
            </div>
          </div>

          {/* Select Size Section */}
          <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="size-selector-section">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-gray-800 tracking-tight uppercase">Select Size</span>
              <button className="text-[10px] text-lucky-magenta font-extrabold hover:underline" onClick={() => triggerToast("Standard fit size chart matches all.")}>
                Size Chart
              </button>
            </div>
            <div className="flex gap-2.5 flex-wrap" id="size-options-row">
              {product.sizeOptions.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'border-lucky-magenta text-lucky-magenta bg-blue-50 scale-105 shadow-2xs font-extrabold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  id={`size-pill-${sz}`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons ONLY visible on Laptop/Tablet/Desktop screens - matches professional layout */}
          <div className="hidden md:flex gap-4 my-2" id="desktop-action-buttons">
            {/* Add to Cart Outline */}
            <button
              onClick={handleAddToCartClick}
              className="flex-1 border-2 border-lucky-magenta bg-white hover:bg-blue-50/20 text-lucky-magenta font-black py-3 px-4 rounded-md text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-98 shadow-xs"
              id="add-to-cart-desktop-btn"
            >
              <ShoppingCart className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Add to Cart</span>
            </button>

            {/* Buy Now Solid */}
            <button
              onClick={handleBuyNowClick}
              className="flex-1 bg-lucky-magenta hover:bg-opacity-95 text-white font-black py-3 px-4 rounded-md text-sm text-center flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-md"
              id="buy-now-desktop-btn"
            >
              <span className="flex items-center mr-1">
                <Play className="w-3.5 h-3.5 fill-current rotate-0" />
                <Play className="w-3.5 h-3.5 fill-current rotate-0 -ml-1" />
              </span>
              <span>Buy Now</span>
            </button>
          </div>

          {/* Sold By Card Block */}
          <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" id="sold-by-card" onClick={() => triggerToast(`Navigating to seller page of ${product.soldBy}...`)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <span className="font-bold text-gray-500 text-xs">🏪</span>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Sold by</p>
                <h3 className="text-xs font-extrabold text-gray-800 tracking-tight">{product.soldBy}</h3>
                <span className="badge-gradient-magenta font-extrabold text-[9px] px-2 py-0.5 rounded-full inline-block mt-1">
                  ★ {product.soldByRating} Rated Seller
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Product Highlights Section */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="product-highlights-panel">
            <button
              onClick={() => setIsHighlightsExpanded(!isHighlightsExpanded)}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
              id="toggle-highlights-btn"
            >
              <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">Product Highlights</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isHighlightsExpanded ? 'rotate-185' : ''}`} />
            </button>

            {isHighlightsExpanded && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-50 pt-3" id="highlights-body">
                {product.productHighlights.map((hl, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="text-gray-400 block font-medium text-[10px]">{hl.label}</span>
                    <span className="text-gray-800 font-semibold">{hl.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Details Section */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="additional-details-panel">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left"
              id="toggle-details-btn"
            >
              <span className="text-xs font-bold text-gray-800 uppercase tracking-tight">Additional Details</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDetailsExpanded ? 'rotate-185' : ''}`} />
            </button>

            {isDetailsExpanded && (
              <div className="px-4 pb-4 grid grid-cols-1 gap-2.5 border-t border-gray-50 pt-3" id="details-body">
                {product.additionalDetails.map((det, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">{det.label}</span>
                    <span className="text-gray-800 font-semibold text-right">{det.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Products */}
          {suggestedProducts.length > 0 && (
            <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="suggested-products-section">
              <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">Suggested Products</span>
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedProducts.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => onSelectProduct(p.id)}
                    className="w-[120px] flex-shrink-0 cursor-pointer group"
                  >
                    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-2 border border-gray-100 relative">
                      <img 
                        src={p.images[0]} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {p.discountPercent > 0 && (
                        <div className="absolute bottom-0 left-0 bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-lucky-magenta border-tr-lg">
                          {p.discountPercent}% OFF
                        </div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-lucky-magenta transition-colors">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-black text-gray-900">₹{p.price}</span>
                      <span className="text-[9px] text-gray-400 line-through">₹{p.originalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Ratings & Reviews Card Section (Screenshot 1 & 2) */}
          <div className="bg-white p-4 border-b md:border border-gray-200 md:rounded-xl md:shadow-3xs" id="ratings-reviews-card">
            <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-tight mb-3">Customer Ratings & Reviews</h2>

            {/* Rating Breakdown Graph */}
            <div className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100" id="rating-breakdown-box">
              {/* Big Green Box */}
              <div className="col-span-5 flex flex-col items-center justify-center border-r border-gray-200/80 pr-1 text-center">
                <span className="bg-emerald-600 text-white font-extrabold text-2xl px-4 py-2 rounded-lg flex items-center gap-1 shadow-xs">
                  {product.rating} <span className="gold-star-glow text-lg">★</span>
                </span>
                <span className="text-[11px] text-gray-500 font-bold mt-2 leading-none">
                  {product.ratingCount.toLocaleString()} ratings
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  {product.reviewCount.toLocaleString()} reviews
                </span>
              </div>

              {/* Bar Chart Columns */}
              <div className="col-span-7 flex flex-col gap-1.5 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-14 text-left font-bold text-[10px] text-gray-500 uppercase">Very Good</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-lucky-green h-full rounded-full" style={{ width: '56.8%' }}></div>
                  </div>
                  <span className="w-7 text-right text-[10px] font-bold text-gray-400">712</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-left font-bold text-[10px] text-gray-500 uppercase">Good</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '17.7%' }}></div>
                  </div>
                  <span className="w-7 text-right text-[10px] font-bold text-gray-400">223</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-left font-bold text-[10px] text-gray-500 uppercase">Ok-Ok</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '8.8%' }}></div>
                  </div>
                  <span className="w-7 text-right text-[10px] font-bold text-gray-400">111</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-left font-bold text-[10px] text-gray-500 uppercase">Bad</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-400 h-full rounded-full" style={{ width: '4.4%' }}></div>
                  </div>
                  <span className="w-7 text-right text-[10px] font-bold text-gray-400">56</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-left font-bold text-[10px] text-gray-500 uppercase">Very Bad</span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '12.0%' }}></div>
                  </div>
                  <span className="w-7 text-right text-[10px] font-bold text-gray-400">151</span>
                </div>
              </div>
            </div>

            {/* Real Photos List (Screenshot 1) - Mobile only (under stats) */}
            <div className="mt-5 md:hidden" id="real-photos-section">
              <h3 className="text-xs font-bold text-gray-700 tracking-tight mb-2 uppercase">Real Photos (157)</h3>
              <div className="flex gap-2.5 overflow-x-auto py-1.5 scrollbar-hide" id="real-photos-row">
                {customerUploadedPhotos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 shadow-3xs cursor-pointer hover:opacity-90 relative"
                    onClick={() => triggerToast(`Opening review image ${idx+1} full view`)}
                    id={`customer-photo-${idx}`}
                  >
                    <img src={photoUrl} alt="User Review" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {idx === 3 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <span className="font-extrabold text-sm text-center font-sans">+153</span>
                        <span className="text-[8px] font-semibold text-center uppercase tracking-wider">More</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Customer reviews listing */}
            <div className="mt-5 border-t border-gray-100 pt-4" id="reviews-list">
              {product.reviews.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No review details available for this product yet. Be the first to write!</p>
              ) : (
                <div className="flex flex-col gap-5">
                  {product.reviews.map((rev) => {
                    const isHelped = helpedReviews.includes(rev.id);
                    return (
                      <div key={rev.id} className="border-b border-gray-100 pb-4 last:border-0" id={`review-item-${rev.id}`}>
                        {/* User profile header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Star Rating pill */}
                            <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-3xs">
                              {rev.rating} <span className="gold-star-glow text-[9px]">★</span>
                            </span>
                            {/* Title text */}
                            <span className="text-xs font-bold text-gray-800">{rev.title}</span>
                            <span className="text-gray-300 text-xs">•</span>
                            {/* Date */}
                            <span className="text-[10px] text-gray-400 font-semibold">{rev.postedDate}</span>
                          </div>
                        </div>

                        {/* Comment text body with 'Read More' mock */}
                        <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                          ✨ {rev.comment}
                          <span className="text-lucky-magenta font-extrabold cursor-pointer ml-1 hover:underline">...Read More</span>
                        </p>

                        {/* Customer attached thumbnails (Screenshot 1) */}
                        {rev.images.length > 0 && (
                          <div className="flex gap-2 mt-2.5">
                            {rev.images.map((imgUrl, i) => (
                              <div key={i} className="w-14 h-14 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 cursor-pointer">
                                <img src={imgUrl} alt="Att" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reviewer name signature */}
                        <div className="text-[10px] text-gray-400 font-bold mt-2 italic">
                          ~{rev.userName}
                        </div>

                        {/* Helpful Button Row */}
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => toggleHelpful(rev.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                              isHelped
                                ? 'bg-blue-50 border-lucky-magenta text-lucky-magenta scale-105'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            id={`help-btn-${rev.id}`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isHelped ? 'fill-blue-500' : ''}`} />
                            <span>Helpful ({rev.helpfulCount + (isHelped ? 1 : 0)})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Row Buttons (Add to Cart / Buy Now) - Hidden on md+ (Desktop/Laptop) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-2.5 flex md:hidden gap-2.5 shadow-xl md:max-w-md md:mx-auto" id="sticky-checkout-bar">
        {/* Add to Cart Outline */}
        <button
          onClick={handleAddToCartClick}
          className="flex-1 border border-lucky-magenta bg-white text-lucky-magenta font-black py-3 px-4 rounded-md text-sm text-center flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50/30 transition-colors active:scale-98"
          id="add-to-cart-sticky-btn"
        >
          <ShoppingCart className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Add to Cart</span>
        </button>

        {/* Buy Now Solid */}
        <button
          onClick={handleBuyNowClick}
          className="flex-1 bg-lucky-magenta hover:bg-opacity-95 text-white font-black py-3 px-4 rounded-md text-sm text-center flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98 shadow-md"
          id="buy-now-sticky-btn"
        >
          {/* Double Right Arrow visual */}
          <span className="flex items-center mr-1">
            <Play className="w-3.5 h-3.5 fill-current rotate-0" />
            <Play className="w-3.5 h-3.5 fill-current rotate-0 -ml-1" />
          </span>
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}

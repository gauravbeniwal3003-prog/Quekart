import React, { useState, useMemo, useRef, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import { resetScrollToTop } from '../utils/scroll';
import { getProductPricing } from '../utils/pricing';
import Logo, { BrandLogo } from './Logo';
import { SmartImage } from './common/SmartImage';
import { InlineButtonSpinner } from './common/Skeletons';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Heart, 
  Share2, 
  Search, 
  ShoppingCart, 
  Package, 
  Banknote, 
  Tag, 
  ThumbsUp, 
  Check, 
  Info, 
  Sparkles, 
  Languages, 
  Star, 
  Play,
  X,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle,
  MessageSquare,
  Loader2,
  Eye,
  Zap,
  Edit3,
  UserCheck,
  ShieldCheck,
  Trash2,
  ZoomIn,
  Store,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle
} from 'lucide-react';
import { Product, Review, Order, CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getColorHexFromName } from '../utils/colorUtils';
import { trackProductView, trackProductCartAdd } from '../utils/analytics';

interface ProductDetailProps {
  product: Product;
  suggestedProducts: Product[];
  onSelectProduct: (id: string) => void;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, variantIndex: number, quantity?: number) => void;
  onDirectBuy: (product: Product, size: string, variantIndex: number, quantity?: number) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentUser?: any;
  orders?: Order[];
  onRequireLogin?: (actionTitle?: string, actionDesc?: string) => void;
  onProductUpdated?: (updatedProduct: Product) => void;
  onVisitStore?: (vendorId?: string, vendorName?: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onSearch?: (query: string) => void;
}

export default function ProductDetail({
  product,
  suggestedProducts,
  onSelectProduct,
  onBack,
  onAddToCart,
  onDirectBuy,
  wishlist,
  onToggleWishlist,
  currentUser,
  orders = [],
  onRequireLogin,
  onProductUpdated,
  onVisitStore,
  cartCount = 0,
  onOpenCart,
  onOpenWishlist,
  onSearch
}: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState((product.sizeOptions && product.sizeOptions[0]) || 'Free Size');
  const [quantity, setQuantity] = useState(1);
  const [activeDetailTab, setActiveDetailTab] = useState<'specification' | 'reviews'>('specification');
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isHighlightsExpanded, setIsHighlightsExpanded] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [showSpecialOfferModal, setShowSpecialOfferModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearchText, setLocalSearchText] = useState('');
  
  // Custom toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Helpful Review Voting & Sorting State (One account se One vote)
  const [votingReviewIds, setVotingReviewIds] = useState<string[]>([]);
  const [reviewSortBy, setReviewSortBy] = useState<'helpful' | 'recent' | 'highest' | 'lowest'>('helpful');

  // Write/Edit Review Modal & Form State
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [photoPreviewModal, setPhotoPreviewModal] = useState<string | null>(null);

  // Sticky Bottom CTA Scroll-triggered Animation States
  const inlineContainerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsSticky(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px"
      }
    );

    const currentRef = inlineContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isMobile, product.id]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentVariant = product.variants && product.variants[selectedVariantIndex] ? product.variants[selectedVariantIndex] : {
    imageUrl: (product.images && product.images[0]) || '',
    price: product.price,
    originalPrice: product.originalPrice,
    colorName: 'Default',
    stock: product.stock ?? 100,
    sizeStock: product.sizeStock
  };

  const selectedSizeStock = useMemo(() => {
    if (currentVariant.sizeStock && typeof currentVariant.sizeStock[selectedSize] === 'number') {
      return currentVariant.sizeStock[selectedSize];
    }
    if (product.sizeStock && typeof product.sizeStock[selectedSize] === 'number') {
      return product.sizeStock[selectedSize];
    }
    return typeof currentVariant.stock === 'number' ? currentVariant.stock : (typeof product.stock === 'number' ? product.stock : 100);
  }, [product.sizeStock, product.stock, currentVariant, selectedSize]);

  const isSelectedSizeOutOfStock = selectedSizeStock === 0;

  // Compile full list of distinct valid product images
  const allImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return currentVariant.imageUrl ? [currentVariant.imageUrl] : [];
  }, [product.images, currentVariant.imageUrl]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);

  const isWishlisted = wishlist.includes(product.id);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeImageIndex > 0) {
      setSlideDirection(-1);
      setActiveImageIndex(prev => prev - 1);
    }
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeImageIndex < allImages.length - 1) {
      setSlideDirection(1);
      setActiveImageIndex(prev => prev + 1);
    }
  };

  const handleSelectImageIndex = (idx: number) => {
    if (idx >= 0 && idx < allImages.length && idx !== activeImageIndex) {
      setSlideDirection(idx > activeImageIndex ? 1 : -1);
      setActiveImageIndex(idx);
    }
  };

  // Touch & Mouse swipe support for images
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const isSwipeDragging = useRef<boolean>(false);

  const handleSwipeStart = (clientX: number, clientY: number) => {
    if (allImages.length <= 1) return;
    swipeStartX.current = clientX;
    swipeStartY.current = clientY;
    isSwipeDragging.current = true;
  };

  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!isSwipeDragging.current || swipeStartX.current === null) return;
  };

  const handleSwipeEnd = (clientX: number, clientY: number) => {
    if (!isSwipeDragging.current || swipeStartX.current === null || swipeStartY.current === null) return;

    const diffX = swipeStartX.current - clientX;
    const diffY = swipeStartY.current - clientY;

    // Threshold of 40px for swipe gesture
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        if (activeImageIndex < allImages.length - 1) {
          handleNextImage();
        }
      } else {
        if (activeImageIndex > 0) {
          handlePrevImage();
        }
      }
    }

    // Reset
    isSwipeDragging.current = false;
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  // Touch event adapters
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleSwipeStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeDragging.current) return;
    const touch = e.touches[0];
    handleSwipeMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const touch = e.changedTouches[0];
      handleSwipeEnd(touch.clientX, touch.clientY);
    } else {
      isSwipeDragging.current = false;
      swipeStartX.current = null;
      swipeStartY.current = null;
    }
  };

  // Mouse event adapters (supports clicking & dragging on desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    if (allImages.length <= 1) return;
    // Avoid interfering with buttons
    if ((e.target as HTMLElement).closest('button')) return;
    handleSwipeStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isSwipeDragging.current) return;
    e.preventDefault(); // Prevents image ghosting/drag selection behavior
    handleSwipeMove(e.clientX, e.clientY);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    handleSwipeEnd(e.clientX, e.clientY);
  };

  const onMouseLeave = () => {
    isSwipeDragging.current = false;
    swipeStartX.current = null;
    swipeStartY.current = null;
  };

  // Handle color swatch click -> Select variant and auto-swipe to linked image
  const handleSelectColorVariant = (idx: number) => {
    setSelectedVariantIndex(idx);
    const v = product.variants?.[idx];
    if (!v) return;

    if (typeof v.imageIndex === 'number' && v.imageIndex >= 0 && v.imageIndex < allImages.length) {
      if (v.imageIndex !== activeImageIndex) {
        setSlideDirection(v.imageIndex > activeImageIndex ? 1 : -1);
        setActiveImageIndex(v.imageIndex);
      }
    } else if (v.imageUrl) {
      const matchIdx = allImages.findIndex(img => img === v.imageUrl);
      if (matchIdx !== -1 && matchIdx !== activeImageIndex) {
        setSlideDirection(matchIdx > activeImageIndex ? 1 : -1);
        setActiveImageIndex(matchIdx);
      }
    }
  };

  // Track product detail view when component mounts or product ID changes
  useEffect(() => {
    if (product && product.id) {
      trackProductView(product.id);
    }
  }, [product?.id]);

  const handleAddToCartClick = () => {
    if (isSelectedSizeOutOfStock) {
      triggerToast(`Sorry! Size "${selectedSize}" is currently out of stock.`);
      return;
    }
    if (!currentUser && onRequireLogin) {
      onRequireLogin('Add to Cart', 'Sign in to add items to your shopping cart and enjoy member discounts.');
      return;
    }
    trackProductCartAdd(product.id);
    onAddToCart(product, selectedSize, selectedVariantIndex, quantity);
    triggerToast(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to Cart!`);
  };

  const handleBuyNowClick = () => {
    if (isSelectedSizeOutOfStock) {
      triggerToast(`Sorry! Size "${selectedSize}" is currently out of stock.`);
      return;
    }
    if (!currentUser && onRequireLogin) {
      onRequireLogin('Buy Now', 'Sign in with your mobile number to complete your checkout.');
      return;
    }
    onDirectBuy(product, selectedSize, selectedVariantIndex, quantity);
  };

  const handleWishlistToggle = () => {
    if (!currentUser && onRequireLogin) {
      onRequireLogin('Save to Wishlist', 'Sign in to save products to your personal wishlist.');
      return;
    }
    onToggleWishlist(product.id);
    triggerToast(isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist');
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Quekart at just ₹${currentVariant.price}!`,
        url: window.location.href
      }).catch(() => {
        triggerToast("Product link copied!");
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      triggerToast("Product link copied to clipboard!");
    }
  };

  // Special offer price calculation (e.g. ₹47 with 1 Special Offer)
  const specialOfferDiscount = Math.min(26, Math.round(currentVariant.price * 0.25)) || 20;
  const specialOfferPrice = Math.max(1, currentVariant.price - specialOfferDiscount);

  // Return & policy info
  const returnPolicyType = product.returnPolicyType || 'return';
  const returnDays = product.returnDays ?? 7;
  const isCodAvailable = product.isCodAvailable !== false;

  // Real Original Reviews Source of Truth
  const displayReviews: Review[] = useMemo(() => {
    if (Array.isArray(product.reviews)) {
      return product.reviews;
    }
    return [];
  }, [product.reviews]);

  // Checks if the current user has placed an order for this specific product ID
  const isCurrentUserVerifiedBuyer = useMemo(() => {
    if (!currentUser || !orders || orders.length === 0) return false;
    const cleanUserPhone = currentUser.phone ? String(currentUser.phone).replace(/[^\d]/g, '').slice(-10) : '';

    return orders.some((ord: Order) => {
      if (!ord || !Array.isArray(ord.items)) return false;
      const hasProduct = ord.items.some((item: CartItem) =>
        item.product?.id === product.id ||
        (product.numericId && item.product?.numericId === product.numericId) ||
        item.id?.startsWith(product.id)
      );
      if (!hasProduct) return false;

      const matchesUserId = currentUser.id && ord.userId && ord.userId === currentUser.id;
      const orderPhoneClean = ord.shippingAddress?.phone ? String(ord.shippingAddress.phone).replace(/[^\d]/g, '').slice(-10) : '';
      const matchesPhone = cleanUserPhone && orderPhoneClean && orderPhoneClean === cleanUserPhone;
      const matchesEmail = currentUser.email && ord.userEmail && ord.userEmail.toLowerCase() === String(currentUser.email).toLowerCase();

      return matchesUserId || matchesPhone || matchesEmail;
    });
  }, [currentUser, orders, product.id, product.numericId]);

  // Helper to check if a specific review was submitted by a verified buyer for this product
  const checkIsReviewVerified = (rev: Review) => {
    if (rev.isVerifiedPurchase === true) return true;
    if (orders && orders.length > 0) {
      const cleanRevPhone = rev.userPhone ? String(rev.userPhone).replace(/[^\d]/g, '').slice(-10) : '';
      return orders.some((ord: Order) => {
        if (!ord || !Array.isArray(ord.items)) return false;
        const hasProduct = ord.items.some((item: CartItem) =>
          item.product?.id === product.id ||
          (product.numericId && item.product?.numericId === product.numericId) ||
          item.id?.startsWith(product.id)
        );
        if (!hasProduct) return false;

        const matchesUserId = rev.userId && ord.userId && ord.userId === rev.userId;
        const orderPhoneClean = ord.shippingAddress?.phone ? String(ord.shippingAddress.phone).replace(/[^\d]/g, '').slice(-10) : '';
        const matchesPhone = cleanRevPhone && orderPhoneClean && orderPhoneClean === cleanRevPhone;
        const matchesEmail = rev.userEmail && ord.userEmail && ord.userEmail.toLowerCase() === String(rev.userEmail).toLowerCase();

        return matchesUserId || matchesPhone || matchesEmail;
      });
    }
    return false;
  };

  // Check if current user has voted on this review (One account se One vote)
  const hasUserVotedHelpful = (rev: Review) => {
    if (!currentUser) return false;
    const helpfulUsers = Array.isArray(rev.helpfulUsers) ? rev.helpfulUsers : [];
    const cleanPhone = currentUser.phone ? String(currentUser.phone).replace(/[^\d]/g, '').slice(-10) : '';
    return (
      (currentUser.id && helpfulUsers.includes(currentUser.id)) ||
      (currentUser.phone && helpfulUsers.includes(currentUser.phone)) ||
      (cleanPhone && helpfulUsers.some(u => u.includes(cleanPhone)))
    );
  };

  // Toggle Helpful vote with sign-in check and 1 vote per account enforcement
  const handleToggleHelpful = async (rev: Review) => {
    // 1. Strict sign-in enforcement: thumbs up only after sign in
    if (!currentUser) {
      if (onRequireLogin) {
        onRequireLogin('Helpful Review Voting', 'Please sign in with your mobile number to vote reviews as helpful.');
      } else {
        triggerToast('Please sign in to vote reviews as helpful.');
      }
      return;
    }

    if (votingReviewIds.includes(rev.id)) return;

    setVotingReviewIds(prev => [...prev, rev.id]);

    try {
      const res = await fetch(`/api/products/${product.id}/reviews/${rev.id}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userPhone: currentUser.phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register helpful vote');
      }

      if (data.product) {
        onProductUpdated?.(data.product);
      }

      triggerToast(data.message || (data.voted ? 'Marked as helpful!' : 'Helpful vote removed'));
    } catch (err: any) {
      console.error('Helpful review vote error:', err);
      triggerToast(err.message || 'Could not update helpful vote.');
    } finally {
      setVotingReviewIds(prev => prev.filter(id => id !== rev.id));
    }
  };

  // Sorted reviews list (Most Helpful default so top feedback rises to top)
  const sortedReviews = useMemo(() => {
    const list = [...displayReviews];
    if (reviewSortBy === 'helpful') {
      return list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    }
    if (reviewSortBy === 'highest') {
      return list.sort((a, b) => b.rating - a.rating);
    }
    if (reviewSortBy === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating);
    }
    // 'recent'
    return list;
  }, [displayReviews, reviewSortBy]);

  // Real Dynamic Rating Calculation based on genuine product reviews
  const realRatingData = useMemo(() => {
    const totalReviews = displayReviews.length;
    
    if (totalReviews > 0) {
      const sum = displayReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Number((sum / totalReviews).toFixed(1));
      
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      displayReviews.forEach(r => {
        const star = Math.max(1, Math.min(5, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
        counts[star] = (counts[star] || 0) + 1;
      });

      const percentages = {
        5: Math.round((counts[5] / totalReviews) * 100),
        4: Math.round((counts[4] / totalReviews) * 100),
        3: Math.round((counts[3] / totalReviews) * 100),
        2: Math.round((counts[2] / totalReviews) * 100),
        1: Math.round((counts[1] / totalReviews) * 100),
      };

      return {
        avgRating: avg,
        ratingCount: totalReviews,
        reviewCount: totalReviews,
        counts,
        percentages,
        hasRatings: true
      };
    }

    return {
      avgRating: 0,
      ratingCount: 0,
      reviewCount: 0,
      counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      hasRatings: false
    };
  }, [displayReviews]);

  // Dynamic Seller/Store metrics across catalog
  const sellerStats = useMemo(() => {
    const sellerName = product.soldBy || '';
    const vendorId = product.vendorId || '';

    const sellerProducts = (suggestedProducts || []).filter(p => {
      const matchId = vendorId && p.vendorId && p.vendorId === vendorId;
      const matchName = sellerName && p.soldBy && p.soldBy.toLowerCase() === sellerName.toLowerCase();
      return matchId || matchName;
    });

    if (!sellerProducts.some(p => p.id === product.id)) {
      sellerProducts.push(product);
    }

    let totalReviews = 0;
    let totalScore = 0;
    let ratedCount = 0;

    sellerProducts.forEach(p => {
      const revs = Array.isArray(p.reviews) ? p.reviews.length : (p.reviewCount || (p as any).reviewsCount || 0);
      totalReviews += revs;
      if (p.rating && p.rating > 0) {
        totalScore += p.rating;
        ratedCount++;
      }
    });

    if (realRatingData.reviewCount > totalReviews) {
      totalReviews = realRatingData.reviewCount;
    }

    const calculatedRating = realRatingData.hasRatings
      ? realRatingData.avgRating
      : (ratedCount > 0
          ? Number((totalScore / ratedCount).toFixed(1))
          : (product.rating ? Number(product.rating) : 4.5));

    return {
      productCount: sellerProducts.length,
      reviewCount: totalReviews,
      rating: calculatedRating.toFixed(1)
    };
  }, [product, suggestedProducts, realRatingData]);

  // Handle Photo Upload via ImgBB
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    const totalFiles = files.length;
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setUploadStatusText(`Uploading photo ${i + 1} of ${totalFiles}...`);

      try {
        // Read as base64
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // 1. Try server proxy endpoint
        let uploadedUrl = '';
        try {
          const res = await fetch(getApiUrl('/api/upload-image'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.imageUrl) {
              uploadedUrl = data.imageUrl;
            }
          }
        } catch (serverErr) {
          console.warn('Server upload proxy fallback to direct ImgBB:', serverErr);
        }

        // 2. Direct ImgBB fallback if server proxy was unavailable
        if (!uploadedUrl) {
          const rawBase64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
          const formData = new URLSearchParams();
          formData.append('image', rawBase64);
          
          const imgbbRes = await fetch('https://api.imgbb.com/1/upload?key=55179f3e39711f9b8a5f1b568b5567a9', {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          if (imgbbRes.ok) {
            const imgbbData = await imgbbRes.json();
            if (imgbbData?.data?.url) {
              uploadedUrl = imgbbData.data.url;
            }
          }
        }

        if (uploadedUrl) {
          newUploadedUrls.push(uploadedUrl);
        } else {
          triggerToast(`Could not upload ${file.name}. Please check file size.`);
        }
      } catch (err: any) {
        console.error('Error processing photo:', err);
        triggerToast(`Failed to upload ${file.name}`);
      }
    }

    if (newUploadedUrls.length > 0) {
      setReviewPhotos(prev => [...prev, ...newUploadedUrls]);
      triggerToast(`Attached ${newUploadedUrls.length} piece photo(s) successfully!`);
    }

    setIsUploadingPhotos(false);
    setUploadStatusText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setReviewPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to determine if the currently logged-in user owns this review
  const isReviewOwner = (rev: Review) => {
    if (!currentUser) return false;
    if (rev.userId && currentUser.id && String(rev.userId) === String(currentUser.id)) return true;
    if (rev.userPhone && currentUser.phone && String(rev.userPhone).trim() === String(currentUser.phone).trim()) return true;
    if (rev.userName && currentUser.name && rev.userName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  };

  // Open Write Modal in Create Mode
  const handleOpenNewReview = () => {
    if (!currentUser && onRequireLogin) {
      onRequireLogin('Write a Review', 'Sign in with your mobile number to write a verified customer review.');
      return;
    }
    setEditingReview(null);
    setReviewRating(5);
    setReviewTitle('');
    setReviewComment('');
    setReviewerName(currentUser?.name || '');
    setReviewPhotos([]);
    setShowWriteReviewModal(true);
  };

  // Open Write Modal in Edit Mode
  const handleOpenEditReview = (rev: Review) => {
    setEditingReview(rev);
    setReviewRating(rev.rating || 5);
    setReviewTitle(rev.title || '');
    setReviewComment(rev.comment || '');
    setReviewerName(rev.userName || currentUser?.name || '');
    setReviewPhotos(rev.images ? [...rev.images] : []);
    setShowWriteReviewModal(true);
  };

  // Confirm Delete Review Handler
  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setIsDeletingReview(true);
    try {
      const params = new URLSearchParams();
      if (currentUser?.id) params.append('userId', currentUser.id);
      if (currentUser?.phone) params.append('userPhone', currentUser.phone);
      if (currentUser?.name) params.append('userName', currentUser.name);

      const res = await fetch(`/api/products/${product.id}/reviews/${reviewToDelete.id}?${params.toString()}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete review');
      }

      if (data.product) {
        onProductUpdated?.(data.product);
      }

      triggerToast('Your review has been deleted successfully.');
      setReviewToDelete(null);
    } catch (err: any) {
      console.error('Delete review error:', err);
      triggerToast(err.message || 'Failed to delete review');
    } finally {
      setIsDeletingReview(false);
    }
  };

  // Submit Review Handler (Supports both Create and Edit)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating < 1 || reviewRating > 5) {
      triggerToast('Please select a star rating from 1 to 5.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const isEdit = Boolean(editingReview);
      const url = isEdit 
        ? `/api/products/${product.id}/reviews/${editingReview!.id}` 
        : `/api/products/${product.id}/reviews`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          title: reviewTitle.trim() || undefined,
          comment: reviewComment.trim() || undefined,
          userName: (reviewerName.trim() || currentUser?.name || 'Verified Customer'),
          userAvatar: currentUser?.avatar || undefined,
          images: reviewPhotos,
          userId: currentUser?.id || undefined,
          userPhone: currentUser?.phone || undefined,
          userEmail: currentUser?.email || undefined
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || `Failed to ${isEdit ? 'update' : 'submit'} review`);
      }

      if (resData.product) {
        onProductUpdated?.(resData.product);
      }

      setShowWriteReviewModal(false);
      setEditingReview(null);
      setReviewTitle('');
      setReviewComment('');
      setReviewPhotos([]);
      setReviewRating(5);
      triggerToast(isEdit ? 'Your review has been updated successfully!' : 'Thank you! Your verified review has been published.');
    } catch (err: any) {
      console.error('Submit review error:', err);
      triggerToast(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'Loved it! (5/5)';
      case 4: return 'Very Good (4/5)';
      case 3: return 'Average / It\'s OK (3/5)';
      case 2: return 'Below Average (2/5)';
      case 1: return 'Poor Experience (1/5)';
      default: return `${rating} Stars`;
    }
  };

  const currentImageSrc = allImages[activeImageIndex] || currentVariant.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

  useEffect(() => {
    resetScrollToTop();
  }, [product.id]);

  return (
    <div className="bg-[#F4F6F8] min-h-screen pb-44 text-slate-800 antialiased" id="product-detail-page">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0B1E36] text-white text-xs font-semibold py-2.5 px-5 rounded-full flex items-center gap-2 shadow-xl animate-fade-in border border-slate-700">
          <Check className="w-4 h-4 text-[#E5A812]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APP BAR: Back Chevron | अ/A | Search | Wishlist | Cart */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-3xs" id="product-top-bar">
        <div className="max-w-4xl mx-auto px-3.5 py-2.5 flex items-center justify-between">
          {/* Back Button */}
          <button 
            onClick={onBack} 
            className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            id="btn-back"
            aria-label="Go Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-700">
            {/* Language Icon (अ / A) */}
            <button
              onClick={() => triggerToast("Language: English (India)")}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer flex items-center justify-center font-bold text-xs"
              title="Change Language"
              id="btn-language"
            >
              <span className="text-[12px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
                अ <span className="text-[10px] text-slate-600">A</span>
              </span>
            </button>

            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-700"
              title="Search products"
              id="btn-search"
            >
              <Search className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Wishlist Heart Icon */}
            <button
              onClick={handleWishlistToggle}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Wishlist"
              id="btn-wishlist-header"
            >
              <Heart className={`w-5 h-5 stroke-[2.2] ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} />
            </button>

            {/* Cart Icon with badge */}
            <button
              onClick={onOpenCart}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer relative text-slate-700"
              title="Shopping Cart"
              id="btn-cart-header"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E5A812] text-[#0B1E36] font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input if clicked */}
        {searchOpen && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={localSearchText}
              onChange={(e) => setLocalSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch(localSearchText);
                }
              }}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#143C6B]"
              autoFocus
            />
            <button
              onClick={() => {
                if (onSearch && localSearchText.trim()) onSearch(localSearchText);
              }}
              className="bg-[#143C6B] text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Search
            </button>
            <button onClick={() => setSearchOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-3 lg:py-6 pb-36 lg:pb-6 space-y-4 sm:space-y-6">
        
        {/* RESPONSIVE 2-COLUMN GRID FOR DESKTOP (SINGLE COLUMN FOR MOBILE) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">

          {/* LEFT COLUMN: Gallery Viewport & Left-Hand Trust / Seller Cards */}
          <div className="lg:col-span-6 lg:sticky lg:top-[130px] space-y-3.5">
            
            {/* PRODUCT GALLERY VIEWPORT */}
            <section className="bg-white border-b sm:border border-slate-100 sm:rounded-2xl overflow-hidden shadow-3xs" id="product-gallery-section">
              <div 
                className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden select-none touch-pan-y"
                id="product-gallery-viewport"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
              >
                
                {/* Main Product Image Carousel with Motion */}
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.div
                    key={activeImageIndex}
                    custom={slideDirection}
                    variants={{
                      enter: (direction: number) => ({
                        x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
                        opacity: 0,
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                      },
                      exit: (direction: number) => ({
                        x: direction < 0 ? '100%' : direction > 0 ? '-100%' : 0,
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.15 },
                    }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                  >
                    <SmartImage
                      src={currentImageSrc}
                      alt={product.title}
                      aspectRatioClassName="aspect-square"
                      containerClassName="w-full h-full"
                      objectFit="contain"
                      targetWidth={800}
                      loading="eager"
                      fetchPriority="high"
                      id="product-gallery-main-image"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Left & Right Slide Controls on larger screens */}
                {allImages.length > 1 && (
                  <>
                    {activeImageIndex > 0 && (
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white cursor-pointer z-10"
                        id="btn-prev-image"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                    {activeImageIndex < allImages.length - 1 && (
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white cursor-pointer z-10"
                        id="btn-next-image"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </>
                )}

                {/* Floating "[+] More Like This" Pill Button */}
                <button
                  onClick={() => {
                    triggerToast("Showing visually similar items in this category");
                    const target = document.getElementById('people-also-viewed-section');
                    target?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="absolute bottom-3.5 right-3.5 z-20 bg-white text-slate-800 text-[11.5px] font-semibold px-3 py-1.5 rounded-full shadow-md border border-slate-200/90 flex items-center gap-1.5 hover:bg-slate-50 transition-transform active:scale-95 cursor-pointer"
                  id="btn-more-like-this"
                >
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-slate-600 text-xs font-bold leading-none">
                    +
                  </div>
                  <span className="tracking-tight">More Like This</span>
                </button>
              </div>

              {/* Image Thumbnails below main image */}
              {allImages.length > 1 && (
                <div className="p-3 bg-white flex items-center gap-3 overflow-x-auto scrollbar-hide" id="gallery-thumbnails">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectImageIndex(idx)}
                      className={`relative shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                        activeImageIndex === idx
                          ? 'border-[#143C6B] shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <SmartImage
                        src={imgUrl}
                        alt={`${product.title} - view ${idx + 1}`}
                        containerClassName="w-full h-full bg-slate-50"
                        objectFit="cover"
                        targetWidth={100}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* VENDOR STORE CARD ON DESKTOP (Hidden on mobile here, rendered on mobile below) */}
            <div className="hidden lg:block">
              <section className="bg-white p-4 border border-slate-100 rounded-2xl shadow-3xs" id="vendor-store-card-desktop">
                <div 
                  className="flex items-center justify-between gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onVisitStore?.(product.vendorId, product.soldBy)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#143C6B] to-[#1E5696] text-white flex items-center justify-center shrink-0 shadow-3xs border border-blue-900/20">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900 leading-tight">
                          {product.soldBy || 'Verified Seller'}
                        </h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="font-bold text-slate-700">{sellerStats.rating}</span>
                        <span>({sellerStats.reviewCount} Reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Column Stats Row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 rounded-xl p-2.5 text-center mb-3.5 border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Reviews</span>
                    <span className="text-xs font-black text-slate-800">{sellerStats.reviewCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Products</span>
                    <span className="text-xs font-black text-slate-800">{sellerStats.productCount} Items</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
                    <span className="text-xs font-black text-emerald-700">★ {sellerStats.rating}</span>
                  </div>
                </div>

                {/* Visit Store Button */}
                <button
                  onClick={() => {
                    if (onVisitStore) {
                      onVisitStore(product.vendorId, product.soldBy);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border-2 border-[#143C6B] text-[#143C6B] hover:bg-[#E8EEF5] active:scale-[0.99] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
                >
                  <Store className="w-4 h-4" />
                  <span>Visit Store</span>
                </button>
              </section>
            </div>

          </div>

          {/* RIGHT COLUMN: Title, Pricing, Swatches, Sizes, Action Buttons, Details & Reviews */}
          <div className="lg:col-span-6 space-y-2.5 sm:space-y-3.5 mt-2.5 lg:mt-0">

            {/* PRODUCT TITLE, ACTIONS & PRICING CARD (Screenshot 1 Format) */}
            <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="product-primary-info">
              
              {/* Title & Right Side Actions (Wishlist & Share) */}
              <div className="flex items-start justify-between gap-3">
                {/* Title */}
                <h1 className="text-[14.5px] sm:text-base font-medium text-slate-800 leading-snug flex-1" id="product-title">
                  {product.title}
                </h1>

                {/* Actions: Wishlist & Share stacked */}
                <div className="flex items-center gap-4 flex-shrink-0 pt-0.5">
                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistToggle}
                    className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
                    id="btn-wishlist-inline"
                  >
                    <Heart className={`w-5 h-5 stroke-[1.8] ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-600 group-hover:text-red-500'}`} />
                    <span className="text-[10px] font-medium text-slate-500">Wishlist</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShareClick}
                    className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
                    id="btn-share-inline"
                  >
                    <Share2 className="w-5 h-5 stroke-[1.8] text-slate-600 group-hover:text-[#143C6B]" />
                    <span className="text-[10px] font-medium text-slate-500">Share</span>
                  </button>
                </div>
              </div>

              {(() => {
                const pricing = getProductPricing({
                  ...product,
                  price: currentVariant.price,
                  originalPrice: currentVariant.originalPrice,
                });

                return (
                  <>
                    {/* Pricing Row */}
                    <div className="mt-3 flex items-baseline gap-2 flex-wrap" id="pricing-row">
                      {/* Current Effective Price */}
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        ₹{pricing.effectivePrice}
                      </span>
                      {/* Original Price Strikethrough */}
                      <span className="text-sm text-slate-400 line-through font-normal">
                        ₹{pricing.originalPrice}
                      </span>
                      {/* Discount Percentage */}
                      <span className="text-sm font-extrabold text-emerald-700">
                        {pricing.discountPercent}% off
                      </span>
                      {/* Info tooltip icon */}
                      <button 
                        onClick={() => triggerToast("Inclusive of all taxes & lowest price guarantee.")}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Price Details"
                      >
                        <Info className="w-3.5 h-3.5 inline" />
                      </button>
                    </div>

                    {/* Dual Pricing Selector / Summary Cards */}
                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="product-dual-price-cards">
                      {/* 1. UPI / Online Payment Card */}
                      {pricing.hasUpiOffer ? (
                        <div className="bg-gradient-to-br from-purple-50/90 to-indigo-50/50 border border-purple-200/80 rounded-xl p-2.5 flex flex-col justify-between shadow-3xs">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10.5px] font-black text-purple-900 flex items-center gap-1 uppercase tracking-wider">
                              <Zap className="w-3 h-3 text-purple-600 fill-purple-600" />
                              UPI / Online Price
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-purple-950">₹{pricing.upiPrice}</span>
                            <span className="text-[10px] text-purple-700 font-bold">with UPI / Cards / Netbanking</span>
                          </div>
                          <p className="text-[9.5px] text-purple-600/90 font-medium mt-0.5">
                            GPay, PhonePe, Paytm, BHIM, Cards
                          </p>
                        </div>
                      ) : null}

                      {/* 2. Cash on Delivery (COD) Card */}
                      {pricing.isCodAvailable ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between shadow-3xs">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10.5px] font-black text-slate-700 flex items-center gap-1 uppercase tracking-wider">
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              Cash on Delivery
                            </span>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                              Doorstep Pay
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-slate-900">₹{pricing.codPrice}</span>
                            <span className="text-[10px] text-slate-500 font-bold">with COD</span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-medium mt-0.5">
                            Pay in cash when package arrives
                          </p>
                        </div>
                      ) : (
                        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-[11px] text-indigo-900 font-bold">
                            Online Payment Only (COD unavailable)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* "Discount Applied ✔" Green Badge */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-[#E8F8F0] text-[#059669] text-xs font-semibold px-2.5 py-0.5 rounded-md border border-[#D1F2E0]">
                        <span>Best Price Guaranteed</span>
                        <Check className="w-3.5 h-3.5 stroke-[3] text-[#059669]" />
                      </span>
                      {pricing.upiDiscountAmount > 0 && (
                        <button
                          onClick={() => setShowSpecialOfferModal(true)}
                          className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-0.5 cursor-pointer"
                          id="btn-special-offer"
                        >
                          <span>{pricing.upiOfferText}</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* Rating Badge (Real Dynamic Ratings) */}
              {realRatingData.hasRatings ? (
                <div className="mt-3 flex items-center gap-2" id="rating-chip-row">
                  <span className="inline-flex items-center gap-1 bg-[#059669] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-3xs">
                    <span>{realRatingData.avgRating.toFixed(1)}</span>
                    <span className="text-[10px]">★</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    ({realRatingData.ratingCount})
                  </span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2" id="rating-chip-row">
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
                    <span>No reviews yet</span>
                  </span>
                  <button
                    onClick={handleOpenNewReview}
                    className="text-xs font-bold text-[#143C6B] hover:underline cursor-pointer"
                  >
                    Be the first to review
                  </button>
                </div>
              )}

            </section>

        {/* TRUST BADGES STRIP (Screenshot 1 & 2 Format) */}
        <section className="bg-white p-3.5 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="trust-badges-strip">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            
            {/* 1. 7 Days Easy Return */}
            <div className="flex items-center justify-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight border-b border-dotted border-slate-400 inline">
                  {returnDays} Days
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                  {returnPolicyType === 'no_return' ? 'No Return' : 'Easy Return'}
                </div>
              </div>
            </div>

            {/* 2. Cash on Delivery */}
            <div className="flex items-center justify-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#E5A812] flex items-center justify-center flex-shrink-0">
                <Banknote className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
                  Cash on
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                  Delivery
                </div>
              </div>
            </div>

            {/* 3. Lowest Price */}
            <div className="flex items-center justify-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#143C6B] flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="text-left">
                <div className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">
                  Lowest
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 leading-tight">
                  Price
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* COLOR SELECTION SECTION (Instant Swipe to Photo) */}
        {product.variants && product.variants.length > 0 && (
          <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="select-color-section">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Color :</span>
                <span className="text-sm font-black text-slate-900">
                  {product.variants[selectedVariantIndex]?.colorName || 'Default'}
                </span>
              </div>
              {product.variants.length > 1 && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {product.variants.length} Colors Available
                </span>
              )}
            </div>

            {/* Color Swatch Circles */}
            <div className="flex items-center gap-3 flex-wrap" id="color-swatches-list">
              {product.variants.map((v, idx) => {
                const isSelected = selectedVariantIndex === idx;
                const hex = v.colorHex || getColorHexFromName(v.colorName);
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectColorVariant(idx)}
                    className={`relative p-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isSelected 
                        ? 'ring-2 ring-[#143C6B] ring-offset-2 scale-110 shadow-sm' 
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    title={v.colorName}
                    id={`color-swatch-${idx}`}
                  >
                    <span 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/20 shadow-inner block" 
                      style={{ backgroundColor: hex }}
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* SELECT SIZE SECTION (Screenshot 2 Format) */}
        <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="select-size-section">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Select Size
            </h3>
            {selectedSizeStock > 0 && selectedSizeStock <= 5 ? (
              <span className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                Only {selectedSizeStock} Left!
              </span>
            ) : isSelectedSizeOutOfStock ? (
              <span className="text-[11px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                Out of Stock
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                In Stock ({selectedSizeStock})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap" id="size-chips-list">
            {(product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions : ['Free Size']).map((size) => {
              const isSelected = selectedSize === size;
              const sizeQty = (currentVariant.sizeStock && typeof currentVariant.sizeStock[size] === 'number')
                ? currentVariant.sizeStock[size]
                : (product.sizeStock && typeof product.sizeStock[size] === 'number')
                ? product.sizeStock[size]
                : (typeof currentVariant.stock === 'number' ? currentVariant.stock : (typeof product.stock === 'number' ? product.stock : 100));
              const isSizeOos = sizeQty === 0;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isSizeOos 
                        ? 'border-2 border-red-400 text-red-700 bg-red-50 font-bold shadow-2xs' 
                        : 'border-2 border-[#143C6B] text-[#143C6B] bg-[#E8EEF5] shadow-2xs font-bold'
                      : isSizeOos
                      ? 'border border-dashed border-red-200 text-slate-400 bg-red-50/30 line-through'
                      : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold'
                  }`}
                  id={`size-chip-${size}`}
                >
                  <span>{size}</span>
                  {isSizeOos ? (
                    <span className="text-[9px] font-black text-red-600 bg-red-100 px-1 py-0.2 rounded no-underline tracking-tighter">
                      OUT
                    </span>
                  ) : sizeQty <= 5 && sizeQty > 0 ? (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                      {sizeQty} left
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Real-time Size Stock Status Notice */}
          {isSelectedSizeOutOfStock && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200/90 text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Selected size ({selectedSize}) is currently out of stock. Please choose another available size.</span>
            </div>
          )}
        </section>



        {/* SEGMENTED TABS: [ Specification ] and [ Reviews ] (Screenshot 1 Format) */}
        <section className="bg-white p-2 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="product-detail-segmented-tabs">
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveDetailTab('specification')}
              className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeDetailTab === 'specification'
                  ? 'bg-white text-[#143C6B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-specification"
            >
              Specification
            </button>
            <button
              onClick={() => setActiveDetailTab('reviews')}
              className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeDetailTab === 'reviews'
                  ? 'bg-white text-[#143C6B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              id="tab-reviews"
            >
              Reviews ({displayReviews.length})
            </button>
          </div>
        </section>

        {/* TAB 1: PRODUCT SPECIFICATION & DETAILS (Screenshot 1 & 2 Format) */}
        {activeDetailTab === 'specification' && (
          <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs space-y-4" id="specification-content-tab">
            
            {/* Header */}
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Product Specification
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Detailed attributes, fabric composition & sizing guide
              </p>
            </div>

            {/* Description with "See More..." / "See Less" expander */}
            {product.description && (
              <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                <div className={`${!isDescExpanded ? 'line-clamp-4' : ''} whitespace-pre-line`}>
                  {product.description}
                </div>
                {product.description.length > 180 && (
                  <button
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="text-xs font-bold text-[#143C6B] hover:underline cursor-pointer block pt-1"
                  >
                    {isDescExpanded ? 'See Less' : 'See More...'}
                  </button>
                )}
              </div>
            )}

            {/* Highlights Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Highlights</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                {product.productHighlights && product.productHighlights.length > 0 ? (
                  product.productHighlights.map((hl, idx) => (
                    <div key={idx}>
                      <span className="text-slate-400 block text-[10.5px] uppercase font-bold">{hl.label}</span>
                      <span className="text-slate-800 font-bold">{hl.value}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 block text-[10.5px] uppercase font-bold">Category</span>
                      <span className="text-slate-800 font-bold">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px] uppercase font-bold">Sold By</span>
                      <span className="text-slate-800 font-bold">{product.soldBy}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px] uppercase font-bold">Origin</span>
                      <span className="text-slate-800 font-bold">India (Make in India)</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </section>
        )}

        {/* TAB 2: CUSTOMER RATINGS & REVIEWS SECTION */}
        {activeDetailTab === 'reviews' && (
          <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="ratings-reviews-section">
            <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Customer Ratings & Reviews
                </h3>
                <p className="text-[11px] text-slate-400 font-normal">
                  100% Genuine reviews from verified buyers
                </p>
              </div>

              {/* Professional "Write a Review" Button */}
              <button
                onClick={() => {
                  if (!currentUser && onRequireLogin) {
                    onRequireLogin('Write a Review', 'Sign in with your mobile number to post a verified customer review and photos.');
                    return;
                  }
                  setShowWriteReviewModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8EEF5] text-[#143C6B] hover:bg-[#143C6B] hover:text-white transition-all text-xs font-bold shadow-3xs cursor-pointer border border-[#143C6B]/20"
                id="btn-write-review-top"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Rating Summary Box with Green Card + Horizontal Progress Bars */}
            <div className="flex items-center gap-4 py-2 border-b border-slate-100 pb-4">
              
              {/* Big Rating Summary Box */}
              <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-3 min-w-[100px] text-center shadow-3xs">
                <div className={`${realRatingData.hasRatings ? 'bg-[#059669]' : 'bg-slate-400'} text-white text-xl font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs`}>
                  <span>{realRatingData.hasRatings ? realRatingData.avgRating.toFixed(1) : '--'}</span>
                  <span className="text-base">★</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-2 leading-tight">
                  {realRatingData.ratingCount} {realRatingData.ratingCount === 1 ? 'rating' : 'ratings'}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {realRatingData.reviewCount} {realRatingData.reviewCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* Rating Bars */}
              <div className="flex-1 space-y-1.5 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 text-[11px]">Excellent</span>
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#059669] h-full rounded-full transition-all duration-500" style={{ width: `${realRatingData.percentages[5]}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 text-[10px]">{realRatingData.counts[5]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 text-[11px]">Very Good</span>
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full transition-all duration-500" style={{ width: `${realRatingData.percentages[4]}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 text-[10px]">{realRatingData.counts[4]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 text-[11px]">Good</span>
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#34D399] h-full rounded-full transition-all duration-500" style={{ width: `${realRatingData.percentages[3]}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 text-[10px]">{realRatingData.counts[3]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 text-[11px]">Average</span>
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full rounded-full transition-all duration-500" style={{ width: `${realRatingData.percentages[2]}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 text-[10px]">{realRatingData.counts[2]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 text-[11px]">Poor</span>
                  <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#EF4444] h-full rounded-full transition-all duration-500" style={{ width: `${realRatingData.percentages[1]}%` }} />
                  </div>
                  <span className="w-6 text-right text-slate-400 text-[10px]">{realRatingData.counts[1]}</span>
                </div>
              </div>

            </div>

            {/* Customer Reviews List Header & Sorting */}
            <div className="flex items-center justify-between pt-3 pb-1 border-t border-slate-100 flex-wrap gap-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Customer Feedback</span>
                <span className="text-[11px] text-slate-400 font-normal">({displayReviews.length})</span>
              </div>
              {displayReviews.length > 1 && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <span>Sort by:</span>
                  <select
                    value={reviewSortBy}
                    onChange={(e) => setReviewSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[11px] font-semibold text-slate-700 focus:outline-hidden focus:border-[#143C6B] cursor-pointer"
                  >
                    <option value="helpful">Most Helpful 👍</option>
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer Reviews List */}
            <div className="space-y-3.5 divide-y divide-slate-100" id="reviews-list">
              {sortedReviews.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No reviews yet for this product</p>
                  <p className="text-slate-400 text-[11px] mt-1">Be the first to share your experience!</p>
                  <button
                    onClick={() => {
                      if (!currentUser && onRequireLogin) {
                        onRequireLogin('Write a Review', 'Sign in with your mobile number to post a verified review.');
                        return;
                      }
                      setShowWriteReviewModal(true);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#143C6B] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Write First Review</span>
                  </button>
                </div>
              ) : (
                sortedReviews.slice(0, 3).map((rev) => {
                  const isOwner = isReviewOwner(rev);
                  const isVerified = checkIsReviewVerified(rev);
                  const isVoted = hasUserVotedHelpful(rev);
                  const isVoting = votingReviewIds.includes(rev.id);

                  return (
                    <div key={rev.id} className="pt-3.5 first:pt-0">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-[#059669] text-white text-[11px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <span>{rev.rating}</span>
                            <span>★</span>
                          </span>
                          <span className="text-xs font-bold text-slate-800">{rev.title || 'Customer Review'}</span>
                          {isOwner && (
                            <span className="bg-indigo-50 text-indigo-700 text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-indigo-100">
                              Your Review
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-slate-400">
                          {rev.postedDate || 'Recent'}
                          {rev.updatedAt && <span className="ml-1 text-[9.5px] italic text-slate-400">(Edited)</span>}
                        </span>
                      </div>

                      {/* Photo attachments in card */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {rev.images.map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setPhotoPreviewModal(imgUrl)}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 group hover:border-[#143C6B] transition-all cursor-pointer"
                            >
                              <img
                                src={imgUrl}
                                alt="Customer piece"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {rev.comment && (
                        <p className="text-xs text-slate-700 mt-2 font-normal leading-relaxed">
                          {rev.comment}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50 text-[11px] flex-wrap gap-2">
                        {/* User Name & Verified Buyer Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-600 font-medium">~{rev.userName || 'Customer'}</span>
                          
                          {/* VERIFIED PURCHASE BADGING ON REVIEWS */}
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-3xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                              <span>Verified Buyer</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-slate-400 text-[10px]">
                              <span>Community Review</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          {/* Owner Edit & Delete */}
                          {isOwner && (
                            <div className="flex items-center gap-1.5 mr-1">
                              <button
                                onClick={() => handleOpenEditReview(rev)}
                                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#143C6B] hover:text-[#0B1E36] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                title="Edit your review"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setReviewToDelete(rev)}
                                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                title="Delete your review"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}

                          {/* HELPFUL REVIEW VOTING (Sign-in required, 1 account 1 vote) */}
                          <button
                            onClick={() => handleToggleHelpful(rev)}
                            disabled={isVoting}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer border ${
                              isVoted
                                ? 'bg-blue-50 text-[#143C6B] border-[#143C6B]/40 font-bold shadow-3xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                            }`}
                            title={currentUser ? (isVoted ? 'You found this helpful (click to undo)' : 'Vote review as helpful') : 'Sign in to vote helpful'}
                          >
                            {isVoting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#143C6B]" />
                            ) : (
                              <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-[#143C6B] text-[#143C6B]' : 'text-slate-400'}`} />
                            )}
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </section>
        )}

            {/* VENDOR / SELLER STORE CARD ON MOBILE (Hidden on desktop because rendered on left column) */}
            <div className="block lg:hidden">
              <section className="bg-white p-4 border-y sm:border border-slate-100 sm:rounded-2xl shadow-3xs" id="vendor-store-card-section">
                <div 
                  className="flex items-center justify-between gap-3 mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => onVisitStore?.(product.vendorId, product.soldBy)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#143C6B] to-[#1E5696] text-white flex items-center justify-center shrink-0 shadow-3xs border border-blue-900/20">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-slate-900 leading-tight">
                          {product.soldBy || 'Verified Seller'}
                        </h3>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-amber-500 font-bold">★</span>
                        <span className="font-bold text-slate-700">{sellerStats.rating}</span>
                        <span>({sellerStats.reviewCount} Reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Column Stats Row */}
                <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 rounded-xl p-2.5 text-center mb-3.5 border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Reviews</span>
                    <span className="text-xs font-black text-slate-800">{sellerStats.reviewCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Products</span>
                    <span className="text-xs font-black text-slate-800">{sellerStats.productCount} Items</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
                    <span className="text-xs font-black text-emerald-700">★ {sellerStats.rating}</span>
                  </div>
                </div>

                {/* Visit Store Button */}
                <button
                  onClick={() => {
                    if (onVisitStore) {
                      onVisitStore(product.vendorId, product.soldBy);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border-2 border-[#143C6B] text-[#143C6B] hover:bg-[#E8EEF5] active:scale-[0.99] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
                  id="btn-visit-store"
                >
                  <Store className="w-4 h-4" />
                  <span>Visit Store</span>
                </button>
              </section>
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
        {/* END RESPONSIVE 2-COLUMN GRID */}

        {/* PEOPLE ALSO VIEWED GRID (Full Width Under 2-Column Grid on Desktop) */}
        <section className="pt-4 sm:pt-6 border-t border-slate-200/70" id="people-also-viewed-section">
          <div className="flex items-center justify-between mb-3 px-4 sm:px-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
              PEOPLE ALSO VIEWED
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Similar recommendations in {product.category}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 px-3 sm:px-0">
            {suggestedProducts.slice(0, 12).map((item) => {
              const itemWishlisted = wishlist.includes(item.id);
              const itemSpecialPrice = Math.max(1, item.price - 26);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item.id)}
                  className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-3xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                  id={`suggested-product-${item.id}`}
                >
                  {/* Thumbnail with Heart Icon */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img
                      src={(item.images && item.images[0]) || (item.variants && item.variants[0]?.imageUrl) || undefined}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Wishlist Heart Top Right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(item.id);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 hover:text-red-500 cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 stroke-[2] ${itemWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Title */}
                      <h4 className="text-xs font-normal text-slate-700 line-clamp-2 leading-tight">
                        {item.title}
                      </h4>

                      {/* Pricing Row */}
                      <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{item.price}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          {item.originalPrice}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600">
                          {item.discountPercent}% off
                        </span>
                      </div>

                      {/* Special Offer Line */}
                      <div className="text-[10px] font-bold text-[#059669] mt-0.5">
                        ₹{itemSpecialPrice} with 1 Special Offer
                      </div>
                    </div>

                    {/* Rating Badge & Supplier Tag */}
                    <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-slate-50 flex-wrap">
                      <span className="bg-[#059669] text-white text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <span>{item.rating || 4.1}</span>
                        <span>★</span>
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-medium">
                        ({item.ratingCount || 2818})
                      </span>
                      <span className="text-[9.5px] font-bold text-[#E5A812] flex items-center gap-0.5 ml-auto">
                        ★ Top rated
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* STICKY BOTTOM BAR: BUY NOW CTA (Pinned permanently on mobile/tablet directly above the bottom navigation bar) */}
      {isMobile && (
        <div
          className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden"
          style={{ bottom: '58px' }}
          id="sticky-bottom-cta"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            
            {/* Add to cart button */}
            <button
              onClick={handleAddToCartClick}
              className="w-12 h-12 rounded-xl border-2 border-[#143C6B] text-[#143C6B] hover:bg-[#E8EEF5] active:scale-95 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 shadow-3xs bg-white"
              title="Add to Cart"
              id="btn-add-to-cart-sticky"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.4]" />
            </button>

            {/* Full Prominent "▶▶ Buy Now" Button matching Quekart Theme */}
            <button
              onClick={handleBuyNowClick}
              className="flex-1 bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-base py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider h-12"
              id="btn-buy-now-sticky"
            >
              <div className="flex items-center text-[#E5A812]">
                <Play className="w-4 h-4 fill-current rotate-0" />
                <Play className="w-4 h-4 fill-current rotate-0 -ml-1.5" />
              </div>
              <span>BUY NOW</span>
            </button>

          </div>
        </div>
      )}

      {/* SPECIAL OFFER MODAL */}
      {showSpecialOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-center">
            <button
              onClick={() => setShowSpecialOfferModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <BrandLogo size="md" layout="col" className="mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Quekart Special Offer</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Get an instant ₹{specialOfferDiscount} discount on UPI/Online Prepaid payments or member first-purchase coupon!
            </p>
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Special Offer Price</span>
              <span className="font-black text-sm text-[#059669]">₹{specialOfferPrice}</span>
            </div>
            <button
              onClick={() => {
                setShowSpecialOfferModal(false);
                handleBuyNowClick();
              }}
              className="w-full mt-4 bg-[#143C6B] text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer"
            >
              Apply & Buy Now
            </button>
          </div>
        </div>
      )}

      {/* ALL REVIEWS MODAL */}
      {showAllReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[88vh] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verified Customer Reviews</h3>
                  <p className="text-[11px] text-slate-500">{displayReviews.length} original customer reviews</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllReviewsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sorting bar in modal */}
            {displayReviews.length > 1 && (
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Sort Feedback:</span>
                <select
                  value={reviewSortBy}
                  onChange={(e) => setReviewSortBy(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-hidden focus:border-[#143C6B] cursor-pointer"
                >
                  <option value="helpful">Most Helpful 👍</option>
                  <option value="recent">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            )}

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-4 divide-y divide-slate-100 flex-1">
              {sortedReviews.map((rev) => {
                const isOwner = isReviewOwner(rev);
                const isVerified = checkIsReviewVerified(rev);
                const isVoted = hasUserVotedHelpful(rev);
                const isVoting = votingReviewIds.includes(rev.id);

                return (
                  <div key={rev.id} className="pt-3.5 first:pt-0">
                    <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#059669] text-white font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <span>{rev.rating}</span>
                          <span>★</span>
                        </span>
                        {rev.title && (
                          <span className="font-semibold text-slate-800">{rev.title}</span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        {rev.postedDate || 'Recent'}
                        {rev.updatedAt && <span className="ml-1 text-slate-400 text-[10px] italic">(Edited)</span>}
                      </span>
                    </div>

                    {/* Photos in modal */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <button
                            key={imgIdx}
                            onClick={() => setPhotoPreviewModal(imgUrl)}
                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 group hover:border-[#143C6B] transition-all cursor-pointer"
                          >
                            <img
                              src={imgUrl}
                              alt="Review attachment"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomIn className="w-4 h-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {rev.comment && (
                      <p className="text-xs text-slate-700 mt-2 leading-relaxed">{rev.comment}</p>
                    )}

                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-slate-50 text-[11px] flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-slate-500 flex-wrap">
                        <span className="text-slate-600 font-medium">~{rev.userName || 'Customer'}</span>
                        
                        {/* Verified Buyer Badge in Modal */}
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-3xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                            <span>Verified Buyer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-400 text-[10px]">
                            <span>Community</span>
                          </span>
                        )}

                        {isOwner && (
                          <span className="bg-indigo-50 text-indigo-700 text-[9.5px] font-bold px-1.5 py-0.2 rounded border border-indigo-100">
                            Your Review
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Owner Edit & Delete */}
                        {isOwner && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setShowAllReviewsModal(false);
                                handleOpenEditReview(rev);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#143C6B] hover:text-[#0B1E36] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Edit your review"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                setReviewToDelete(rev);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                              title="Delete your review"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}

                        {/* Thumbs up vote */}
                        <button
                          onClick={() => handleToggleHelpful(rev)}
                          disabled={isVoting}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
                            isVoted
                              ? 'bg-blue-50 text-[#143C6B] border-[#143C6B]/40 font-bold shadow-3xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                          title={currentUser ? (isVoted ? 'You found this helpful (click to undo)' : 'Vote review as helpful') : 'Sign in to vote helpful'}
                        >
                          {isVoting ? (
                            <Loader2 className="w-3 h-3 animate-spin text-[#143C6B]" />
                          ) : (
                            <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-[#143C6B] text-[#143C6B]' : 'text-slate-400'}`} />
                          )}
                          <span>Helpful ({rev.helpfulCount || 0})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom action */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Bought this product?</span>
              <button
                onClick={() => {
                  setShowAllReviewsModal(false);
                  handleOpenNewReview();
                }}
                className="px-3.5 py-1.5 bg-[#143C6B] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#0B1E36] flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PROFESSIONAL WRITE / EDIT REVIEW MODAL */}
      {showWriteReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {editingReview ? 'Edit Your Review' : 'Write a Customer Review'}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {editingReview ? 'Update your star rating, review text, or piece photos' : 'Share your experience & piece photos'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isSubmittingReview) {
                    setShowWriteReviewModal(false);
                    setEditingReview(null);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                disabled={isSubmittingReview}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 overflow-y-auto pt-4 pr-1 flex-1">
              
              {/* Product mini header */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <img
                  src={currentImageSrc}
                  alt={product.title}
                  className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">{product.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ₹{currentVariant.price} • {selectedSize}
                  </div>
                </div>
              </div>

              {/* Verified Buyer Alert */}
              {isCurrentUserVerifiedBuyer ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900">Verified Buyer Detected</span>
                    <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed">
                      You ordered this product on Quekart! Your review will automatically display the official <strong className="text-emerald-800">Verified Buyer</strong> badge.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#143C6B] mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Community Feedback</span>
                    <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      Share genuine feedback. Verified buyer badges are assigned automatically when an order is placed for this item.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Overall Rating (Interactive Star Selection) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (reviewHoverRating || reviewRating) >= starVal;
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onMouseEnter={() => setReviewHoverRating(starVal)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(starVal)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-[#E5A812] text-[#E5A812]'
                              : 'fill-slate-100 text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-bold text-[#143C6B]">
                    {getRatingLabel(reviewHoverRating || reviewRating)}
                  </span>
                </div>
              </div>

              {/* 2. Review Headline / Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Headline / Title <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent quality, perfect fit!"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B]"
                  maxLength={100}
                />
              </div>

              {/* 3. Review Comment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Detailed Review <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like or dislike about this item? How is the material, stitching, and finishing?"
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B]"
                />
              </div>

              {/* 4. Piece Photos Attachment (ImgBB API integration) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Attach Piece Photos
                  </label>
                  <span className="text-[10px] text-slate-500">{reviewPhotos.length}/6 photos</span>
                </div>

                {/* Photo thumbnails strip */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {reviewPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                      <img
                        src={url}
                        alt={`Attached ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photos Button */}
                  {reviewPhotos.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhotos}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#143C6B] bg-slate-50 hover:bg-[#E8EEF5]/40 text-slate-500 hover:text-[#143C6B] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingPhotos ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#143C6B]" />
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-bold">+ Photo</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {uploadStatusText && (
                  <p className="text-[11px] text-[#143C6B] font-medium flex items-center gap-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>{uploadStatusText}</span>
                  </p>
                )}
                <p className="text-[10px] text-slate-400">
                  Tip: Upload clear photos of the actual received piece to help other customers.
                </p>
              </div>

              {/* 5. Reviewer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Display Name <span className="text-slate-400 font-normal text-[11px]">(Will be shown as Verified Buyer)</span>
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#143C6B] focus:ring-1 focus:ring-[#143C6B]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowWriteReviewModal(false);
                    setEditingReview(null);
                  }}
                  disabled={isSubmittingReview}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || isUploadingPhotos}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#0B1E36] to-[#143C6B] text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{editingReview ? 'Updating...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingReview ? 'Save Changes' : 'Submit Review'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DELETE REVIEW CONFIRMATION MODAL */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-scale-in">
            <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 text-center">Delete Your Review?</h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Are you sure you want to delete this review? This action will permanently remove your star rating, comment, and uploaded piece photos.
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={isDeletingReview}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                disabled={isDeletingReview}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDeletingReview ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {photoPreviewModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPhotoPreviewModal(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPhotoPreviewModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={photoPreviewModal}
              alt="Full size customer piece preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 bg-black"
              referrerPolicy="no-referrer"
            />
            <div className="mt-2 text-center text-xs text-white/80 font-medium">
              Verified Customer Piece Photo
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


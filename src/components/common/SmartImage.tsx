import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

/**
 * Global session memory cache for loaded image URLs.
 * Eliminates loading flashes and shimmers for already-rendered or preloaded images.
 */
export const loadedImagesCache = new Set<string>();

/**
 * High-speed CDN Image Optimizer:
 * Automatically scales, compresses (WebP/AVIF), and tunes dimensions for Unsplash, Cloudinary, etc.
 * Converts multi-megabyte raw photos into lightweight 20KB-60KB WebP payloads.
 */
export function optimizeImageUrl(src: string, width: number = 450, quality: number = 75): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  // Unsplash Optimization: Ensure fast WebP compression and exact dimension bounds
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', String(quality));
      if (width > 0) {
        url.searchParams.set('w', String(width));
      }
      return url.toString();
    } catch (_) {
      return trimmed;
    }
  }

  // Cloudinary Optimization
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/upload/')) {
    try {
      return trimmed.replace('/upload/', `/upload/f_auto,q_auto:eco,w_${width}/`);
    } catch (_) {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Background Image Preload Utility:
 * Preloads image directly into the browser memory cache.
 */
export function preloadImage(url: string, width: number = 450): Promise<void> {
  if (!url) return Promise.resolve();
  const optimized = optimizeImageUrl(url, width);
  if (loadedImagesCache.has(url) || loadedImagesCache.has(optimized)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.decoding = 'async';
    img.onload = () => {
      loadedImagesCache.add(url);
      loadedImagesCache.add(optimized);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = optimized;
  });
}

/**
 * Batch Image Preloader for top products and banners
 */
export function preloadImagesBatch(urls: string[], width: number = 450): void {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  uniqueUrls.slice(0, 16).forEach((url) => {
    preloadImage(url, width);
  });
}

interface SmartImageProps {
  id?: string;
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectRatioClassName?: string; // e.g., 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]'
  objectFit?: 'cover' | 'contain' | 'fill';
  fallbackSrc?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  targetWidth?: number;
  onClick?: () => void;
  draggable?: boolean;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=75&w=600';

export const SmartImage: React.FC<SmartImageProps> = ({
  id,
  src,
  alt = '',
  className = '',
  containerClassName = '',
  aspectRatioClassName = '',
  objectFit = 'cover',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  referrerPolicy = 'no-referrer',
  loading = 'eager',
  fetchPriority = 'auto',
  targetWidth = 450,
  onClick,
  draggable = false
}) => {
  const optimizedSrc = optimizeImageUrl(src, targetWidth);
  const optimizedFallback = optimizeImageUrl(fallbackSrc, targetWidth);

  // Check if image is already warm in memory cache
  const isInitiallyCached = loadedImagesCache.has(src) || loadedImagesCache.has(optimizedSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(isInitiallyCached);
  const [hasError, setHasError] = useState<boolean>(false);
  const [currentSrc, setCurrentSrc] = useState<string>(optimizedSrc || src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync src changes & check if already loaded from cache
  useEffect(() => {
    const nextOptimized = optimizeImageUrl(src, targetWidth);
    setCurrentSrc(nextOptimized || src);
    setHasError(false);

    if (loadedImagesCache.has(src) || loadedImagesCache.has(nextOptimized)) {
      setIsLoaded(true);
      return;
    }

    // Check if the image is already loaded in browser / WebView memory or disk cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImagesCache.add(src);
      loadedImagesCache.add(nextOptimized);
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src, targetWidth]);

  const handleImageLoad = () => {
    loadedImagesCache.add(src);
    if (currentSrc) loadedImagesCache.add(currentSrc);
    setIsLoaded(true);
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      if (optimizedFallback && currentSrc !== optimizedFallback) {
        setCurrentSrc(optimizedFallback);
      }
    }
  };

  const fitClass = objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : 'object-cover';

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-100/80 ${aspectRatioClassName} ${containerClassName}`}
    >
      {/* Skeleton Shimmer overlay while image is loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-150">
          <div className="w-7 h-7 rounded-full bg-white/80 border border-slate-200/60 flex items-center justify-center shadow-xs">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority as any}
        referrerPolicy={referrerPolicy}
        draggable={draggable}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full ${fitClass} transition-opacity duration-150 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};


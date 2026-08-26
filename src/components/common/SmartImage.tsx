import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SmartImageProps {
  id?: string;
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectRatioClassName?: string; // e.g., 'aspect-square', 'aspect-[4/5]', 'aspect-[3.2/1]'
  objectFit?: 'cover' | 'contain' | 'fill';
  fallbackSrc?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
  draggable?: boolean;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';

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
  loading = 'eager', // Default to eager for mobile WebViews to load immediately
  onClick,
  draggable = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sync src changes & check if already loaded from cache
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);

    // Check if the image is already loaded in browser / WebView memory or disk cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
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
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-10 pointer-events-none">
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
        referrerPolicy={referrerPolicy}
        draggable={draggable}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full ${fitClass} transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};


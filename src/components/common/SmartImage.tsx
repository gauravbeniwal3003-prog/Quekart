import React, { useState, useEffect } from 'react';
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

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';

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
  loading = 'lazy',
  onClick,
  draggable = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Sync src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
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
      {/* Skeleton Liquid Glass Shimmer overlay while image is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-10 flex items-center justify-center backdrop-blur-3xs">
          <div className="w-8 h-8 rounded-full bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-3xs">
            <ImageIcon className="w-4 h-4 text-[#143C6B]/40 animate-pulse" />
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy={referrerPolicy}
        draggable={draggable}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full ${fitClass} smart-image-fade ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
        } ${className}`}
      />
    </div>
  );
};

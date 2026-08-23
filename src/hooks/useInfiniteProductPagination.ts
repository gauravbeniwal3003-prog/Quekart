import { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../types';

interface UseInfiniteProductPaginationOptions {
  batchSize?: number; // Default 50
  triggerThreshold?: number; // Default 10 (when user reaches last 10 items)
}

export function useInfiniteProductPagination(
  allProducts: Product[],
  options: UseInfiniteProductPaginationOptions = {}
) {
  const batchSize = options.batchSize || 50;
  const triggerThreshold = options.triggerThreshold || 10;

  const [visibleCount, setVisibleCount] = useState<number>(batchSize);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Only clamp visible count if total items reduced below current visible count
  useEffect(() => {
    if (allProducts.length < visibleCount && allProducts.length > 0) {
      setVisibleCount(Math.min(batchSize, allProducts.length));
    }
  }, [allProducts.length, batchSize]);

  const hasMore = visibleCount < allProducts.length;

  const loadNextBatch = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    // Silent quick load or brief spinner feedback if scrolling fast
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, allProducts.length));
      setIsLoadingMore(false);
    }, 250);
  }, [isLoadingMore, hasMore, batchSize, allProducts.length]);

  // Observer for trigger element (e.g. 10th product from the current end)
  const triggerObserver = useRef<IntersectionObserver | null>(null);

  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingMore) return;
      if (triggerObserver.current) triggerObserver.current.disconnect();

      triggerObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadNextBatch();
          }
        },
        {
          root: null,
          rootMargin: '300px', // Pre-fetch 300px before user actually hits the bottom
          threshold: 0.1,
        }
      );

      if (node) {
        triggerObserver.current.observe(node);
      }
    },
    [isLoadingMore, hasMore, loadNextBatch]
  );

  // Also monitor window scroll position as a fallback for fast scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoadingMore) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const thresholdPosition = document.body.offsetHeight - 600;

      if (scrollPosition >= thresholdPosition) {
        loadNextBatch();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadNextBatch]);

  const visibleProducts = allProducts.slice(0, visibleCount);

  // Index where the trigger element should be placed (10 items before the end of visible list)
  const triggerIndex = Math.max(0, visibleProducts.length - triggerThreshold);

  return {
    visibleProducts,
    visibleCount,
    isLoadingMore,
    hasMore,
    triggerIndex,
    triggerRef,
    loadNextBatch,
    totalCount: allProducts.length,
  };
}

import { useEffect, useRef, RefObject } from 'react';
import { trackProductImpressions } from '../utils/analytics';

/**
 * Custom hook that uses IntersectionObserver to detect when product cards
 * are scrolled into view and tracks smart 1-impression per 3-hour IP.
 */
export function useProductImpressionObserver(containerRef?: RefObject<HTMLElement | null>) {
  const trackedProductIdsRef = useRef<Set<string>>(new Set());
  const pendingBatchRef = useRef<Set<string>>(new Set());
  const batchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const rootElement = containerRef?.current || null;

    const flushBatch = () => {
      if (pendingBatchRef.current.size === 0) return;
      const idsToTrack = Array.from(pendingBatchRef.current) as string[];
      pendingBatchRef.current.clear();
      trackProductImpressions(idsToTrack);
    };

    const handleIntersect: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const productId = entry.target.getAttribute('data-product-id');
          if (productId && !trackedProductIdsRef.current.has(productId)) {
            trackedProductIdsRef.current.add(productId);
            pendingBatchRef.current.add(productId);

            // Debounce batch sending by 1000ms
            if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
            batchTimeoutRef.current = setTimeout(flushBatch, 1000);

            // Unobserve element after capturing impression
            observer.unobserve(entry.target);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      root: rootElement,
      rootMargin: '50px 0px 50px 0px',
      threshold: 0.2
    });

    const observeElements = () => {
      const scope = containerRef?.current || document;
      const elements = scope.querySelectorAll('[data-product-id]');
      elements.forEach((el) => {
        const pId = el.getAttribute('data-product-id');
        if (pId && !trackedProductIdsRef.current.has(pId)) {
          observer.observe(el);
        }
      });
    };

    observeElements();
    const interval = setInterval(observeElements, 3000);

    return () => {
      clearInterval(interval);
      if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
      flushBatch();
      observer.disconnect();
    };
  }, [containerRef]);
}

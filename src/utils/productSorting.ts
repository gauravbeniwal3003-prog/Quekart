import { Product } from '../types';

/**
 * Calculates a performance score for a product based on ratings, reviews, discounts,
 * sponsored status, and tags.
 */
export function calculateProductPerformanceScore(p: Product): number {
  let score = 0;
  
  // Rating score (0-100)
  score += (p.rating || 4.0) * 20;

  // Rating count score (up to 50 pts)
  score += Math.min(p.ratingCount || 10, 500) / 10;

  // Discount score (up to 40 pts)
  score += Math.min(p.discountPercent || 0, 80) * 0.5;

  // Sponsored status (+150 pts)
  if (p.sponsoredUntil && new Date(p.sponsoredUntil) > new Date()) {
    score += 150;
  }

  // Tags (+40 pts)
  if (p.tag) {
    score += 40;
  }

  // UPI offer (+10 pts)
  if (p.hasUpiOffer) {
    score += 10;
  }

  return score;
}

/**
 * Arranges products in a weighted randomized order prioritizing top-performing items
 * for the Home feed.
 */
export function sortHomeFeedByPerformance(products: Product[]): Product[] {
  if (!products || products.length <= 1) return products;

  // Calculate scores and map
  const scored = products.map((p) => ({
    product: p,
    score: calculateProductPerformanceScore(p),
  }));

  // Sort deterministically by score descending, then by product ID ascending as tie-breaker
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return String(a.product.id).localeCompare(String(b.product.id));
  });

  return scored.map((item) => item.product);
}

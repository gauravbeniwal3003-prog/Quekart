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

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Group into tiers of 5 to introduce subtle random variation among similar performing items
  const result: Product[] = [];
  const chunkSize = 5;

  for (let i = 0; i < scored.length; i += chunkSize) {
    const chunk = scored.slice(i, i + chunkSize);
    // Semi-random shuffle within the small tier chunk
    for (let j = chunk.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [chunk[j], chunk[k]] = [chunk[k], chunk[j]];
    }
    chunk.forEach((item) => result.push(item.product));
  }

  return result;
}

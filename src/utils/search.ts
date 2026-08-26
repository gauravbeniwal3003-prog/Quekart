import { Product } from '../types';

/**
 * Smart Search Filter Engine
 * Checks keyword matching across product title, description, category, subCategory,
 * tags, seller, variants, product highlights, and additional specs.
 */
export function smartSearchFilter(products: Product[], query: string): Product[] {
  if (!query || !query.trim()) {
    return products;
  }

  const rawQuery = query.trim().toLowerCase();
  
  // Split query into individual words/tokens
  const rawTokens = rawQuery.split(/\s+/).filter(t => t.length > 0);

  // Common stop words to ignore if multi-word query
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'for', 'of', 'and', 'or', 'to', 'is', 'are', 'set', 'by']);
  const tokens = rawTokens.filter(t => !stopWords.has(t) || rawTokens.length === 1);

  return products.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const tag = (p.tag || '').toLowerCase();
    const soldBy = (p.soldBy || '').toLowerCase();
    const sizes = (p.sizeOptions || []).join(' ').toLowerCase();

    // Additional fields
    const variantsText = (p.variants || [])
      .map(v => `${v.colorName || ''}`)
      .join(' ')
      .toLowerCase();

    const highlightsText = (p.productHighlights || [])
      .map(h => `${h.label || ''} ${h.value || ''}`)
      .join(' ')
      .toLowerCase();

    const detailsText = (p.additionalDetails || [])
      .map(d => `${d.label || ''} ${d.value || ''}`)
      .join(' ')
      .toLowerCase();

    const fullBlob = `${title} ${desc} ${cat} ${tag} ${soldBy} ${sizes} ${variantsText} ${highlightsText} ${detailsText}`;

    // 1. Direct exact phrase match anywhere in blob
    if (fullBlob.includes(rawQuery)) {
      return true;
    }

    // 2. Token match: Check if all meaningful tokens are in the blob
    const allTokensMatch = tokens.every(token => fullBlob.includes(token));
    if (allTokensMatch) {
      return true;
    }

    // 3. Category or Title match with key tokens
    const anyTokenInTitleOrCategory = tokens.some(
      token => title.includes(token) || cat.includes(token)
    );
    if (anyTokenInTitleOrCategory) {
      return true;
    }

    // 4. Majority token match in description or specs
    const matchCount = tokens.filter(token => fullBlob.includes(token)).length;
    if (matchCount >= Math.ceil(tokens.length / 2) && matchCount > 0) {
      return true;
    }

    return false;
  }).sort((a, b) => {
    // Relevance scoring: exact title match first, then category match, then standard
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();

    const exactTitleA = titleA.includes(rawQuery);
    const exactTitleB = titleB.includes(rawQuery);

    if (exactTitleA && !exactTitleB) return -1;
    if (!exactTitleA && exactTitleB) return 1;

    const catA = (a.category || '').toLowerCase().includes(rawQuery);
    const catB = (b.category || '').toLowerCase().includes(rawQuery);

    if (catA && !catB) return -1;
    if (!catA && catB) return 1;

    return 0;
  });
}

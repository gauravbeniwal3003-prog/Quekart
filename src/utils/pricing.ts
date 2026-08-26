import { Product } from '../types';

export interface ProductPricingCalculation {
  effectivePrice: number;
  effectiveBasePrice: number;
  originalPrice: number;
  discountPercent: number;
  isCodAvailable: boolean;
  codSurcharge: number;
  codPrice: number;
  hasUpiOffer: boolean;
  upiPrice: number;
  upiDiscountAmount: number;
  upiDiscountPercent: number;
  savingsVsCod: number;
  offerTagline: string;
  upiOfferText: string;
}

/**
 * Calculates complete pricing details for a product including COD surcharge and UPI discounts.
 */
export function getProductPricing(
  product: Product,
  selectedVariantPrice?: number
): ProductPricingCalculation {
  const basePrice = Math.max(1, selectedVariantPrice ?? product.price ?? 299);
  const originalPrice = product.originalPrice && product.originalPrice > basePrice
    ? product.originalPrice
    : Math.round(basePrice * 1.4);

  const discountPercent = product.discountPercent && product.discountPercent > 0
    ? product.discountPercent
    : Math.round(((originalPrice - basePrice) / originalPrice) * 100);

  const isCodAvailable = product.isCodAvailable !== false;
  const codSurcharge = isCodAvailable ? (product.codSurcharge ?? (product.codPrice ? Math.max(0, product.codPrice - product.price) : 39)) : 0;
  const codPrice = isCodAvailable ? (product.codPrice ?? (basePrice + codSurcharge)) : basePrice;

  // Determine if UPI offer is enabled by vendor
  const hasUpiOffer = product.hasUpiOffer === true || (
    product.hasUpiOffer !== false && (
      (product.upiPrice !== undefined && product.upiPrice > 0 && product.upiPrice < basePrice) ||
      (product.upiDiscountValue !== undefined && product.upiDiscountValue > 0)
    )
  );

  let upiPrice = basePrice;
  let upiDiscountAmount = 0;
  let upiDiscountPercent = 0;

  if (hasUpiOffer) {
    if (product.upiPrice && product.upiPrice > 0 && product.upiPrice < basePrice) {
      // Direct UPI Price set by vendor
      upiPrice = product.upiPrice;
      upiDiscountAmount = Math.max(0, basePrice - upiPrice);
      upiDiscountPercent = basePrice > 0 ? Math.round((upiDiscountAmount / basePrice) * 100) : 0;
    } else if (product.upiDiscountType === 'flat') {
      upiDiscountAmount = product.upiDiscountValue || 30;
      upiPrice = Math.max(1, basePrice - upiDiscountAmount);
      upiDiscountPercent = basePrice > 0 ? Math.round((upiDiscountAmount / basePrice) * 100) : 0;
    } else {
      // Percentage based (default 5%)
      upiDiscountPercent = product.upiDiscountValue || 5;
      upiDiscountAmount = Math.max(1, Math.round((basePrice * upiDiscountPercent) / 100));
      upiPrice = Math.max(1, basePrice - upiDiscountAmount);
    }
  }

  const isUpiActive = hasUpiOffer && upiDiscountAmount > 0 && upiPrice < basePrice;
  const savingsVsCod = isCodAvailable ? Math.max(0, codPrice - upiPrice) : upiDiscountAmount;

  const offerTagline = product.upiOfferText || (
    isUpiActive
      ? (upiDiscountPercent > 0
          ? `Extra ${upiDiscountPercent}% Instant Discount on UPI Payment`
          : `Instant ₹${upiDiscountAmount} OFF on UPI Payment`)
      : ''
  );

  return {
    effectivePrice: basePrice,
    effectiveBasePrice: basePrice,
    originalPrice,
    discountPercent,
    isCodAvailable,
    codSurcharge,
    codPrice,
    hasUpiOffer: isUpiActive,
    upiPrice: isUpiActive ? upiPrice : basePrice,
    upiDiscountAmount: isUpiActive ? upiDiscountAmount : 0,
    upiDiscountPercent: isUpiActive ? upiDiscountPercent : 0,
    savingsVsCod: isUpiActive ? savingsVsCod : 0,
    offerTagline: isUpiActive ? offerTagline : '',
    upiOfferText: isUpiActive ? offerTagline : ''
  };
}

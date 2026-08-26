import React, { useState, useEffect } from 'react';
import { BadgePercent, Zap, Check, Banknote, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface VendorUpiPricingSelectorProps {
  basePrice: number;
  isCodAvailable: boolean;
  codSurcharge: number;
  hasUpiOffer: boolean;
  setHasUpiOffer: (val: boolean) => void;
  upiPrice: number;
  setUpiPrice: (val: number) => void;
  upiDiscountType: 'percentage' | 'flat';
  setUpiDiscountType: (val: 'percentage' | 'flat') => void;
  upiDiscountValue: number;
  setUpiDiscountValue: (val: number) => void;
  upiOfferText: string;
  setUpiOfferText: (val: string) => void;
  idPrefix?: string;
}

export const VendorUpiPricingSelector: React.FC<VendorUpiPricingSelectorProps> = ({
  basePrice,
  isCodAvailable,
  codSurcharge,
  hasUpiOffer,
  setHasUpiOffer,
  upiPrice,
  setUpiPrice,
  upiDiscountType,
  setUpiDiscountType,
  upiDiscountValue,
  setUpiDiscountValue,
  upiOfferText,
  setUpiOfferText,
  idPrefix = 'vendor'
}) => {
  const [entryMode, setEntryMode] = useState<'direct_price' | 'discount'>('direct_price');

  // Calculate actual current prices
  const safeBasePrice = Math.max(1, basePrice || 299);
  const currentCodPrice = safeBasePrice + (isCodAvailable ? (Number(codSurcharge) || 0) : 0);

  // Compute effective UPI Price
  let computedUpiPrice = safeBasePrice;
  if (hasUpiOffer) {
    if (entryMode === 'direct_price' && upiPrice > 0 && upiPrice <= safeBasePrice) {
      computedUpiPrice = upiPrice;
    } else if (upiDiscountType === 'percentage') {
      const discount = Math.max(1, Math.round((safeBasePrice * (upiDiscountValue || 5)) / 100));
      computedUpiPrice = Math.max(1, safeBasePrice - discount);
    } else {
      const discount = Math.max(1, Number(upiDiscountValue) || 30);
      computedUpiPrice = Math.max(1, safeBasePrice - discount);
    }
  }

  const instantSavingsVsBase = Math.max(0, safeBasePrice - computedUpiPrice);
  const savingsVsCod = isCodAvailable ? Math.max(0, currentCodPrice - computedUpiPrice) : instantSavingsVsBase;

  // Handle direct price change
  const handleDirectPriceChange = (newPrice: number) => {
    const validPrice = Math.min(safeBasePrice, Math.max(1, newPrice));
    setUpiPrice(validPrice);
    const diff = safeBasePrice - validPrice;
    setUpiDiscountType('flat');
    setUpiDiscountValue(diff);
  };

  // Quick preset handler
  const handleApplyPreset = (type: 'flat' | 'percentage', value: number) => {
    setUpiDiscountType(type);
    setUpiDiscountValue(value);
    if (type === 'flat') {
      const calculated = Math.max(1, safeBasePrice - value);
      setUpiPrice(calculated);
    } else {
      const disc = Math.round((safeBasePrice * value) / 100);
      setUpiPrice(Math.max(1, safeBasePrice - disc));
    }
  };

  return (
    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 space-y-4 shadow-3xs" id={`${idPrefix}-upi-pricing-block`}>
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-colors ${hasUpiOffer ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">UPI / Prepaid Special Price</h4>
              <span className="text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tight">
                Recommended
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium">Set a discounted price for buyers who pay via UPI (GPay, PhonePe, Paytm)</p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={hasUpiOffer}
            onChange={e => setHasUpiOffer(e.target.checked)}
            className="sr-only peer"
            id={`${idPrefix}-toggle-upi-offer`}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {hasUpiOffer && (
        <div className="pt-2 border-t border-slate-200/70 space-y-3.5 animate-fadeIn">
          {/* Mode Switcher: Direct UPI Price vs Discount */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-700">Choose Pricing Method:</span>
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/60">
              <button
                type="button"
                onClick={() => setEntryMode('direct_price')}
                className={`text-[10.5px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  entryMode === 'direct_price' ? 'bg-white text-[#143C6B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Set Direct UPI Price (₹)
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('discount')}
                className={`text-[10.5px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer ${
                  entryMode === 'discount' ? 'bg-white text-[#143C6B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Set Discount (₹ / %)
              </button>
            </div>
          </div>

          {/* Form Controls based on selected mode */}
          {entryMode === 'direct_price' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[10.5px] text-slate-700 font-bold block mb-1">
                  Direct Price for UPI Payments (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={safeBasePrice}
                    value={upiPrice > 0 ? upiPrice : computedUpiPrice}
                    onChange={e => handleDirectPriceChange(Number(e.target.value))}
                    placeholder={String(Math.max(1, safeBasePrice - 30))}
                    className="w-full pl-7 pr-3 py-2 text-xs font-black text-purple-950 bg-white border border-purple-200 rounded-xl focus:outline-hidden focus:border-purple-600 shadow-2xs"
                    id={`${idPrefix}-direct-upi-price-input`}
                  />
                </div>
                <span className="text-[10px] text-purple-700 font-bold mt-1 block">
                  Must be ≤ Wholesale Base Price (₹{safeBasePrice})
                </span>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-[10.5px] text-slate-700 font-bold block mb-1">
                  Quick Price Discounts
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[15, 30, 50].map(amt => (
                    <button
                      key={`flat-${amt}`}
                      type="button"
                      onClick={() => handleApplyPreset('flat', amt)}
                      className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                        instantSavingsVsBase === amt ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      -₹{amt} OFF
                    </button>
                  ))}
                  {[5, 10].map(pct => (
                    <button
                      key={`pct-${pct}`}
                      type="button"
                      onClick={() => handleApplyPreset('percentage', pct)}
                      className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg border bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      -{pct}% OFF
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-[10.5px] text-slate-700 font-bold block mb-1">
                  UPI Discount Structure
                </label>
                <div className="flex gap-2">
                  <select
                    value={upiDiscountType}
                    onChange={e => {
                      const type = e.target.value as 'percentage' | 'flat';
                      setUpiDiscountType(type);
                      handleApplyPreset(type, type === 'percentage' ? 5 : 30);
                    }}
                    className="text-xs font-bold border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B] cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={upiDiscountValue}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setUpiDiscountValue(val);
                      handleApplyPreset(upiDiscountType, val);
                    }}
                    placeholder={upiDiscountType === 'percentage' ? '5' : '30'}
                    className="w-24 text-xs font-black border border-slate-300 rounded-xl p-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                  />
                  <span className="self-center text-xs font-bold text-slate-600">
                    {upiDiscountType === 'percentage' ? '%' : '₹'} OFF
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10.5px] text-slate-700 font-bold block mb-1">
                  Calculated UPI Price
                </label>
                <div className="p-2 bg-white border border-purple-200 rounded-xl text-xs font-black text-purple-900 flex items-center justify-between">
                  <span>Buyer Pays (UPI):</span>
                  <span className="text-sm text-purple-700">₹{computedUpiPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* LIVE CUSTOMER SHOP REPRESENTATION CARD PREVIEW */}
          <div className="bg-white rounded-xl p-3 border border-purple-200/90 space-y-2 shadow-3xs" id={`${idPrefix}-upi-shop-preview`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Customer Shop Card Preview
              </span>
              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                0% RTO Risk on UPI
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* UPI Pill Preview */}
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-lg">
                <span className="text-[9px] bg-[#143C6B] text-white font-black px-1.5 py-0.5 rounded-xs uppercase">
                  UPI
                </span>
                <span className="text-xs font-black text-slate-900">₹{computedUpiPrice} with UPI</span>
                {savingsVsCod > 0 && (
                  <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200">
                    Save ₹{savingsVsCod}
                  </span>
                )}
              </div>

              {/* COD Pill Preview */}
              {isCodAvailable ? (
                <div className="flex items-center gap-1 text-[11px] text-slate-600 font-bold bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <span className="text-emerald-600 text-[10px]">✔</span>
                  <span>₹{currentCodPrice} with COD</span>
                </div>
              ) : (
                <div className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                  Online Payment Only
                </div>
              )}
            </div>
          </div>

          {/* Custom Offer Tagline */}
          <div>
            <label className="text-[10.5px] text-slate-600 font-bold block mb-1">
              Custom Offer Tagline (Shown on Product Page)
            </label>
            <input
              type="text"
              value={upiOfferText}
              onChange={e => setUpiOfferText(e.target.value)}
              placeholder="e.g. Extra Instant Discount on UPI / Prepaid Payment"
              className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:border-[#143C6B]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                `Instant ₹${instantSavingsVsBase || 30} OFF on UPI Payment`,
                'Extra Instant Discount with Google Pay / PhonePe / Paytm',
                'Prepaid Discount: Save Extra on UPI'
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setUpiOfferText(preset)}
                  className="text-[10px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

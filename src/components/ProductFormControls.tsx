import React, { useState } from 'react';
import { 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Plus, 
  Minus,
  X, 
  Ban, 
  Ruler, 
  Sparkles, 
  Sliders, 
  Package, 
  Boxes,
  Layers,
  Tag, 
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ReturnPolicyAccordionProps {
  returnPolicyType: 'return' | 'replacement' | 'no_return';
  setReturnPolicyType: (type: 'return' | 'replacement' | 'no_return') => void;
  returnDays: number;
  setReturnDays: (days: number) => void;
  idPrefix?: string;
}

export const ReturnPolicyAccordion: React.FC<ReturnPolicyAccordionProps> = ({
  returnPolicyType,
  setReturnPolicyType,
  returnDays,
  setReturnDays,
  idPrefix = 'vendor'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState('');

  const handleSelectPolicyType = (type: 'return' | 'replacement' | 'no_return') => {
    setReturnPolicyType(type);
    if (type === 'no_return') {
      setReturnDays(0);
      // Automatically contract to natural state
      setIsOpen(false);
    }
  };

  const handleSelectDays = (days: number) => {
    setReturnDays(days);
    // Automatically contract to natural state
    setIsOpen(false);
  };

  const handleApplyCustomDays = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(customDaysInput, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 90) {
      setReturnDays(parsed);
      setCustomDaysInput('');
      // Automatically contract to natural state
      setIsOpen(false);
    }
  };

  // Get current active status badge text
  const getBadgeContent = () => {
    if (returnPolicyType === 'no_return') {
      return {
        label: 'Non-Returnable (Final Sale)',
        bg: 'bg-red-50 text-red-700 border-red-200',
        icon: <Ban className="w-3.5 h-3.5 text-red-600 shrink-0" />
      };
    }
    if (returnPolicyType === 'replacement') {
      return {
        label: `${returnDays || 7} Days Replacement / Exchange`,
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      };
    }
    return {
      label: `${returnDays || 7} Days Easy Return & 100% Refund`,
      bg: 'bg-blue-50 text-[#143C6B] border-blue-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
    };
  };

  const badge = getBadgeContent();

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all" id={`${idPrefix}-return-policy-container`}>
      {/* Interactive Natural State Header with Arrow Blocker */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(prev => !prev); } }}
        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 select-none transition-colors"
        id={`${idPrefix}-return-policy-header`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#143C6B] flex items-center justify-center font-black shrink-0 shadow-2xs">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Return & Replacement Policy
              </h4>
              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                {badge.icon}
                <span className="truncate">{badge.label}</span>
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
              {isOpen ? 'Click any option to apply & auto-collapse' : 'Tap arrow to expand and customize return terms & window'}
            </p>
          </div>
        </div>

        {/* Arrow Blocker Button (Rotates downwards/upwards) */}
        <div 
          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
            isOpen 
              ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          title={isOpen ? 'Collapse options' : 'Expand return policy options'}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      {/* Expandable Lower-Side Drawer (Automatically contracts on selection) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-200/80 bg-white"
            id={`${idPrefix}-return-policy-dropdown`}
          >
            <div className="p-4 space-y-4">
              
              {/* 1. Policy Mode Selection Cards */}
              <div>
                <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block mb-2">
                  Select Policy Model:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Option 1: Return & Refund */}
                  <button
                    type="button"
                    onClick={() => handleSelectPolicyType('return')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      returnPolicyType === 'return'
                        ? 'bg-blue-50/90 border-[#143C6B] ring-2 ring-[#143C6B]/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Return & 100% Refund</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${returnPolicyType === 'return' ? 'border-[#143C6B] bg-[#143C6B]' : 'border-slate-300'}`}>
                        {returnPolicyType === 'return' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Full money refunded to buyer upon parcel return pickup.
                    </span>
                  </button>

                  {/* Option 2: Replacement Only */}
                  <button
                    type="button"
                    onClick={() => handleSelectPolicyType('replacement')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      returnPolicyType === 'replacement'
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Replacement Only</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${returnPolicyType === 'replacement' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                        {returnPolicyType === 'replacement' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Only size/defect replacement exchange, no cash refund.
                    </span>
                  </button>

                  {/* Option 3: No Return */}
                  <button
                    type="button"
                    onClick={() => handleSelectPolicyType('no_return')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      returnPolicyType === 'no_return'
                        ? 'bg-red-50/90 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">No Return (Final Sale)</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${returnPolicyType === 'no_return' ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                        {returnPolicyType === 'no_return' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Non-returnable item. Closes & contracts automatically.
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Days Window Selection (When Return or Replacement is selected) */}
              {returnPolicyType !== 'no_return' ? (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="text-[11px] text-slate-700 font-extrabold uppercase tracking-wider block">
                        Select Return/Replacement Days Window:
                      </label>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Selecting any day will immediately apply and collapse this panel.
                      </p>
                    </div>

                    {/* Quick Preset Days Buttons */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {[7, 10, 14, 15, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleSelectDays(days)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-black border transition-all cursor-pointer ${
                            returnDays === days
                              ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Days Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10.5px] font-bold text-slate-500">Or Custom Days:</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      placeholder="e.g. 5, 20"
                      value={customDaysInput}
                      onChange={(e) => setCustomDaysInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleApplyCustomDays(e);
                        }
                      }}
                      className="w-24 text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-[#143C6B] bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomDays}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Apply & Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50/70 rounded-xl p-3 border border-red-100 text-red-900 text-xs font-medium flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Item is set as <strong>Non-Returnable</strong>. Buyers will see "Non-Returnable (Final Sale)" badge.</span>
                </div>
              )}

              {/* Close Button / Collapse Indicator */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10.5px] text-slate-400 font-medium">
                  Current: <strong className="text-slate-800">{badge.label}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-[#143C6B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Done / Collapse</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SIZE_PRESETS: Record<string, { label: string; icon: string; items: string[] }> = {
  'Dimensions': {
    label: 'Dimensions & Decor',
    icon: '📐',
    items: ['12x5', '10x8', '12x12', '12x18', '16x16', '18x24', '24x36', '6x4', '5x7', 'King Size', 'Queen Size', 'Double Bed', 'Single Bed']
  },
  'Apparel': {
    label: 'Standard Apparel',
    icon: '👕',
    items: ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']
  },
  'Numeric': {
    label: 'Waist & Numeric',
    icon: '👖',
    items: ['28', '30', '32', '34', '36', '38', '40', '42']
  },
  'Footwear': {
    label: 'Footwear (UK/IND)',
    icon: '👟',
    items: ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12']
  },
  'Kids': {
    label: 'Kids & Baby',
    icon: '👶',
    items: ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', '9-10Y']
  },
  'Volume': {
    label: 'Volume & Weight',
    icon: '🧴',
    items: ['50ml', '100ml', '250ml', '500ml', '1 Litre', '100g', '250g', '500g', '1 kg', '2 kg', '5 kg']
  },
  'Packs': {
    label: 'Packs & Sets',
    icon: '📦',
    items: ['Pack of 1', 'Pack of 2', 'Pack of 3', 'Pack of 4', 'Pack of 5', 'Set of 2', 'Set of 4', 'Combo Set']
  }
};

export interface SizeAndParametersManagerProps {
  sizeOptions: string[];
  setSizeOptions: (sizes: string[]) => void;
  idPrefix?: string;
  themeColor?: string;
}

export const SizeAndParametersManager: React.FC<SizeAndParametersManagerProps> = ({
  sizeOptions,
  setSizeOptions,
  idPrefix = 'vendor',
  themeColor = '#143C6B'
}) => {
  const [customInput, setCustomInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Dimensions');

  const handleToggleSize = (size: string) => {
    if (sizeOptions.includes(size)) {
      setSizeOptions(sizeOptions.filter(s => s !== size));
    } else {
      setSizeOptions([...sizeOptions, size]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    if (!sizeOptions.includes(clean)) {
      setSizeOptions([...sizeOptions, clean]);
    }
    setCustomInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizeOptions(sizeOptions.filter(s => s !== sizeToRemove));
  };

  const handleClearAll = () => {
    setSizeOptions([]);
  };

  const handleAddPresetGroup = (groupKey: string) => {
    const groupItems = SIZE_PRESETS[groupKey]?.items || [];
    const merged = Array.from(new Set([...sizeOptions, ...groupItems]));
    setSizeOptions(merged);
  };

  return (
    <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90" id={`${idPrefix}-size-params-manager`}>
      
      {/* Header & Active Parameters Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <label className="text-[11px] text-slate-800 font-extrabold uppercase tracking-wider block">
              Product Size & Parameter Options *
            </label>
            <span className="text-[10px] text-slate-400 font-medium">
              Add dimensions (e.g. 12x5), standard apparel (S/M/L), footwear, or volume
            </span>
          </div>
        </div>

        {sizeOptions.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10.5px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {sizeOptions.length} Selected
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10.5px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Selected Active Parameter Chips (With Delete 'X') */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 min-h-[48px] flex flex-wrap items-center gap-1.5">
        {sizeOptions.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-300" />
            No sizes or dimensions added yet. Type below or click quick presets.
          </p>
        ) : (
          sizeOptions.map((sz, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-[#143C6B] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-2xs group"
            >
              <span>{sz}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(sz)}
                className="w-4 h-4 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-colors"
                title={`Remove ${sz}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* 1. Custom Parameter Direct Input Bar */}
      <div className="space-y-1.5">
        <label className="text-[10.5px] text-slate-600 font-bold block">
          Type Custom Parameter (e.g. 12x5, 10x8 inch, 500ml, UK 8, King Size):
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. 12x5, 10x8, 16x16, 250ml, UK 9, 34x32, Free Size"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddCustom();
                }
              }}
              className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
              id={`${idPrefix}-custom-size-input`}
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddCustom()}
            disabled={!customInput.trim()}
            className="bg-[#143C6B] hover:bg-[#0D2C4E] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-3xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Parameter</span>
          </button>
        </div>
      </div>

      {/* 2. User-Friendly Parameter Preset Library & Quick-Pick Tabs */}
      <div className="space-y-2 pt-1 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] text-slate-600 font-extrabold uppercase tracking-wide">
            Quick-Select Preset Parameters:
          </span>
          <span className="text-[9.5px] text-slate-400 font-bold">
            1-Click to toggle
          </span>
        </div>

        {/* Preset Category Switcher Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {Object.entries(SIZE_PRESETS).map(([key, group]) => {
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chips for Active Preset Category */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {SIZE_PRESETS[activeCategory]?.items.map((sz) => {
              const isSelected = sizeOptions.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleToggleSize(sz)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  <span>{sz}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Select All from this category */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">
              Preset Category: <strong>{SIZE_PRESETS[activeCategory]?.label}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleAddPresetGroup(activeCategory)}
              className="text-[#143C6B] font-bold hover:underline cursor-pointer"
            >
              + Add All {SIZE_PRESETS[activeCategory]?.label}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export interface StockInventoryManagerProps {
  sizeOptions: string[];
  sizeStock: Record<string, number>;
  setSizeStock: React.Dispatch<React.SetStateAction<Record<string, number>>> | ((updater: ((prev: Record<string, number>) => Record<string, number>) | Record<string, number>) => void);
  totalStock: number;
  setTotalStock: (val: number) => void;
  idPrefix?: string;
}

export const StockInventoryManager: React.FC<StockInventoryManagerProps> = ({
  sizeOptions,
  sizeStock,
  setSizeStock,
  totalStock,
  setTotalStock,
  idPrefix = 'vendor'
}) => {
  const hasMultipleSizes = sizeOptions && sizeOptions.length > 0 && !(sizeOptions.length === 1 && sizeOptions[0] === 'Free Size');

  // Handle setting quantity for a specific size
  const handleSizeQuantityChange = (sizeKey: string, newQty: number) => {
    const validQty = Math.max(0, Math.floor(Number(newQty) || 0));
    const nextSizeStock = {
      ...sizeStock,
      [sizeKey]: validQty
    };
    setSizeStock(nextSizeStock);

    // Recompute total stock
    const sum = Object.values(nextSizeStock).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    setTotalStock(sum);
  };

  // Quick increment/decrement for a specific size
  const handleAdjustSizeStock = (sizeKey: string, delta: number) => {
    const current = Number(sizeStock[sizeKey] ?? 50);
    const next = Math.max(0, current + delta);
    handleSizeQuantityChange(sizeKey, next);
  };

  // Bulk set all sizes to a fixed quantity
  const handleBulkSetAll = (qty: number) => {
    const next: Record<string, number> = {};
    (sizeOptions.length ? sizeOptions : ['Free Size']).forEach(sz => {
      next[sz] = qty;
    });
    setSizeStock(next);
    setTotalStock(qty * (sizeOptions.length || 1));
  };

  // Quick presets for single item stock
  const handleSingleStockPreset = (qty: number) => {
    setTotalStock(qty);
    setSizeStock({ 'Free Size': qty });
  };

  // Get total calculated pieces
  const calculatedTotal = hasMultipleSizes 
    ? sizeOptions.reduce((acc, sz) => acc + (Number(sizeStock[sz] ?? 50)), 0)
    : totalStock;

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs" id={`${idPrefix}-stock-inventory-manager`}>
      
      {/* Header with Live Total Quantity Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0 shadow-2xs">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Stock & Quantity Inventory (Kis Cheej Ki Kitni Quantity)
              </h4>
              <span className="bg-emerald-50 text-emerald-800 text-[10.5px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                Total: {calculatedTotal} Pcs
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
              {hasMultipleSizes 
                ? 'Specify exact inventory for each size & parameter. Deducts on order & restores on return.' 
                : 'Enter the total available pieces you have in stock.'}
            </p>
          </div>
        </div>

        {/* Quick Bulk Preset Actions (If multi-sizes exist) */}
        {hasMultipleSizes && (
          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
            <span className="text-[10px] font-bold text-slate-400">Bulk Apply:</span>
            <button
              type="button"
              onClick={() => handleBulkSetAll(20)}
              className="text-[10.5px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg cursor-pointer transition-all shadow-3xs"
            >
              All 20
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll(50)}
              className="text-[10.5px] font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg cursor-pointer transition-all shadow-3xs"
            >
              All 50
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll(100)}
              className="text-[10.5px] font-bold bg-[#143C6B] text-white hover:bg-[#0D2C4E] px-2.5 py-1 rounded-lg cursor-pointer transition-all shadow-3xs"
            >
              All 100
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetAll(0)}
              className="text-[10.5px] font-bold text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1 rounded-lg cursor-pointer transition-all"
              title="Mark all sizes as Out of Stock"
            >
              All 0 (Out)
            </button>
          </div>
        )}
      </div>

      {/* RENDER MODE A: MULTI-SIZE / PARAMETER STOCK LIST TABLE */}
      {hasMultipleSizes ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sizeOptions.map((sizeKey) => {
              const currentQty = sizeStock[sizeKey] !== undefined ? Number(sizeStock[sizeKey]) : 50;
              const isOutOfStock = currentQty === 0;
              const isLowStock = currentQty > 0 && currentQty < 10;

              return (
                <div
                  key={sizeKey}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isOutOfStock
                      ? 'bg-red-50/50 border-red-200'
                      : isLowStock
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-white border-slate-200/90 shadow-3xs'
                  }`}
                >
                  {/* Left: Size Name & Status */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tracking-wide">
                        {sizeKey}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-extrabold text-red-600 bg-red-100/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          Low: {currentQty} Left
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          In Stock ({currentQty})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      Available pieces for {sizeKey}
                    </span>
                  </div>

                  {/* Right: Stepper & Quick Add */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      onClick={() => handleAdjustSizeStock(sizeKey, -1)}
                      disabled={currentQty <= 0}
                      className="w-7 h-7 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Decrease by 1"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Quantity Number Input */}
                    <input
                      type="number"
                      min={0}
                      value={currentQty}
                      onChange={(e) => handleSizeQuantityChange(sizeKey, Number(e.target.value))}
                      className={`w-14 text-center text-xs font-black border rounded-lg py-1.5 px-1 bg-white focus:outline-hidden focus:border-[#143C6B] ${
                        isOutOfStock ? 'border-red-300 text-red-700' : 'border-slate-300 text-slate-900'
                      }`}
                      id={`${idPrefix}-size-stock-${sizeKey}`}
                    />

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={() => handleAdjustSizeStock(sizeKey, 1)}
                      className="w-7 h-7 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-all"
                      title="Increase by 1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick +10 Booster */}
                    <button
                      type="button"
                      onClick={() => handleAdjustSizeStock(sizeKey, 10)}
                      className="text-[10px] font-black px-1.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                      title="Add 10 pieces"
                    >
                      +10
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#143C6B] shrink-0" />
              Buyers will see real-time availability for each selected size.
            </span>
            <span className="text-[11px] font-bold text-[#143C6B]">
              Total: {calculatedTotal} Pcs
            </span>
          </div>
        </div>
      ) : (
        /* RENDER MODE B: SINGLE ITEM / FREE SIZE STOCK */
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-black text-slate-900 block">
                Available Quantity (Pieces in Warehouse/Shop) *
              </label>
              <span className="text-[10.5px] text-slate-500 font-medium">
                Decrements automatically when buyers place orders.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSingleStockPreset(Math.max(0, totalStock - 1))}
                disabled={totalStock <= 0}
                className="w-8 h-8 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={0}
                value={totalStock}
                onChange={(e) => handleSingleStockPreset(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-24 text-center text-sm font-black border border-slate-300 rounded-xl py-2 px-2 bg-white focus:outline-hidden focus:border-[#143C6B]"
                id={`${idPrefix}-stock-input`}
              />

              <button
                type="button"
                onClick={() => handleSingleStockPreset(totalStock + 1)}
                className="w-8 h-8 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-bold text-slate-400">Quick Set:</span>
            {[20, 50, 100, 250, 500].map(qty => (
              <button
                key={qty}
                type="button"
                onClick={() => handleSingleStockPreset(qty)}
                className={`text-xs px-3 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                  totalStock === qty
                    ? 'bg-[#143C6B] text-white border-[#143C6B] shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {qty} Pcs
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleSingleStockPreset(0)}
              className="text-xs px-3 py-1 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer"
            >
              0 (Out of Stock)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

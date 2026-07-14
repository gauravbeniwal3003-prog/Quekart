import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, MapPin, CheckCircle, ArrowLeft, CreditCard, Ticket, Tag, Percent, ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem, Order, Coupon } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: (order: Order, couponCode?: string, isUpi?: boolean) => void;
  coupons: Coupon[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  coupons
}: CartDrawerProps) {
  // Address form fields
  const [name, setName] = useState('Gaurav Beniwal');
  const [phone, setPhone] = useState('9876543210');
  const [addressLine, setAddressLine] = useState('House 442, Sector 15');
  const [city, setCity] = useState('Gurugram');
  const [pincode, setPincode] = useState('122001');
  const [state, setState] = useState('Haryana');

  // Checkout phases: 'cart' -> 'address' -> 'payment' -> 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'success'>('cart');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Coupon System State
  const [inputCoupon, setInputCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  if (!isOpen) return null;

  // Calculators
  const itemsPrice = cart.reduce((acc, item) => {
    const variantPrice = item.product.variants[item.selectedVariantIndex]?.price || item.product.price;
    return acc + (variantPrice * item.quantity);
  }, 0);

  const originalItemsPrice = cart.reduce((acc, item) => {
    const variantOrig = item.product.variants[item.selectedVariantIndex]?.originalPrice || item.product.originalPrice;
    return acc + (variantOrig * item.quantity);
  }, 0);

  const totalDiscount = originalItemsPrice - itemsPrice;
  const deliveryCharge = 0; // Free delivery representation
  
  // UPI offer calculation (Extra ₹10 off per item if has UPI offer)
  const upiOfferDiscount = cart.some(item => item.product.hasUpiOffer) ? 12 : 0;
  
  // Validate applied coupon against current items price
  const isCouponValid = appliedCoupon ? itemsPrice >= appliedCoupon.minPurchase : false;
  const activeAppliedCoupon = isCouponValid ? appliedCoupon : null;
  const activeCouponDiscount = activeAppliedCoupon
    ? (activeAppliedCoupon.discountType === 'flat'
        ? activeAppliedCoupon.value
        : Math.round((itemsPrice * activeAppliedCoupon.value) / 100))
    : 0;

  const finalPrice = Math.max(0, itemsPrice - upiOfferDiscount - activeCouponDiscount + deliveryCharge);

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      setCouponError('Invalid code. Try QUEKART50, WELCOME20, or MEESHO15!');
      setAppliedCoupon(null);
      return;
    }
    if (itemsPrice < coupon.minPurchase) {
      setCouponError(`Min purchase of ₹${coupon.minPurchase} required for ${coupon.code}.`);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setInputCoupon(coupon.code);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setInputCoupon('');
    setCouponError('');
  };

  const handleNextStep = () => {
    if (checkoutStep === 'cart') {
      if (cart.length === 0) return;
      setCheckoutStep('address');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addressLine || !city || !pincode || !state) {
      alert('Please fill out all address details.');
      return;
    }

    const orderId = `order-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderId(orderId);

    // Build the new order
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const deliveryDate = new Date();
    deliveryDate.setDate(today.getDate() + 5);
    const formattedDelivery = deliveryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const newOrder: Order = {
      id: orderId,
      items: [...cart],
      orderDate: formattedToday,
      deliveryDate: formattedDelivery,
      status: 'Ordered',
      totalPrice: finalPrice,
      shippingAddress: {
        name,
        phone,
        addressLine,
        city,
        pincode,
        state
      }
    };

    onPlaceOrder(newOrder, activeAppliedCoupon?.code, upiOfferDiscount > 0);
    setCheckoutStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans" id="cart-drawer-overlay">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose}></div>

      {/* Slide out Container */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 pb-[60px] md:pb-0" id="cart-drawer-panel">
        
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between" id="cart-header">
          <div className="flex items-center gap-2">
            {checkoutStep === 'address' && (
              <button onClick={() => setCheckoutStep('cart')} className="p-1 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <h2 className="text-sm font-black text-gray-800 tracking-tight uppercase">
              {checkoutStep === 'cart' && 'Shopping Cart'}
              {checkoutStep === 'address' && 'Delivery Address'}
              {checkoutStep === 'success' && 'Order Placed!'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Screen */}
        {checkoutStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" id="cart-success-view">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-lucky-green flex items-center justify-center mb-4 animate-scaleIn">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Order Confirmed!</h3>
            <p className="text-xs text-gray-500 mt-1">Your payment was completed successfully via UPI.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 w-full border border-gray-100 mt-6 text-left">
              <p className="text-[11px] font-bold text-gray-400 uppercase">Order ID</p>
              <p className="text-xs font-extrabold text-gray-800 mt-0.5">{placedOrderId}</p>
              <div className="h-[1px] bg-gray-200 my-2.5"></div>
              <p className="text-[11px] font-bold text-gray-400 uppercase">Deliver to</p>
              <p className="text-xs font-extrabold text-gray-800 mt-0.5">{name}</p>
              <p className="text-xs text-gray-500">{addressLine}, {city}, {pincode}</p>
            </div>

            <button
              onClick={() => {
                onClose();
                setCheckoutStep('cart');
              }}
              className="mt-8 w-full bg-lucky-magenta text-white font-bold py-3.5 rounded-lg text-sm shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
              id="success-back-btn"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="cart-drawer-content">
              {checkoutStep === 'cart' ? (
                /* PHASE 1: Cart Items List */
                cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center" id="empty-cart-state">
                    <span className="text-4xl mb-3">🛒</span>
                    <h3 className="text-sm font-bold text-gray-800">Your cart is empty</h3>
                    <p className="text-xs text-gray-400 mt-1">Explore similar QueKart products to add items here!</p>
                  </div>
                ) : (
                  <div className="space-y-3.5" id="cart-items-list">
                    {cart.map((item) => {
                      const variant = item.product.variants[item.selectedVariantIndex] || {
                        imageUrl: item.product.images[0],
                        price: item.product.price,
                        originalPrice: item.product.originalPrice,
                        colorName: 'Default'
                      };
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200/80 rounded-lg p-3 flex items-start gap-3.5 relative"
                          id={`cart-item-${item.id}`}
                        >
                          {/* Remove Button */}
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Image */}
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                            <img src={variant.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className="text-xs font-bold text-gray-800 truncate" title={item.product.title}>
                              {item.product.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Size: <span className="font-bold text-gray-700">{item.selectedSize}</span>
                              <span className="mx-2">|</span>
                              Color: <span className="font-bold text-gray-700">{variant.colorName}</span>
                            </p>

                            <div className="flex items-baseline gap-1.5 mt-2">
                              <span className="text-sm font-black text-slate-900 premium-rupee">₹{variant.price}</span>
                              <span className="text-[10px] text-gray-400 line-through font-semibold">₹{variant.originalPrice}</span>
                              <span className="text-[10px] text-lucky-green font-extrabold tracking-tight">{item.product.discountPercent}% Off</span>
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 mt-2.5">
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-100 border border-gray-200 rounded-md text-xs font-bold flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-100 border border-gray-200 rounded-md text-xs font-bold flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Safety guarantee */}
                    <div className="bg-emerald-50 border border-emerald-100/60 rounded-md p-3 flex gap-2.5 items-start mt-4">
                      <ShieldCheck className="w-5 h-5 text-lucky-green flex-shrink-0" />
                      <div>
                        <h4 className="text-[11px] font-extrabold text-emerald-950">QueKart Safety Guarantee</h4>
                        <p className="text-[10px] text-emerald-800/80 leading-snug mt-0.5">Safe payments, 100% genuine suppliers, and secure tracking information.</p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* PHASE 2: Address Form */
                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5" id="checkout-address-form">
                  <div className="bg-pink-50/40 p-3 rounded-lg border border-pink-100/50 flex items-center gap-2 text-xs font-medium text-pink-900">
                    <MapPin className="w-4 h-4 text-lucky-magenta" />
                    <span>Please provide a valid Indian shipping address.</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                      placeholder="Receiver's name"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Flat/House/Street Address</label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                      placeholder="Flat no., Street name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                        placeholder="e.g. Gurugram"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                        placeholder="6-digit PIN"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
                      placeholder="e.g. Haryana"
                    />
                  </div>

                  <button type="submit" className="hidden" id="hidden-form-submit-btn"></button>
                </form>
              )}

              {/* Interactive Coupon System Section */}
              {checkoutStep === 'cart' && cart.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200/80 p-3.5 space-y-3 shadow-3xs" id="coupon-section">
                  <div className="flex items-center gap-2 text-gray-800 font-extrabold text-xs tracking-wide uppercase">
                    <Ticket className="w-4 h-4 text-lucky-magenta" />
                    <span>Select & Apply Coupon</span>
                  </div>

                  {/* Input form */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inputCoupon}
                        onChange={(e) => {
                          setInputCoupon(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Enter Promo Code (e.g. QUEKART50)"
                        className="w-full bg-slate-50 border border-gray-200/80 rounded-md pl-8 pr-3 py-2 text-xs font-semibold tracking-wider text-gray-800 focus:outline-hidden focus:border-lucky-magenta uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-normal"
                        id="coupon-input-field"
                      />
                      <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {activeAppliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-xs px-4 py-2 rounded-md transition-all cursor-pointer"
                        id="remove-coupon-btn"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(inputCoupon)}
                        className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-4 py-2 rounded-md transition-all cursor-pointer shadow-2xs"
                        id="apply-coupon-btn"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Error & Success States */}
                  {couponError && (
                    <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-md px-2.5 py-1.5 leading-normal" id="coupon-error-message">
                      ⚠️ {couponError}
                    </p>
                  )}

                  {appliedCoupon && !isCouponValid && (
                    <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-md p-2.5 leading-normal" id="coupon-invalid-alert">
                      ⚠️ <span className="font-extrabold">{appliedCoupon.code}</span> is inactive. Add items worth <span className="font-extrabold text-gray-900">₹{appliedCoupon.minPurchase - itemsPrice}</span> more to unlock ₹{appliedCoupon.value} discount!
                    </div>
                  )}

                  {activeAppliedCoupon && (
                    <div className="bg-emerald-50 border border-emerald-100/80 rounded-md p-2.5 flex items-center justify-between" id="coupon-success-alert">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-lucky-green flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-emerald-950 uppercase tracking-wider">{activeAppliedCoupon.code} Applied!</p>
                          <p className="text-[10px] text-emerald-800 font-bold">
                            Saved <span className="text-emerald-950 font-extrabold text-xs">₹{activeCouponDiscount}</span> with this coupon.
                          </p>
                        </div>
                      </div>
                      <span className="bg-emerald-200/50 text-lucky-green text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider">ACTIVE</span>
                    </div>
                  )}

                  {/* Available Coupons list toggle */}
                  <div className="border-t border-dashed border-gray-100 pt-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="w-full flex items-center justify-between text-left text-xs font-extrabold text-gray-600 hover:text-lucky-magenta py-1 cursor-pointer"
                      id="view-coupons-toggle"
                    >
                      <span className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-lucky-magenta" />
                        View Available Coupons ({coupons.length})
                      </span>
                      {showAllCoupons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAllCoupons && (
                      <div className="space-y-2 mt-2.5 max-h-[160px] overflow-y-auto pr-1" id="coupons-list">
                        {coupons.map((coupon) => {
                          const isEligible = itemsPrice >= coupon.minPurchase;
                          const isCurrentlyApplied = activeAppliedCoupon?.code === coupon.code;
                          
                          return (
                            <div
                              key={coupon.code}
                              onClick={() => isEligible && handleApplyCoupon(coupon.code)}
                              className={`border rounded-lg p-2.5 flex items-center justify-between transition-all ${
                                isCurrentlyApplied
                                  ? 'bg-emerald-50/50 border-lucky-green/50'
                                  : isEligible
                                  ? 'bg-white border-gray-200 hover:border-lucky-magenta cursor-pointer'
                                  : 'bg-gray-50/50 border-gray-150 opacity-60'
                              }`}
                              id={`coupon-card-${coupon.code}`}
                            >
                              <div className="space-y-1 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider border ${
                                    isCurrentlyApplied
                                      ? 'bg-emerald-100 border-lucky-green/40 text-lucky-green'
                                      : 'bg-lucky-magenta/5 border-lucky-magenta/20 text-lucky-magenta'
                                  }`}>
                                    {coupon.code}
                                  </span>
                                  {!isEligible && (
                                    <span className="text-[9px] text-amber-600 font-extrabold bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                      Needs ₹{coupon.minPurchase} min
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 font-semibold leading-tight">
                                  {coupon.description}
                                </p>
                              </div>
                              
                              <div>
                                {isCurrentlyApplied ? (
                                  <span className="text-[10px] font-black text-lucky-green uppercase tracking-wider flex items-center gap-0.5">
                                    <CheckCircle className="w-3.5 h-3.5" /> Applied
                                  </span>
                                ) : isEligible ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApplyCoupon(coupon.code);
                                    }}
                                    className="bg-white border border-lucky-magenta text-lucky-magenta hover:bg-lucky-magenta hover:text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
                                  >
                                    APPLY
                                  </button>
                                ) : (
                                  <span className="text-[9px] font-extrabold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm">Locked</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing breakdown box - visible on both cart and address phases */}
              {cart.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-150" id="pricing-breakdown">
                  <h3 className="text-xs font-extrabold text-gray-700 tracking-tight mb-2.5 uppercase">Price Details</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Total Product MRP</span>
                      <span className="font-extrabold text-slate-700 premium-rupee">₹{originalItemsPrice}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Supplier Discount</span>
                      <span className="font-extrabold text-lucky-green premium-rupee">-₹{totalDiscount}</span>
                    </div>
                    {upiOfferDiscount > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>UPI Extra Offer Off</span>
                        <span className="font-extrabold text-lucky-green premium-rupee">-₹{upiOfferDiscount}</span>
                      </div>
                    )}
                    {activeCouponDiscount > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Coupon Discount ({activeAppliedCoupon?.code})</span>
                        <span className="font-extrabold text-lucky-green premium-rupee">-₹{activeCouponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery Charges</span>
                      <span className="font-extrabold text-lucky-green flex items-center gap-1">
                        <span className="line-through text-gray-400 text-[10px] font-medium">₹40</span> Free
                      </span>
                    </div>
                    <div className="h-[1px] bg-gray-200 my-2"></div>
                    <div className="flex justify-between text-sm font-black text-gray-900">
                      <span>Order Total</span>
                      <span className="text-base font-black text-slate-900 premium-rupee">₹{finalPrice}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom sticky action bar inside drawer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-white" id="cart-drawer-footer">
                {checkoutStep === 'cart' ? (
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-lucky-magenta hover:bg-opacity-95 text-white font-extrabold py-3.5 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                    id="cart-continue-btn"
                  >
                    <span>Proceed to Delivery</span>
                  </button>
                ) : (
                  <button
                    onClick={() => document.getElementById('hidden-form-submit-btn')?.click()}
                    className="w-full bg-lucky-magenta hover:bg-opacity-95 text-white font-extrabold py-3.5 rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    id="cart-pay-btn"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{finalPrice} via UPI</span>
                  </button>
                )}
                <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">Safe payments • Direct manufacturing prices</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

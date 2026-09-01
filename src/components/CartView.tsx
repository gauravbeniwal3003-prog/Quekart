import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  CheckCircle, 
  ArrowLeft, 
  CreditCard, 
  Ticket, 
  Tag, 
  Percent, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Lock, 
  User, 
  Phone, 
  Wrench, 
  AlertTriangle, 
  Truck, 
  Wallet, 
  Smartphone, 
  Check,
  ShoppingBag,
  Building2,
  Home,
  Plus,
  Edit2,
  Bookmark
} from 'lucide-react';
import { CartItem, Order, Coupon, SavedAddress } from '../types';
import { getApiUrl } from '../utils/api';
import { resetScrollToTop } from '../utils/scroll';
import { getProductPricing } from '../utils/pricing';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onPlaceOrder: (order: Order, couponCode?: string, isUpi?: boolean) => void;
  coupons: Coupon[];
  currentUser?: any;
  onNavigate?: (path: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  coupons,
  currentUser,
  onNavigate
}: CartDrawerProps) {
  // Address form fields
  const [name, setName] = useState(() => currentUser?.name || '');
  const phone = currentUser?.phone || ''; // Locked to logged-in mobile
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(() => (currentUser?.gender as any) || 'Male');
  const [age, setAge] = useState<string>(() => currentUser?.age ? String(currentUser.age) : '');
  const [alternativePhone, setAlternativePhone] = useState(() => currentUser?.alternativePhone || '');
  const [addressLine, setAddressLine] = useState(() => currentUser?.address || '');
  const [city, setCity] = useState(() => currentUser?.city || '');
  const [pincode, setPincode] = useState(() => currentUser?.pincode || '');
  const [state, setState] = useState(() => currentUser?.state || '');

  // Saved Address Book state
  const getInitialSavedAddresses = (): SavedAddress[] => {
    const userPhoneKey = currentUser?.phone || 'guest';
    const stored = localStorage.getItem(`quekart_saved_addresses_${userPhoneKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    
    // Default initial addresses
    const userName = currentUser?.name || 'Rahul Sharma';
    const uPhone = currentUser?.phone || '9876543210';
    const uAddress = currentUser?.address || 'Flat 402, Block B, Green Heights, Vaishali Nagar';
    const uCity = currentUser?.city || 'Jaipur';
    const uState = currentUser?.state || 'Rajasthan';
    const uPincode = currentUser?.pincode || '302021';
    const uAlt = currentUser?.alternativePhone || '';

    return [
      {
        id: 'addr-home',
        label: 'Home',
        name: userName,
        phone: uPhone,
        addressLine: uAddress,
        city: uCity,
        state: uState,
        pincode: uPincode,
        alternativePhone: uAlt,
        isDefault: true
      },
      {
        id: 'addr-office',
        label: 'Office',
        name: userName,
        phone: uPhone,
        addressLine: 'Floor 3, Corporate Park 2, Malviya Nagar Industrial Area',
        city: uCity,
        state: uState,
        pincode: '302017',
        alternativePhone: uAlt,
        isDefault: false
      }
    ];
  };

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(getInitialSavedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    const def = savedAddresses.find(a => a.isDefault);
    return def ? def.id : (savedAddresses[0]?.id || '');
  });

  // Modal / Form state for Adding & Editing Saved Address
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form Fields for New / Edit Address
  const [formLabel, setFormLabel] = useState<'Home' | 'Office' | 'Other'>('Home');
  const [formName, setFormName] = useState('');
  const [formAddressLine, setFormAddressLine] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPincode, setFormPincode] = useState('');
  const [formState, setFormState] = useState('');
  const [formAltPhone, setFormAltPhone] = useState('');

  // Persist savedAddresses to localStorage whenever updated
  useEffect(() => {
    const userPhoneKey = currentUser?.phone || 'guest';
    localStorage.setItem(`quekart_saved_addresses_${userPhoneKey}`, JSON.stringify(savedAddresses));
  }, [savedAddresses, currentUser?.phone]);

  // Handle 1-Tap Saved Address Selection
  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setName(addr.name);
    setAddressLine(addr.addressLine);
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setAlternativePhone(addr.alternativePhone || '');
    setIsEditingAddress(false);
  };

  // Keep fields synchronized with selected address
  useEffect(() => {
    const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
    if (activeAddr) {
      setName(activeAddr.name);
      setAddressLine(activeAddr.addressLine);
      setCity(activeAddr.city);
      setState(activeAddr.state);
      setPincode(activeAddr.pincode);
      setAlternativePhone(activeAddr.alternativePhone || '');
    }
  }, [selectedAddressId, savedAddresses]);

  // Open "Add New Address" modal
  const handleOpenAddAddress = () => {
    setFormLabel('Home');
    setFormName(name || currentUser?.name || '');
    setFormAddressLine('');
    setFormCity(city || currentUser?.city || '');
    setFormPincode(pincode || currentUser?.pincode || '');
    setFormState(state || currentUser?.state || '');
    setFormAltPhone('');
    setEditingAddressId(null);
    setIsAddressModalOpen(true);
  };

  // Open "Edit Saved Address" modal
  const handleOpenEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormLabel((addr.label as any) || 'Home');
    setFormName(addr.name);
    setFormAddressLine(addr.addressLine);
    setFormCity(addr.city);
    setFormPincode(addr.pincode);
    setFormState(addr.state);
    setFormAltPhone(addr.alternativePhone || '');
    setEditingAddressId(addr.id);
    setIsAddressModalOpen(true);
  };

  // Save new or edited address to Address Book
  const handleSaveAddressToBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddressLine.trim() || !formCity.trim() || !formPincode.trim() || !formState.trim()) {
      alert('Please fill out all address fields.');
      return;
    }

    if (editingAddressId) {
      setSavedAddresses(prev => prev.map(a => a.id === editingAddressId ? {
        ...a,
        label: formLabel,
        name: formName,
        addressLine: formAddressLine,
        city: formCity,
        pincode: formPincode,
        state: formState,
        alternativePhone: formAltPhone
      } : a));
      setSelectedAddressId(editingAddressId);
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: formLabel,
        name: formName,
        phone: phone || '9876543210',
        addressLine: formAddressLine,
        city: formCity,
        pincode: formPincode,
        state: formState,
        alternativePhone: formAltPhone,
        isDefault: savedAddresses.length === 0
      };
      setSavedAddresses(prev => [...prev, newAddr]);
      handleSelectSavedAddress(newAddr);
    }

    setIsAddressModalOpen(false);
    setEditingAddressId(null);
  };

  // Delete saved address
  const handleDeleteSavedAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedAddresses.length <= 1) {
      alert('You must keep at least one address in your address book.');
      return;
    }
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (selectedAddressId === id) {
      if (updated.length > 0) {
        handleSelectSavedAddress(updated[0]);
      }
    }
  };

  // Payment Method state: 'upi' | 'cod' | 'card'
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');

  // Address editing mode vs saved selection
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Local Search state
  const [searchQuery, setSearchQuery] = useState('');

  // App Under Update Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    resetScrollToTop();
  }, []);

  // Sync user profile fields when currentUser updates
  useEffect(() => {
    if (currentUser) {
      if (!name && currentUser.name) setName(currentUser.name);
      if (!addressLine && currentUser.address) setAddressLine(currentUser.address);
      if (!city && currentUser.city) setCity(currentUser.city);
      if (!pincode && currentUser.pincode) setPincode(currentUser.pincode);
      if (!state && currentUser.state) setState(currentUser.state);
      if (!alternativePhone && currentUser.alternativePhone) setAlternativePhone(currentUser.alternativePhone);
      if (currentUser.gender) setGender(currentUser.gender);
      if (currentUser.age) setAge(String(currentUser.age));
    }
  }, [currentUser]);

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
  
  // UPI offer calculation (applied if paymentMethod === 'upi')
  const upiOfferDiscount = paymentMethod === 'upi' ? cart.reduce((sum, item) => {
    if (item.product.hasUpiOffer === false) return sum;
    const vPrice = item.product.variants[item.selectedVariantIndex]?.price || item.product.price;
    const pricing = getProductPricing({
      ...item.product,
      price: vPrice,
    });
    return sum + (pricing.upiDiscountAmount * item.quantity);
  }, 0) : 0;
  
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

  const handleBuyNowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (cart.length === 0) return;

    if (!currentUser) {
      alert('Authentication Required! Before placing any order, it is compulsory to sign up or sign in using your mobile number and OTP.');
      if (onNavigate) {
        onNavigate('/user');
      }
      return;
    }

    if (!name.trim() || !addressLine.trim() || !city.trim() || !pincode.trim() || !state.trim()) {
      setAddressError('Please fill all required delivery address details (Name, Flat/Street, City, Pincode, State).');
      setIsEditingAddress(true);
      // Scroll to address form
      document.getElementById('address-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Persist complete customer profile & address to server database in background
    try {
      const token = localStorage.getItem('quekart_user_token');
      fetch(getApiUrl('/api/user/profile'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          phone: phone,
          name: name,
          gender: gender,
          age: age ? Number(age) : 25,
          alternativePhone: alternativePhone,
          address: addressLine,
          city: city,
          state: state,
          pincode: pincode
        })
      }).catch(() => {});
    } catch (_) {}

    // Show "App is Under Update" notice as requested!
    setShowUpdateModal(true);
  };

  const filteredCart = cart.filter(item => item.product.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const hasCompleteAddress = Boolean(name.trim() && addressLine.trim() && city.trim() && pincode.trim() && state.trim());

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-130px)] pb-24 w-full flex justify-center font-sans px-0 sm:px-4 py-0 sm:py-6" id="cart-view-container">
      {/* Main Container */}
      <div className="relative w-full max-w-md md:max-w-4xl lg:max-w-5xl bg-white h-full min-h-screen sm:min-h-0 sm:rounded-2xl sm:border border-gray-200/80 flex flex-col shadow-sm z-10 overflow-hidden" id="cart-view-panel">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white px-4 sm:px-6 py-3.5 border-b border-gray-200/80 flex items-center justify-between shadow-xs" id="cart-sticky-header">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                if (onNavigate) {
                  onNavigate('/shop');
                } else {
                  onClose();
                }
              }} 
              className="p-1.5 hover:bg-slate-100 rounded-full cursor-pointer text-slate-700 transition-colors"
              title="Back to Shopping"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-lucky-magenta" />
                <span>Order Billing & Checkout</span>
                <span className="bg-lucky-magenta/10 text-lucky-magenta text-[10px] font-extrabold px-2 py-0.5 rounded-full lowercase">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center" id="empty-cart-state">
            <div className="w-20 h-20 bg-pink-50 text-lucky-magenta rounded-full flex items-center justify-center mb-4 shadow-3xs">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-base font-black text-slate-900">Your Checkout Cart is Empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">Select products from the store and click Buy Now to proceed directly to billing!</p>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('/shop');
                else onClose();
              }}
              className="mt-6 bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleBuyNowSubmit} className="flex-1 flex flex-col">
            {/* Scrollable Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:grid md:grid-cols-12 md:gap-6 lg:gap-8 items-start space-y-4 md:space-y-0" id="cart-drawer-content">
              
              {/* LEFT COLUMN: Items List + Delivery Address + Payment Method */}
              <div className="md:col-span-7 space-y-5">
                
                {/* 1. PRODUCT ORDER ITEM(S) SECTION WITH QUANTITY SELECTOR */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-3xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-lucky-magenta" />
                      1. Product(s) to Order ({cart.length})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold">Verify size & quantity</span>
                  </div>

                  {filteredCart.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No items match "{searchQuery}"</p>
                  ) : (
                    <div className="space-y-3" id="cart-items-list">
                      {filteredCart.map((item, idx) => {
                        const variant = item.product.variants[item.selectedVariantIndex] || {
                          imageUrl: (item.product.images && item.product.images[0]) || '',
                          price: item.product.price,
                          originalPrice: item.product.originalPrice,
                          colorName: 'Default'
                        };
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.1) }}
                            className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex gap-3 relative"
                            id={`cart-item-${item.id}`}
                          >
                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-500 cursor-pointer p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Image */}
                            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-3xs">
                              <img src={variant.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 pr-5 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={item.product.title}>
                                  {item.product.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-extrabold text-slate-800">
                                    Size: {item.selectedSize}
                                  </span>
                                  {variant.colorName && variant.colorName !== 'Default' && (
                                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700">
                                      {variant.colorName}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/50">
                                {/* Price */}
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm sm:text-base font-black text-slate-950 premium-rupee">
                                    ₹{variant.price * item.quantity}
                                  </span>
                                  <span className="text-[10px] text-slate-400 line-through font-semibold">
                                    ₹{variant.originalPrice * item.quantity}
                                  </span>
                                  <span className="text-[10px] text-lucky-green font-extrabold">
                                    {item.product.discountPercent}% OFF
                                  </span>
                                </div>

                                {/* QUANTITY SELECTOR (- 1 +) */}
                                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-0.5 shadow-3xs">
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded font-bold text-xs cursor-pointer disabled:opacity-40"
                                    title="Decrease Quantity"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center text-xs font-black text-slate-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded font-bold text-xs cursor-pointer"
                                    title="Increase Quantity"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Safety badge */}
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-center mt-3">
                    <ShieldCheck className="w-4 h-4 text-lucky-green flex-shrink-0" />
                    <p className="text-[11px] text-emerald-900 font-semibold leading-snug">
                      QueKart Guarantee: <span className="font-normal text-emerald-800">100% Genuine products, verified seller & easy doorstep delivery.</span>
                    </p>
                  </div>
                </div>

                {/* 2. SAVED ADDRESS BOOK & DELIVERY ADDRESS SECTION */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-3xs" id="address-section-anchor">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-lucky-magenta" />
                      2. Delivery Address Book
                    </h3>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="text-[11px] font-extrabold text-lucky-magenta hover:bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {addressError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-600 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{addressError}</span>
                    </div>
                  )}

                  {/* SAVED ADDRESS CARDS (1-TAP SELECT) */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Select Saved Address (1-Tap Selection):
                    </p>

                    <div className="grid grid-cols-1 gap-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        
                        let labelIcon = <Home className="w-3.5 h-3.5" />;
                        let labelColor = 'bg-blue-50 text-blue-700 border-blue-200';
                        if (addr.label === 'Office') {
                          labelIcon = <Building2 className="w-3.5 h-3.5" />;
                          labelColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                        } else if (addr.label === 'Other') {
                          labelIcon = <MapPin className="w-3.5 h-3.5" />;
                          labelColor = 'bg-amber-50 text-amber-800 border-amber-200';
                        }

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`border-2 rounded-xl p-3 transition-all cursor-pointer relative flex items-start gap-3 ${
                              isSelected
                                ? 'border-lucky-magenta bg-pink-50/40 shadow-3xs'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              <input
                                type="radio"
                                name="selectedAddressRadio"
                                checked={isSelected}
                                onChange={() => handleSelectSavedAddress(addr)}
                                className="accent-lucky-magenta w-4 h-4 cursor-pointer"
                              />
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${labelColor}`}>
                                    {labelIcon}
                                    <span>{addr.label.toUpperCase()}</span>
                                  </span>
                                  <span className="text-xs font-extrabold text-slate-900">{addr.name}</span>
                                  {addr.isDefault && (
                                    <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>
                                  )}
                                </div>

                                {/* Edit & Delete controls */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditAddress(addr, e)}
                                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                                    title="Edit address"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteSavedAddress(addr.id, e)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                    title="Delete address"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {addr.addressLine}, {addr.city}, {addr.state} - <span className="font-bold text-slate-900">{addr.pincode}</span>
                              </p>

                              <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 pt-0.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                Mobile: +91 {addr.phone.replace(/[^0-9]/g, '').slice(-10)}
                                {addr.alternativePhone ? ` (Alt: ${addr.alternativePhone})` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. PAYMENT METHOD SELECTION SECTION */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3.5 shadow-3xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-lucky-magenta" />
                      3. Select Payment Method
                    </h3>
                    <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                      100% Secure Checkout
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Option 1: UPI */}
                    <label
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'upi'
                          ? 'border-lucky-magenta bg-pink-50/40 shadow-3xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="mt-1 accent-lucky-magenta w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Smartphone className="w-4 h-4 text-lucky-magenta" />
                            UPI / GPay / PhonePe / Paytm
                          </span>
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">
                            Fast & Extra Offer
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Instant checkout with any UPI payment app.</p>
                      </div>
                    </label>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-lucky-magenta bg-pink-50/40 shadow-3xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-lucky-magenta w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <Wallet className="w-4 h-4 text-slate-700" />
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            Pay on delivery
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash or UPI when order reaches your address.</p>
                      </div>
                    </label>

                    {/* Option 3: Credit/Debit Card/Net Banking */}
                    <label
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-lucky-magenta bg-pink-50/40 shadow-3xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 accent-lucky-magenta w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-slate-700" />
                            Credit / Debit Card / Net Banking
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Visa, MasterCard, RuPay & NetBanking supported.</p>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Coupons + Cost Breakdown + Final Action */}
              <div className="md:col-span-5 space-y-4">
                
                {/* 4. COUPONS & PROMO CODE SECTION */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-3xs" id="coupon-section">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs tracking-wider uppercase">
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta uppercase placeholder:normal-case placeholder:font-normal"
                        id="coupon-input-field"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {activeAppliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-extrabold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer"
                        id="remove-coupon-btn"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon(inputCoupon)}
                        className="bg-lucky-magenta text-white hover:bg-opacity-90 font-extrabold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-2xs"
                        id="apply-coupon-btn"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Coupon Feedback */}
                  {couponError && (
                    <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-md px-2.5 py-1.5 leading-normal">
                      ⚠️ {couponError}
                    </p>
                  )}

                  {activeAppliedCoupon && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-lucky-green shrink-0" />
                        <div>
                          <p className="text-xs font-black text-emerald-950 uppercase">{activeAppliedCoupon.code} Applied!</p>
                          <p className="text-[10px] text-emerald-800 font-bold">Saved ₹{activeCouponDiscount} with this code.</p>
                        </div>
                      </div>
                      <span className="bg-emerald-200/60 text-lucky-green text-[9px] font-black px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>
                  )}

                  {/* Available Coupons Drawer */}
                  <div className="border-t border-dashed border-slate-200 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="w-full flex items-center justify-between text-left text-xs font-extrabold text-slate-700 hover:text-lucky-magenta py-1 cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-lucky-magenta" />
                        View Available Coupons ({coupons.length})
                      </span>
                      {showAllCoupons ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAllCoupons && (
                      <div className="space-y-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
                        {coupons.map((coupon) => {
                          const isEligible = itemsPrice >= coupon.minPurchase;
                          const isCurrentlyApplied = activeAppliedCoupon?.code === coupon.code;
                          
                          return (
                            <div
                              key={coupon.code}
                              onClick={() => isEligible && handleApplyCoupon(coupon.code)}
                              className={`border rounded-lg p-2 flex items-center justify-between transition-all ${
                                isCurrentlyApplied
                                  ? 'bg-emerald-50 border-lucky-green'
                                  : isEligible
                                  ? 'bg-white border-slate-200 hover:border-lucky-magenta cursor-pointer'
                                  : 'bg-slate-50 border-slate-200 opacity-60'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-lucky-magenta/10 text-lucky-magenta tracking-wider">
                                  {coupon.code}
                                </span>
                                <p className="text-[10px] text-slate-500 font-medium">{coupon.description}</p>
                              </div>
                              {isCurrentlyApplied ? (
                                <span className="text-[10px] font-bold text-lucky-green">Applied</span>
                              ) : isEligible ? (
                                <span className="text-[10px] font-extrabold text-lucky-magenta">APPLY</span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. FINAL COST BREAKDOWN & PRICING DETAILS */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-3xs space-y-3" id="pricing-breakdown">
                  <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase pb-2 border-b border-slate-100">
                    Price Details ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Product MRP</span>
                      <span className="font-extrabold text-slate-800 premium-rupee">₹{originalItemsPrice}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Supplier Discount</span>
                      <span className="font-extrabold text-lucky-green premium-rupee">-₹{totalDiscount}</span>
                    </div>

                    {upiOfferDiscount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>UPI Payment Offer Off</span>
                        <span className="font-extrabold text-lucky-green premium-rupee">-₹{upiOfferDiscount}</span>
                      </div>
                    )}

                    {activeCouponDiscount > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Coupon Discount ({activeAppliedCoupon?.code})</span>
                        <span className="font-extrabold text-lucky-green premium-rupee">-₹{activeCouponDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charges</span>
                      <span className="font-extrabold text-lucky-green flex items-center gap-1">
                        <span className="line-through text-slate-400 text-[10px]">₹40</span> FREE
                      </span>
                    </div>

                    <div className="h-[1px] bg-slate-200 my-2"></div>

                    <div className="flex justify-between text-sm font-black text-slate-950 pt-0.5">
                      <span>Total Payable Amount</span>
                      <span className="text-lg font-black text-slate-950 premium-rupee">
                        ₹{finalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Action Button */}
                  <div className="hidden md:block pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 active:scale-[0.99] text-white font-extrabold py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      id="cart-buy-now-desktop-btn"
                    >
                      <span>BUY NOW • ₹{finalPrice}</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">100% Safe Payments • Easy Returns</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Mobile Bottom Fixed Buy Now Bar */}
            <div className="md:hidden p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-slate-200/80 bg-white/95 backdrop-blur-md sticky bottom-0 z-40 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]" id="cart-drawer-footer">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Final Total</span>
                <span className="text-base font-black text-slate-950 premium-rupee">₹{finalPrice}</span>
              </div>

              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 active:scale-[0.99] text-white font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 h-11"
                id="cart-buy-now-mobile-btn"
              >
                <span>BUY NOW</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* ========================================== */}
      {/* "APP IS UNDER UPDATE" NOTIFICATION MODAL   */}
      {/* ========================================== */}
      <AnimatePresence>
        {showUpdateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" id="app-update-modal">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              {/* Decorative top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-lucky-magenta to-amber-500" />

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-pulse">
                <Wrench className="w-8 h-8 stroke-[2.2]" />
              </div>

              {/* Title & Badge */}
              <div className="inline-block bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                System Notice
              </div>
              <h3 className="text-lg font-black text-slate-950 tracking-tight">
                App is Under Update
              </h3>

              {/* Explanatory Message */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                Our checkout and order processing system is currently undergoing scheduled maintenance & system updates. Ordering will resume shortly!
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    if (onNavigate) {
                      onNavigate('/shop');
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 text-white font-extrabold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Back to Shopping
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                Thank you for your patience and understanding.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* ADD / EDIT SAVED ADDRESS MODAL             */}
      {/* ========================================== */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" id="saved-address-modal">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-lucky-magenta" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    {editingAddressId ? 'Edit Saved Address' : 'Add New Address'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAddressToBook} className="space-y-3.5">
                {/* Address Label Selector */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Address Type / Label *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormLabel('Home')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formLabel === 'Home'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLabel('Office')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formLabel === 'Office'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Office</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLabel('Other')}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formLabel === 'Other'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Other</span>
                    </button>
                  </div>
                </div>

                {/* Receiver Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                    placeholder="Receiver's Name (e.g. Rahul Sharma)"
                  />
                </div>

                {/* Street / Address Line */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Flat / House No. / Building / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={formAddressLine}
                    onChange={(e) => setFormAddressLine(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                    placeholder="House / Flat No., Street, Area"
                  />
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                      placeholder="e.g. Jaipur"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formPincode}
                      onChange={(e) => setFormPincode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                      placeholder="6-digit PIN"
                    />
                  </div>
                </div>

                {/* State & Alt Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                      placeholder="e.g. Rajasthan"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Alt Phone (Optional)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formAltPhone}
                      onChange={(e) => setFormAltPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-lucky-magenta focus:bg-white transition-colors"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#0B1E36] via-[#143C6B] to-[#0B1E36] hover:brightness-110 text-white font-extrabold px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    Save & Use Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

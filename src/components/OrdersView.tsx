import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, ChevronRight, Package, RotateCcw, CheckCircle2, AlertCircle, Clock, ShieldCheck, Wallet, ArrowLeft, X } from 'lucide-react';
import { Order } from '../types';
import { resetScrollToTop } from '../utils/scroll';
import { OrderItemSkeleton } from './common/Skeletons';

interface OrdersViewProps {
  orders: Order[];
  onSelectProduct: (productId: string) => void;
  onSelectTab: (tab: string) => void;
  currentUser?: any;
  onReturnOrder?: (orderId: string, reason?: string) => Promise<{ success: boolean; refundAmount?: number; error?: string }>;
  isLoading?: boolean;
}

export default function OrdersView({
  orders,
  onSelectProduct,
  onSelectTab,
  currentUser,
  onReturnOrder,
  isLoading = false
}: OrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Quality issue');
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    resetScrollToTop();
  }, []);

  // If user is not logged in (guest mode), show clean Meesho-style Logged-Out Orders State
  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 w-full" id="orders-logged-out-view">
        <div className="max-w-md mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#143C6B] shadow-sm mb-4">
            <Package className="w-10 h-10 stroke-[1.8]" />
          </div>

          <h2 className="text-lg font-black text-slate-900 tracking-tight">You are not logged in</h2>
          <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed max-w-xs">
            Sign in with your mobile number to view past purchases, live shipment status, and request hassle-free returns.
          </p>

          <div className="w-full space-y-2.5 mt-6">
            <button
              onClick={() => onSelectTab('user')}
              className="w-full py-3 bg-[#143C6B] hover:bg-[#0C2340] active:scale-[0.99] text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer uppercase tracking-wider"
              id="orders-login-btn"
            >
              Sign In / Log In
            </button>

            <button
              onClick={() => onSelectTab('home')}
              className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              id="orders-browse-btn"
            >
              Continue Shopping as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders by title of the product inside
  const filteredOrders = orders.filter((order) =>
    (order.items || []).some((item) =>
      item.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmReturn = async () => {
    if (!returnModalOrder || !onReturnOrder) return;
    setIsSubmittingReturn(true);
    const finalReason = returnReason === 'Other' ? (customReason.trim() || 'Other reason') : returnReason;
    
    try {
      const res = await onReturnOrder(returnModalOrder.id, finalReason);
      if (res.success) {
        setReturnSuccessMessage(`₹${res.refundAmount || returnModalOrder.totalPrice} has been credited to your QueKart Wallet instantly!`);
        setReturnModalOrder(null);
        setCustomReason('');
        setTimeout(() => setReturnSuccessMessage(null), 6000);
      } else {
        alert(res.error || 'Failed to process return. Please try again.');
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred while processing return');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 w-full" id="orders-view-container">
      {/* Sticky Header Section */}
      <div className="sticky top-[52px] md:top-[64px] z-40 bg-gray-50 px-4 pt-3 pb-3 border-b border-gray-200/80 shadow-xs" id="orders-sticky-header">
        {/* Search orders & filters row */}
        <div className="max-w-4xl lg:max-w-5xl mx-auto flex items-center gap-3" id="orders-search-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by product or order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-hidden focus:border-[#143C6B]"
              id="orders-search-input"
            />
          </div>
          <button className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-lg px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50" id="orders-filter-btn">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 mt-4" id="orders-list-content">

        {/* Wallet Refund Banner if active */}
        {returnSuccessMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black">Return Processed & Refund Credited</h4>
                <p className="text-[11px] font-semibold text-emerald-800 mt-0.5">{returnSuccessMessage}</p>
              </div>
            </div>
            <button 
              onClick={() => onSelectTab('profile')}
              className="text-xs font-bold text-emerald-900 bg-emerald-200 hover:bg-emerald-300 px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
            >
              View Wallet
            </button>
          </div>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="orders-list-skeleton">
            {Array.from({ length: 4 }).map((_, idx) => (
              <OrderItemSkeleton key={`order-skel-${idx}`} />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" id="orders-list">
            {filteredOrders.map((order, idx) => {
              const primaryItem = (order.items && order.items.length > 0) ? order.items[0] : null;
              const prod = primaryItem?.product;
              const prodTitle = prod?.title || 'Ordered Product';
              const prodImage = prod?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120';
              const isDelivered = order.status === 'Delivered' || order.status === 'Delivered Early';
              const isReturned = order.status === 'Returned';
              const isCancelled = order.status === 'Cancelled';
              const isExpanded = expandedOrderId === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.16, delay: Math.min(idx * 0.02, 0.12), ease: 'easeOut' }}
                  style={{ willChange: 'transform, opacity' }}
                  className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between"
                  id={`order-card-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-3.5">
                    {/* Product Thumbnail */}
                    <div 
                      onClick={() => prod?.id && onSelectProduct(prod.id)}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 cursor-pointer"
                    >
                      <img
                        src={prodImage}
                        alt={prodTitle}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Order State middle section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isReturned
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : isCancelled
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                          {isReturned && <RotateCcw className="w-3 h-3" />}
                          {order.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                      </div>

                      <p className="text-[10px] text-gray-400 font-bold mt-1">
                        Ordered on {order.orderDate}
                      </p>
                      
                      <h3 
                        onClick={() => prod?.id && onSelectProduct(prod.id)}
                        className="text-xs sm:text-sm font-extrabold text-gray-800 tracking-tight mt-1 truncate cursor-pointer hover:text-[#143C6B]"
                      >
                        {prodTitle}
                      </h3>

                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span>Size: <strong className="text-gray-800">{primaryItem?.selectedSize || 'Free'}</strong></span>
                        <span className="text-gray-300">•</span>
                        <span>Qty: <strong className="text-gray-800">{primaryItem?.quantity || 1}</strong></span>
                        <span className="text-gray-300">•</span>
                        <span>Total: <strong className="text-slate-900 font-black">₹{order.totalPrice}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Breakdown */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    <div className="flex items-center gap-2">
                      {/* If Delivered and not yet returned, provide Return button */}
                      {isDelivered && onReturnOrder && (
                        <button
                          onClick={() => setReturnModalOrder(order)}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return & Refund</span>
                        </button>
                      )}

                      {isReturned && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          <span>Refunded to Wallet</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600 animate-fadeIn">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Delivery Address</span>
                        <p className="font-bold text-slate-800">{order.shippingAddress?.name || 'Customer'}</p>
                        <p>{order.shippingAddress?.addressLine}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                        <p className="font-semibold text-slate-700">Phone: {order.shippingAddress?.phone}</p>
                      </div>

                      {isReturned && (
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-purple-900 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-purple-700 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            <span>Return & Refund Record</span>
                          </span>
                          <p className="text-[11px] font-medium">Refund Amount: <strong className="font-black text-purple-950">₹{order.totalPrice}</strong></p>
                          <p className="text-[10px] text-purple-700">Credited to your QueKart Wallet balance for future purchases.</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <p className="text-xs text-gray-400 text-center py-8">No orders matched "{searchQuery}"</p>
        ) : null}

        {/* Traditional Indian Saree Girl illustration empty state - true Lucky aesthetic */}
        <div className="mt-12 flex flex-col items-center text-center px-6 relative" id="all-izzz-well-container">
          <div className="w-48 h-48 relative mb-4" id="traditional-saree-woman-avatar">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-blue-100/50 rounded-full"></div>
            <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 z-10" id="traditional-girl-svg">
              <path d="M 60 120 C 60 70, 140 70, 140 120 C 140 120, 60 120, 60 120 Z" fill="#1e1b18" />
              <rect x="92" y="112" width="16" height="15" fill="#fcdbb0" rx="2" />
              <circle cx="100" cy="90" r="28" fill="#fcdbb0" />
              <circle cx="100" cy="80" r="2.5" fill="#e11d48" />
              <path d="M 88 90 Q 94 93, 100 90" stroke="#374151" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 100 90 Q 106 93, 112 90" stroke="#374151" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 94 98 Q 100 105, 106 98" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 72 90 C 72 70, 100 68, 100 78 C 100 68, 128 70, 128 90 C 132 80, 120 62, 100 62 C 80 62, 68 80, 72 90 Z" fill="#1e1b18" />
              <circle cx="71" cy="95" r="4.5" fill="#facc15" />
              <path d="M 69 98 L 73 98 L 71 103 Z" fill="#facc15" />
              <circle cx="129" cy="95" r="4.5" fill="#facc15" />
              <path d="M 127 98 L 131 98 L 129 103 Z" fill="#facc15" />
              <path d="M 65 125 C 65 120, 135 120, 135 125 L 140 185 L 60 185 Z" fill="#701a75" />
              <path d="M 65 185 L 115 121 C 115 121, 135 121, 135 125 L 105 185 Z" fill="#fbbf24" />
              <path d="M 65 185 L 115 121" stroke="#eab308" strokeWidth="3" />
              <rect x="110" y="152" width="6" height="8" fill="#1e1b18" rx="1" />
              <rect x="108" y="154" width="10" height="4" fill="#3b82f6" rx="0.5" />
              <path d="M 135 155 C 130 155, 110 155, 105 150 C 100 145, 110 135, 115 138 C 120 142, 125 145, 135 145" fill="#fcdbb0" stroke="#f0abfc" strokeWidth="1" />
              <path d="M 103 145 C 99 145, 96 142, 98 138 C 100 134, 105 136, 107 141" fill="#fcdbb0" />
            </svg>
          </div>

          <h2 className="text-base font-extrabold text-slate-600 tracking-tight leading-none" id="izz-header">
            All Izzz Well
          </h2>
          <p className="text-xs text-gray-400 font-bold italic mt-1.5" id="izz-subheader">
            Just keep shopping
          </p>
          <button
            onClick={() => onSelectTab('home')}
            className="mt-5 bg-[#143C6B] hover:bg-[#0D2C4E] text-white font-extrabold text-xs py-2 px-6 rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Explore Trending Products
          </button>
        </div>
      </div>

      {/* Return & Refund Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Request Return & Instant Refund</span>
              </div>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3 text-xs text-purple-900 space-y-1">
              <p className="font-bold">Refund to QueKart Wallet</p>
              <p className="text-[11px] text-purple-800">
                Amount of <strong>₹{returnModalOrder.totalPrice}</strong> will be refunded to your QueKart wallet immediately upon request confirmation. You can use it for any future order.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Return Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-hidden focus:border-[#143C6B]"
              >
                <option value="Quality issue">Quality issue / Defective item</option>
                <option value="Size does not fit">Size does not fit</option>
                <option value="Item damaged during transit">Item damaged during transit</option>
                <option value="Received wrong product">Received wrong product</option>
                <option value="Item not as described">Item not as described</option>
                <option value="Other">Other reason</option>
              </select>

              {returnReason === 'Other' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-hidden focus:border-[#143C6B] h-20 resize-none mt-2"
                />
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingReturn}
                onClick={handleConfirmReturn}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-black text-xs rounded-xl cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmittingReturn ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Return (₹{returnModalOrder.totalPrice})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

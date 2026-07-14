import { useState } from 'react';
import { Search, SlidersHorizontal, ChevronRight, Package, Calendar } from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onSelectProduct: (productId: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function OrdersView({
  orders,
  onSelectProduct,
  onSelectTab
}: OrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by title of the product inside
  const filteredOrders = orders.filter((order) =>
    order.items.some((item) =>
      item.product.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-130px)] pb-16 px-4 py-3" id="orders-view-container">
      {/* Title */}
      <div className="mb-3 border-b border-gray-200/60 pb-2">
        <h1 className="text-sm font-black text-gray-800 tracking-wider">MY ORDERS</h1>
      </div>

      {/* Search orders & filters row */}
      <div className="flex items-center gap-3 mb-4" id="orders-search-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:outline-hidden focus:border-lucky-magenta"
            id="orders-search-input"
          />
        </div>
        <button className="flex items-center gap-1.5 border border-gray-200 bg-white rounded-lg px-3.5 py-2 text-xs font-bold text-lucky-magenta cursor-pointer" id="orders-filter-btn">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="flex flex-col gap-3" id="orders-list">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectProduct(order.items[0].product.id)}
              className="bg-white rounded-lg p-3.5 border border-gray-200/80 shadow-3xs cursor-pointer hover:shadow-xs transition-shadow flex items-start justify-between gap-3"
              id={`order-card-${order.id}`}
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <img
                  src={order.items[0].product.images[0]}
                  alt={order.items[0].product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Order State middle section */}
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-lucky-green flex items-center gap-1">
                  <CheckCircleIcon />
                  <span>{order.status}</span>
                </span>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  Ordered on {order.orderDate}
                </p>
                
                <h3 className="text-xs font-extrabold text-gray-800 tracking-tight mt-1 truncate">
                  {order.items[0].product.title}
                </h3>

                <p className="text-[10px] text-gray-400 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>Size:</span> <span className="font-bold text-gray-700">{order.items[0].selectedSize}</span>
                  <span className="text-gray-300">•</span>
                  <span>Qty:</span> <span className="font-bold text-gray-700">{order.items[0].quantity}</span>
                  <span className="text-gray-300">•</span>
                  <span>Total Paid:</span> <span className="font-black text-slate-900 text-xs premium-rupee bg-slate-100 px-1.5 py-0.5 rounded-sm">₹{order.totalPrice}</span>
                </p>
              </div>

              {/* Right Pointer */}
              <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <p className="text-xs text-gray-400 text-center py-8">No orders matched "{searchQuery}"</p>
      ) : null}

      {/* Traditional Indian Saree Girl illustration empty state - true Lucky aesthetic (Screenshot 5) */}
      <div className="mt-12 flex flex-col items-center text-center px-6 relative" id="all-izzz-well-container">
        {/* Vector SVG representation of the Indian woman in a saree holding her hand on her heart */}
        <div className="w-48 h-48 relative mb-4" id="traditional-saree-woman-avatar">
          {/* Circular backdrop circle */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-50 to-pink-100/50 rounded-full"></div>
          
          {/* Custom SVG Indian Lady with saree */}
          <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 z-10" id="traditional-girl-svg">
            {/* Hair back */}
            <path d="M 60 120 C 60 70, 140 70, 140 120 C 140 120, 60 120, 60 120 Z" fill="#1e1b18" />
            
            {/* Neck */}
            <rect x="92" y="112" width="16" height="15" fill="#fcdbb0" rx="2" />
            
            {/* Head/Face */}
            <circle cx="100" cy="90" r="28" fill="#fcdbb0" />
            
            {/* Bindi (traditionally Indian forehead mark) */}
            <circle cx="100" cy="80" r="2.5" fill="#e11d48" />
            
            {/* Smile & Closed Eyes */}
            <path d="M 88 90 Q 94 93, 100 90" stroke="#374151" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 100 90 Q 106 93, 112 90" stroke="#374151" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 94 98 Q 100 105, 106 98" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Hair Front with Partition */}
            <path d="M 72 90 C 72 70, 100 68, 100 78 C 100 68, 128 70, 128 90 C 132 80, 120 62, 100 62 C 80 62, 68 80, 72 90 Z" fill="#1e1b18" />

            {/* Traditional Indian Earrings (Jhumkas) */}
            <circle cx="71" cy="95" r="4.5" fill="#facc15" />
            <path d="M 69 98 L 73 98 L 71 103 Z" fill="#facc15" />
            <circle cx="129" cy="95" r="4.5" fill="#facc15" />
            <path d="M 127 98 L 131 98 L 129 103 Z" fill="#facc15" />

            {/* Purple / Saree blouse torso */}
            <path d="M 65 125 C 65 120, 135 120, 135 125 L 140 185 L 60 185 Z" fill="#701a75" />

            {/* Yellow Saree drape (pallu) across the chest diagonally */}
            <path d="M 65 185 L 115 121 C 115 121, 135 121, 135 125 L 105 185 Z" fill="#fbbf24" />

            {/* Gold border on Saree */}
            <path d="M 65 185 L 115 121" stroke="#eab308" strokeWidth="3" />

            {/* Smart Watch on Left Hand wrist */}
            <rect x="110" y="152" width="6" height="8" fill="#1e1b18" rx="1" />
            <rect x="108" y="154" width="10" height="4" fill="#3b82f6" rx="0.5" />

            {/* Arm bent up towards heart */}
            <path d="M 135 155 C 130 155, 110 155, 105 150 C 100 145, 110 135, 115 138 C 120 142, 125 145, 135 145" fill="#fcdbb0" stroke="#f0abfc" strokeWidth="1" />
            
            {/* Hand resting on chest (Heart) */}
            <path d="M 103 145 C 99 145, 96 142, 98 138 C 100 134, 105 136, 107 141" fill="#fcdbb0" />
          </svg>
        </div>

        {/* Text Headers matching Screenshot 5 */}
        <h2 className="text-base font-extrabold text-slate-600 tracking-tight leading-none" id="izz-header">
          All Izzz Well
        </h2>
        <p className="text-xs text-gray-400 font-bold italic mt-1.5" id="izz-subheader">
          Just keep shopping
        </p>
        <button
          onClick={() => onSelectTab('home')}
          className="mt-5 bg-lucky-magenta hover:bg-opacity-95 text-white font-extrabold text-xs py-2 px-6 rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          Explore Trending Products
        </button>
      </div>
    </div>
  );
}

// Help sub components
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 inline">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.6Z" clipRule="evenodd" />
    </svg>
  );
}

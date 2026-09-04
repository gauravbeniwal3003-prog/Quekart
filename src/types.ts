export interface Review {
  id: string;
  userId?: string;
  userPhone?: string;
  userEmail?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  postedDate: string;
  updatedAt?: string;
  images: string[]; // Real user photos
  helpfulCount: number;
  helpfulUsers?: string[]; // User IDs / phone numbers who voted helpful (one account one vote)
  isVerifiedPurchase?: boolean; // True if submitted by a customer who purchased this product
  orderId?: string; // Optional linked order ID
}

export interface ProductHighlight {
  label: string;
  value: string;
}

export interface AdditionalDetail {
  label: string;
  value: string;
}

export interface VariantSwatch {
  colorName: string;
  colorHex?: string;
  imageUrl: string;
  imageIndex?: number;
  price: number;
  originalPrice: number;
  stock?: number;
  sizeStock?: Record<string, number>;
  sku?: string; // Unique SKU code for this color variant
}

export interface ProductAnalytics {
  impressions: number;
  views: number;
  cartAdds: number;
  blockedImpressions: number;
  blockedViews: number;
  lastUpdated?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  isAd?: boolean;
  isCodAvailable?: boolean; // Vendor toggle: Cash on Delivery available or online prepaid only
  codPrice: number; // COD Price (including COD convenience charge if any)
  codSurcharge?: number; // Custom COD extra fee if configured by vendor
  returnPolicyType?: 'return' | 'replacement' | 'no_return'; // Vendor policy: Return, Replacement only, or No return
  returnDays?: number; // e.g. 7, 10, 15, 30 days
  returnPolicyText?: string; // Custom policy descriptor
  hasUpiOffer?: boolean; // Vendor toggle: UPI extra offer enabled
  upiPrice?: number; // Optional explicit UPI/Prepaid discounted price set by vendor
  upiDiscountType?: 'percentage' | 'flat'; // UPI discount structure
  upiDiscountValue?: number; // e.g. 5 for 5% or 30 for ₹30 flat off
  upiOfferText?: string; // e.g. "Extra 5% OFF with UPI / Instant ₹30 Discount"
  rating: number;
  ratingCount: number;
  reviewCount: number;
  images: string[]; // Product details images
  variants: VariantSwatch[];
  soldBy: string;
  soldByRating: number;
  productHighlights: ProductHighlight[];
  additionalDetails: AdditionalDetail[];
  sizeOptions: string[];
  stock?: number; // Total available stock pieces
  sizeStock?: Record<string, number>; // Size/parameter-wise stock breakdown e.g. { 'S': 25, 'M': 50, 'L': 30 }
  tag?: string; // e.g. "Top Rated", "Lowest Price"
  timeLeftText?: string; // "01h : 25m : 26s" for flash offers
  reviews: Review[];
  vendorId?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  createdAt?: string;
  numericId?: number; // Sequential simple unique ID starting from 1
  sponsoredUntil?: string; // Timestamp until which product is sponsored
  isBestSeller?: boolean;
  hsnCode?: string; // Mandatory HSN Code e.g. "01011020"
  hsnDescription?: string; // HSN category description retrieved from verification API
  sku?: string; // Stock Keeping Unit (Unique inventory code e.g. "QK-ETH-10294")
  sizeSkus?: Record<string, string>; // Individual SKUs for specific sizes e.g. { "S": "QK-ETH-10294-S", "M": "QK-ETH-10294-M" }
  dimensions?: string; // Standard or 3D dimensions e.g. "8*12", "10*12", "12*18", "10*12*12", "12*12*12", "4*12*2" (L*B*H)
  dimensionUnit?: string; // "cm" | "inches" | "mm"
  weight?: string; // Product weight / volume e.g. "100ml", "200ml", "500ml", "1kg", "250g", "500g"
  weightUnit?: string; // "ml" | "L" | "g" | "kg"
  analytics?: ProductAnalytics; // Real-time product impression, view, and cart add analytics
}

export interface Vendor {
  id: string;
  name: string; // Store / Trade / Business name
  ownerName?: string; // Proprietor / Legal Name
  email: string;
  phone: string;
  age?: number;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  gstinVerified?: boolean;
  legalBusinessName?: string;
  tradeName?: string;
  businessType?: string;
  vendorType: 'small' | 'big';
  isVerified?: boolean;
  businessCategory: string;
  gstin?: string;
  rating: number;
  status: 'active' | 'suspended' | 'banned';
  isBanned?: boolean;
  createdAt: string;
  numericId?: number; // Sequential simple unique numeric ID starting from 1 to infinity

  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  address?: string;
  avatar?: string;
  description?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName?: string;
    bankName?: string;
  };
  upiId?: string;
}

export interface SavedAddress {
  id: string;
  label: 'Home' | 'Office' | 'Other' | string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  alternativePhone?: string;
  isDefault?: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string; // LOCKED to authenticated mobile number
  gender?: 'Male' | 'Female' | 'Other' | string;
  age?: number;
  alternativePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isProfileComplete?: boolean;
  savedAddresses?: SavedAddress[];
  createdAt: string;
  status?: 'active' | 'banned';
  isBanned?: boolean;
}


export interface CartItem {
  id: string; // unique cart item id (productId + variantIndex + size)
  product: Product;
  selectedVariantIndex: number;
  selectedSize: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  userPhone?: string;
  userEmail?: string;
  items: CartItem[];
  orderDate: string;
  deliveryDate: string;
  status: 'Delivered Early' | 'Delivered' | 'Out for Delivery' | 'Shipped' | 'Ordered' | 'Cancelled' | 'Returned';
  totalPrice: number;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    pincode: string;
    state: string;
  };
}

export interface VendorPayoutRequest {
  id: string;
  vendorId: string;
  method: 'bank' | 'upi';
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  bankName?: string;
  upiId?: string;
  amount: number;
  status: 'Processing' | 'Completed' | 'Rejected';
  referenceId: string;
  requestedAt: string;
  processedAt?: string;
  utrNumber?: string;
  notes?: string;
}

export interface VendorLedgerTransaction {
  id: string;
  vendorId: string;
  transactionType: 'order_credit' | 'payout_withdrawal' | 'return_deduction' | 'opening_balance' | 'bonus_credit';
  typeLabel: string;
  referenceId: string;
  orderId?: string;
  productTitle?: string;
  quantity?: number;
  description: string;
  credit: number;
  debit: number;
  runningBalance: number;
  status: 'Settled' | 'Processing' | 'Completed';
  timestamp: string;
  date: string;
}

export interface VendorFinancialSummary {
  availableBalance: number;
  totalEarnings: number;
  deliveredSales: number;
  pendingBalance: number;
  totalWithdrawn: number;
  totalRefunded: number;
  transactionsCount: number;
}

export interface UserWalletTransaction {
  id: string;
  type: 'refund_credit' | 'order_payment' | 'referral_bonus' | 'cashback';
  title: string;
  orderId?: string;
  amount: number;
  isCredit: boolean;
  runningBalance: number;
  date: string;
  status: string;
}

export interface UserWallet {
  userId?: string;
  phone: string;
  balance: number;
  totalRefunds: number;
  totalCashback: number;
  transactions: UserWalletTransaction[];
}

export type PolicyMode = 'compulsory' | 'optional' | 'disabled';

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  group?: string;
  image?: string;
  returnPolicyMode?: PolicyMode; // 'compulsory' | 'optional' | 'disabled'
  returnDays?: number; // min 7
  replacementPolicyMode?: PolicyMode; // 'compulsory' | 'optional' | 'disabled'
  replacementDays?: number; // min 7
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  image?: string;
  subCategories?: SubCategory[];
}

export interface CategoryFilter {
  id: string;
  name: string;
  image?: string;
  categoryIds: string[]; // List of Category IDs belonging to this filter
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'promotional' | 'news';
  title?: string;
  subtitle?: string;
  code?: string;
  targetCategory?: string;
  row?: 'main' | 'double' | 'upper' | 'lower';
  order?: number;
}

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percentage';
  value: number;
  minPurchase: number;
  description: string;
}

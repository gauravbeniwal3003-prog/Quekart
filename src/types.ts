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
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
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
  tag?: string; // e.g. "Top Rated", "Lowest Price"
  timeLeftText?: string; // "01h : 25m : 26s" for flash offers
  reviews: Review[];
  vendorId?: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  rejectionReason?: string;
  createdAt?: string;
  numericId?: number; // Sequential simple unique ID starting from 1
  sponsoredUntil?: string; // Timestamp until which product is sponsored
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
  status: 'active' | 'suspended';
  createdAt: string;
  state?: string;
  city?: string;
  district?: string;
  pincode?: string;
  address?: string;
  avatar?: string;
  description?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
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
  status: 'Delivered Early' | 'Out for Delivery' | 'Shipped' | 'Ordered' | 'Cancelled';
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

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  subCategories: {
    name: string;
    image: string;
  }[];
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'promotional' | 'news';
}

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percentage';
  value: number;
  minPurchase: number;
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  postedDate: string;
  images: string[]; // Real user photos
  helpfulCount: number;
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
  imageUrl: string;
  price: number;
  originalPrice: number;
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
  codPrice: number;
  hasUpiOffer?: boolean;
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
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  vendorType: 'small' | 'big';
  businessCategory: string;
  gstin?: string;
  rating: number;
  status: 'active' | 'suspended';
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

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percentage';
  value: number;
  minPurchase: number;
  description: string;
}

import { Product, Category, Banner, CategoryFilter } from './types';

// Core category definitions matching logo color theme (#143C6B Navy Blue & #FF8C00 Saffron Gold)
export const mockCategories: Category[] = [
  {
    id: 'cat-all',
    name: 'All Categories',
    icon: 'shopping-bag',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-popular',
    name: 'Popular',
    icon: 'star',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-ethnic-wear',
    name: 'Women Ethnic Wear',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-women-western',
    name: 'Women Western Wear',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-men-ethnic',
    name: 'Men Ethnic Wear',
    icon: 'crown',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-men-western',
    name: 'Men Western & Casuals',
    icon: 'user',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-kids',
    name: 'Kids & Baby Wear',
    icon: 'baby',
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-footwear',
    name: 'Footwear & Shoes',
    icon: 'shopping-bag',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-jewellery',
    name: 'Jewellery & Ornaments',
    icon: 'gem',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-bags',
    name: 'Bags & Luggage',
    icon: 'briefcase',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-home',
    name: 'Home & Kitchen Decor',
    icon: 'home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Mobiles',
    icon: 'smartphone',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-watches',
    name: 'Watches & Smartbands',
    icon: 'watch',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-sports',
    name: 'Sports & Active Gym',
    icon: 'dumbbell',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-toys',
    name: 'Toys, Games & Baby Care',
    icon: 'gamepad2',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-books',
    name: 'Books & Office Supplies',
    icon: 'book-open',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-grocery',
    name: 'Grocery & Gourmet Food',
    icon: 'utensils',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-automotive',
    name: 'Automotive Accessories',
    icon: 'car',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=300'
  }
];

// 3 Promotional Banners
export const initialBanners: Banner[] = [
  {
    id: 'banner-rakhi-1',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&crop=entropy&w=1280&h=400&q=80',
    type: 'promotional',
    title: 'FESTIVE MAHOTSAV',
    subtitle: 'Up to 80% OFF on Designer Sarees, Kurtis & Festive Gift Sets',
    code: 'FESTIVE80',
    targetCategory: 'Women Ethnic Wear',
    row: 'main',
    order: 1
  },
  {
    id: 'banner-rakhi-2',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&crop=entropy&w=880&h=400&q=80',
    type: 'promotional',
    title: 'SPECIAL GIFT HAMPER',
    subtitle: 'Flat ₹100 Instant Discount on Royal Kundan & Gold Jewellery',
    code: 'FESTIVE100',
    targetCategory: 'Jewellery & Ornaments',
    row: 'double',
    order: 1
  },
  {
    id: 'banner-rakhi-3',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&crop=entropy&w=880&h=400&q=80',
    type: 'promotional',
    title: 'ROYAL ETHNIC COLLECTION',
    subtitle: 'Buy 2 Get 1 FREE on All Festive Apparel & Sherwanis',
    code: 'BUY2GET1',
    targetCategory: 'Men Ethnic Wear',
    row: 'double',
    order: 2
  }
];

export const mockCategoryFilters: CategoryFilter[] = [
  {
    id: 'filter-fashion',
    name: 'Fashion & Clothing',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=150',
    categoryIds: ['cat-ethnic-wear', 'cat-women-western', 'cat-men', 'cat-footwear']
  }
];

export const initialOrders: any[] = [];

// 51 Professional Products with 100% Unique Images (No Duplicates Across Any Product)
export const mockProducts: Product[] = [
  // 1. Women Ethnic Wear (3 products, 6 unique images)
  {
    id: 'prod-we-1',
    numericId: 1,
    title: 'Royal Embroidered Rayon Anarkali Kurti Set with Dupatta',
    description: 'Exquisite festive wear Anarkali kurti crafted from premium rayon fabric with intricate zari embroidery and matching dupatta.',
    category: 'Women Ethnic Wear',
    price: 499,
    originalPrice: 1299,
    discountPercent: 61,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1420,
    reviewCount: 380,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Surat Silk Mills & Weavers',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Fabric', value: '100% Pure Rayon' },
      { label: 'Work', value: 'Zari Embroidery' },
      { label: 'Occasion', value: 'Festive & Wedding' }
    ],
    additionalDetails: [
      { label: 'Pack Contains', value: '1 Kurti, 1 Bottom, 1 Dupatta' },
      { label: 'Wash Care', value: 'Gentle Machine Wash' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 120,
    sizeStock: { 'S': 20, 'M': 30, 'L': 30, 'XL': 20, 'XXL': 20 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-we-2',
    numericId: 2,
    title: 'Banarasi Silk Zari Woven Festive Saree with Unstitched Blouse',
    description: 'Traditional Banarasi handloom woven silk saree featuring rich zari pallu and intricate ethnic motifs for weddings.',
    category: 'Women Ethnic Wear',
    price: 899,
    originalPrice: 2499,
    discountPercent: 64,
    codPrice: 899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 2150,
    reviewCount: 512,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Varanasi Weavers Hub',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Fabric', value: 'Art Banarasi Silk' },
      { label: 'Length', value: '6.3 Meters with Blouse Piece' },
      { label: 'Weave Type', value: 'Jacquard Zari' }
    ],
    additionalDetails: [
      { label: 'Included', value: 'Saree + Unstitched Blouse Piece' },
      { label: 'Care', value: 'Dry Clean Only' }
    ],
    sizeOptions: ['Free Size'],
    stock: 90,
    sizeStock: { 'Free Size': 90 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-we-3',
    numericId: 3,
    title: 'Designer Party Wear Georgette Palazzo Suit Set',
    description: 'Modern Georgette kurti paired with flared palazzo pants and embroidered dupatta. Lightweight and comfortable.',
    category: 'Women Ethnic Wear',
    price: 649,
    originalPrice: 1799,
    discountPercent: 64,
    codPrice: 649,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 980,
    reviewCount: 245,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Jaipur Textile Direct',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Fabric', value: 'Faux Georgette' },
      { label: 'Inner', value: 'Micro Cotton Lining' },
      { label: 'Sleeve', value: 'Three-Quarter Sleeves' }
    ],
    additionalDetails: [
      { label: 'Set', value: 'Kurti + Palazzo + Dupatta' },
      { label: 'Wash', value: 'Hand Wash' }
    ],
    sizeOptions: ['M', 'L', 'XL', 'XXL'],
    stock: 100,
    sizeStock: { 'M': 25, 'L': 35, 'XL': 25, 'XXL': 15 },
    approvalStatus: 'approved'
  },

  // 2. Women Western Wear (3 products, 6 unique images)
  {
    id: 'prod-ww-1',
    numericId: 4,
    title: 'Casual Cotton Checkered Oversized Shirt for Women',
    description: 'Trendy casual oversized shirt in breathable cotton fabric. Perfect for college, office, or daily casual layering.',
    category: 'Women Western Wear',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.6,
    ratingCount: 750,
    reviewCount: 190,
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Mumbai Urban Fashion',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Material', value: '100% Cotton' },
      { label: 'Fit', value: 'Oversized Relaxed' },
      { label: 'Pattern', value: 'Classic Checkered' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Button-Down' },
      { label: 'Sleeve', value: 'Full Sleeve' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL'],
    stock: 110,
    sizeStock: { 'S': 30, 'M': 40, 'L': 25, 'XL': 15 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-ww-2',
    numericId: 5,
    title: 'High-Waist Slim Fit Stretchable Denim Jeans',
    description: 'Comfortable high-rise stretch denim jeans designed with flattering fit and durable fade-resistant cotton denim.',
    category: 'Women Western Wear',
    price: 699,
    originalPrice: 1599,
    discountPercent: 56,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1620,
    reviewCount: 430,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Denim House India',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Rise', value: 'High Rise' },
      { label: 'Fabric', value: 'Cotton Lycra Stretch' },
      { label: 'Pocket', value: '5 Pocket Styling' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Button and Zip' },
      { label: 'Stretch', value: '4-Way Stretch' }
    ],
    sizeOptions: ['28', '30', '32', '34'],
    stock: 130,
    sizeStock: { '28': 30, '30': 40, '32': 40, '34': 20 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-ww-3',
    numericId: 6,
    title: 'Elegant Pleated Midi Dress with Belt',
    description: 'Chic pleated midi dress featuring flattering waist belt and premium fluid fabric for evening parties and outings.',
    category: 'Women Western Wear',
    price: 799,
    originalPrice: 1999,
    discountPercent: 60,
    codPrice: 799,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 890,
    reviewCount: 210,
    images: [
      'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Blossom Apparel Co.',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Fabric', value: 'Poly Crepe' },
      { label: 'Length', value: 'Midi Length' },
      { label: 'Accessory', value: 'Matching Waist Belt Included' }
    ],
    additionalDetails: [
      { label: 'Neckline', value: 'V-Neck' },
      { label: 'Occasion', value: 'Party & Casual' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL'],
    stock: 85,
    sizeStock: { 'S': 20, 'M': 30, 'L': 25, 'XL': 10 },
    approvalStatus: 'approved'
  },

  // 3. Men Ethnic Wear (3 products, 6 unique images)
  {
    id: 'prod-me-1',
    numericId: 7,
    title: 'Festive Silk Blend Jacquard Kurta Pajama Set for Men',
    description: 'Traditional yet modern jacquard woven silk blend kurta paired with comfortable cotton churidar pajama.',
    category: 'Men Ethnic Wear',
    price: 749,
    originalPrice: 1899,
    discountPercent: 60,
    codPrice: 749,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1120,
    reviewCount: 295,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Royal Ethnic Studio',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Fabric', value: 'Silk Blend Jacquard' },
      { label: 'Set Includes', value: 'Kurta & Pajama' },
      { label: 'Collar', value: 'Mandarin Collar' }
    ],
    additionalDetails: [
      { label: 'Fit Type', value: 'Regular Fit' },
      { label: 'Care', value: 'Dry Clean Recommended' }
    ],
    sizeOptions: ['38', '40', '42', '44'],
    stock: 100,
    sizeStock: { '38': 25, '40': 35, '42': 25, '44': 15 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-me-2',
    numericId: 8,
    title: 'Royal Wedding Sherwani with Intricate Hand Embroidery',
    description: 'Magnificent groom sherwani featuring regal metallic button detailing and delicate thread work embroidery.',
    category: 'Men Ethnic Wear',
    price: 2499,
    originalPrice: 5999,
    discountPercent: 58,
    codPrice: 2499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 640,
    reviewCount: 180,
    images: [
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Delhi Heritage Weaves',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Fabric', value: 'Brocade Silk' },
      { label: 'Embroidery', value: 'Zardozi & Resham' },
      { label: 'Occasion', value: 'Reception & Wedding' }
    ],
    additionalDetails: [
      { label: 'Included', value: 'Sherwani Only' },
      { label: 'Dry Clean', value: 'Specialized Dry Clean Only' }
    ],
    sizeOptions: ['38', '40', '42', '44'],
    stock: 40,
    sizeStock: { '38': 10, '40': 15, '42': 10, '44': 5 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-me-3',
    numericId: 9,
    title: 'Casual Cotton Pathani Kurta and Salwar Set',
    description: 'Rugged yet refined 100% pure cotton Pathani suit designed for comfortable daily wear and festive gatherings.',
    category: 'Men Ethnic Wear',
    price: 699,
    originalPrice: 1599,
    discountPercent: 56,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 820,
    reviewCount: 210,
    images: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Punjab Traditional Hub',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Fabric', value: '100% Heavy Cotton' },
      { label: 'Pocket', value: 'Dual Chest Pockets' },
      { label: 'Bottom', value: 'Matching Salwar' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Front Placket Buttons' },
      { label: 'Wash', value: 'Machine Washable' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 95,
    sizeStock: { 'S': 20, 'M': 25, 'L': 25, 'XL': 15, 'XXL': 10 },
    approvalStatus: 'approved'
  },

  // 4. Men Western & Casuals (3 products, 6 unique images)
  {
    id: 'prod-mw-1',
    numericId: 10,
    title: 'Premium Slim Fit Cotton Casual Shirt for Men',
    description: 'Crisp and durable solid cotton casual shirt tailored in modern slim fit. Ideal for office and weekend outings.',
    category: 'Men Western & Casuals',
    price: 449,
    originalPrice: 1199,
    discountPercent: 62,
    codPrice: 449,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1890,
    reviewCount: 450,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Tirupur Garments Direct',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Fabric', value: 'Combed Cotton' },
      { label: 'Fit', value: 'Slim Fit' },
      { label: 'Collar', value: 'Button-Down Collar' }
    ],
    additionalDetails: [
      { label: 'Sleeve', value: 'Full Sleeves' },
      { label: 'Pattern', value: 'Solid Color' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 160,
    sizeStock: { 'S': 30, 'M': 50, 'L': 40, 'XL': 30, 'XXL': 10 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-mw-2',
    numericId: 11,
    title: 'Classic Solid Polo Neck Cotton T-Shirt',
    description: 'Breathable pique cotton polo T-shirt featuring ribbed collar and cuffs for an athletic smart-casual look.',
    category: 'Men Western & Casuals',
    price: 349,
    originalPrice: 899,
    discountPercent: 61,
    codPrice: 349,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2400,
    reviewCount: 610,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Apex Apparel Manufacturers',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Fabric', value: '100% Cotton Pique' },
      { label: 'Fit', value: 'Regular Fit' },
      { label: 'Placket', value: '2-Button Placket' }
    ],
    additionalDetails: [
      { label: 'Sleeve', value: 'Short Sleeves' },
      { label: 'Wash Care', value: 'Machine Wash' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 180,
    sizeStock: { 'S': 30, 'M': 50, 'L': 50, 'XL': 30, 'XXL': 20 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-mw-3',
    numericId: 12,
    title: 'Stretchable Multi-Pocket Cargo Jogger Pants',
    description: 'Modern utility cargo joggers crafted with stretch cotton twill fabric, elastic waistband, and deep secure pockets.',
    category: 'Men Western & Casuals',
    price: 599,
    originalPrice: 1499,
    discountPercent: 60,
    codPrice: 599,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1320,
    reviewCount: 340,
    images: [
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Urban Streetwear Hub',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Fabric', value: 'Cotton Twill with Elastane' },
      { label: 'Pockets', value: '6 Functional Pockets' },
      { label: 'Waist', value: 'Elasticated with Drawstring' }
    ],
    additionalDetails: [
      { label: 'Fit', value: 'Tapered Jogger Fit' },
      { label: 'Care', value: 'Gentle Wash' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL'],
    stock: 115,
    sizeStock: { 'S': 25, 'M': 40, 'L': 35, 'XL': 15 },
    approvalStatus: 'approved'
  },

  // 5. Kids & Baby Wear (3 products, 6 unique images)
  {
    id: 'prod-kb-1',
    numericId: 13,
    title: 'Cute Cotton Printed Frock for Baby Girls',
    description: 'Adorable and soft breathable cotton frock featuring cheerful floral prints and comfortable flare for little girls.',
    category: 'Kids & Baby Wear',
    price: 299,
    originalPrice: 799,
    discountPercent: 62,
    codPrice: 299,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 920,
    reviewCount: 240,
    images: [
      'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Tiny Tots Garments',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Fabric', value: '100% Skin-Friendly Cotton' },
      { label: 'Closure', value: 'Back Button' },
      { label: 'Pattern', value: 'Floral Printed' }
    ],
    additionalDetails: [
      { label: 'Age Group', value: '1 to 5 Years' },
      { label: 'Wash', value: 'Machine Washable' }
    ],
    sizeOptions: ['1-2Y', '2-3Y', '3-4Y', '4-5Y'],
    stock: 90,
    sizeStock: { '1-2Y': 20, '2-3Y': 30, '3-4Y': 25, '4-5Y': 15 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-kb-2',
    numericId: 14,
    title: 'Festive Ethnic Kurta Dhoti Set for Boys',
    description: 'Traditional yet comfortable cotton silk kurta paired with dhoti pants for baby boys during festive celebrations.',
    category: 'Kids & Baby Wear',
    price: 499,
    originalPrice: 1299,
    discountPercent: 61,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 780,
    reviewCount: 195,
    images: [
      'https://images.unsplash.com/photo-1503944583220-7eeecac9c68c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Kids Ethnic Studio',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Fabric', value: 'Cotton Silk Blend' },
      { label: 'Set', value: 'Kurta with Attached Dhoti' },
      { label: 'Skin Safe', value: 'Hypoallergenic Dyes' }
    ],
    additionalDetails: [
      { label: 'Age Group', value: '2 to 6 Years' },
      { label: 'Care', value: 'Gentle Hand Wash' }
    ],
    sizeOptions: ['2-3Y', '3-4Y', '4-5Y', '5-6Y'],
    stock: 75,
    sizeStock: { '2-3Y': 20, '3-4Y': 25, '4-5Y': 20, '5-6Y': 10 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-kb-3',
    numericId: 15,
    title: 'Soft Organic Cotton Newborn Bodysuit Romper Set',
    description: 'Ultra-soft organic cotton bodysuits with snap buttons for effortless diaper changes and tender newborn care.',
    category: 'Kids & Baby Wear',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1100,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Newborn Care Essentials',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Material', value: '100% Certified Organic Cotton' },
      { label: 'Pack', value: 'Pack of 3 Rompers' },
      { label: 'Safety', value: 'Nontoxic Snaps' }
    ],
    additionalDetails: [
      { label: 'Age Group', value: '0 to 12 Months' },
      { label: 'Wash', value: 'Machine Wash' }
    ],
    sizeOptions: ['0-3M', '3-6M', '6-9M', '9-12M'],
    stock: 100,
    sizeStock: { '0-3M': 30, '3-6M': 30, '6-9M': 20, '9-12M': 20 },
    approvalStatus: 'approved'
  },

  // 6. Footwear & Shoes (3 products, 6 unique images)
  {
    id: 'prod-fw-1',
    numericId: 16,
    title: 'Men Lightweight Running & Walking Sports Shoes',
    description: 'Engineered mesh running shoes featuring shock-absorbing cushion sole and breathable upper for daily workouts.',
    category: 'Footwear & Shoes',
    price: 699,
    originalPrice: 1999,
    discountPercent: 65,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 3200,
    reviewCount: 890,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Agra Footwear Hub',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Sole', value: 'Phylon Lightweight Cushion' },
      { label: 'Upper', value: 'Breathable Knitted Mesh' },
      { label: 'Usage', value: 'Running & Gym' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Lace-Up' },
      { label: 'Warranty', value: '3 Months Manufacturer' }
    ],
    sizeOptions: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    stock: 140,
    sizeStock: { 'UK 7': 30, 'UK 8': 50, 'UK 9': 40, 'UK 10': 20 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-fw-2',
    numericId: 17,
    title: 'Women Ethnic Embellished Juttis & Mojris',
    description: 'Handcrafted traditional ethnic juttis featuring intricate embroidery and soft cushioned footbed for festive wear.',
    category: 'Footwear & Shoes',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.6,
    ratingCount: 840,
    reviewCount: 220,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Jaipur Artisans Craft',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Material', value: 'Synthetic Silk & Velvet' },
      { label: 'Sole', value: 'Anti-Slip Sheet Sole' },
      { label: 'Cushion', value: 'Extra Soft Memory Foam' }
    ],
    additionalDetails: [
      { label: 'Occasion', value: 'Ethnic & Festive' },
      { label: 'Care', value: 'Wipe Clean with Dry Cloth' }
    ],
    sizeOptions: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40'],
    stock: 95,
    sizeStock: { 'EU 36': 20, 'EU 37': 25, 'EU 38': 25, 'EU 39': 15, 'EU 40': 10 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-fw-3',
    numericId: 18,
    title: 'Classic White Casual Leather Sneakers',
    description: 'Versatile low-top white casual sneakers crafted with premium synthetic leather and durable rubber outsole.',
    category: 'Footwear & Shoes',
    price: 799,
    originalPrice: 1999,
    discountPercent: 60,
    codPrice: 799,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2100,
    reviewCount: 530,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Metro Footwear Direct',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Upper', value: 'Premium PU Leather' },
      { label: 'Sole', value: 'Vulcanized Rubber' },
      { label: 'Style', value: 'Unisex Casual Low-Top' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Lace-Up' },
      { label: 'Water Resistant', value: 'Yes' }
    ],
    sizeOptions: ['UK 7', 'UK 8', 'UK 9', 'UK 10'],
    stock: 120,
    sizeStock: { 'UK 7': 25, 'UK 8': 40, 'UK 9': 35, 'UK 10': 20 },
    approvalStatus: 'approved'
  },

  // 7. Jewellery & Ornaments (3 products, 6 unique images)
  {
    id: 'prod-jw-1',
    numericId: 19,
    title: 'Gold-Plated Kundan Choker Necklace Set with Earrings',
    description: 'Regal bridal Kundan choker necklace set adorned with sparkling faux pearls and matching jhumka earrings.',
    category: 'Jewellery & Ornaments',
    price: 699,
    originalPrice: 2499,
    discountPercent: 72,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1650,
    reviewCount: 420,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Jaipur Royal Jewelers',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Plating', value: '22K Glossy Gold Plated' },
      { label: 'Stones', value: 'Simulated Kundan & Pearls' },
      { label: 'Set Includes', value: '1 Necklace & 1 Pair Earrings' }
    ],
    additionalDetails: [
      { label: 'Skin Friendly', value: 'Hypoallergenic & Nickel Free' },
      { label: 'Occasion', value: 'Wedding & Festivals' }
    ],
    sizeOptions: ['Standard'],
    stock: 80,
    sizeStock: { 'Standard': 80 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-jw-2',
    numericId: 20,
    title: 'Traditional Antique Temple Design Mangalsutra',
    description: 'Classic black bead chain with intricate antique gold goddess Lakshmi pendant for traditional married women.',
    category: 'Jewellery & Ornaments',
    price: 349,
    originalPrice: 999,
    discountPercent: 65,
    codPrice: 349,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 940,
    reviewCount: 260,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'South India Gold Covering',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Chain Length', value: '24 Inches' },
      { label: 'Design', value: 'Temple Antique Finish' },
      { label: 'Durability', value: 'Long Lasting Anti-Tarnish' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'S-Hook' },
      { label: 'Care', value: 'Keep Away from Perfume & Water' }
    ],
    sizeOptions: ['Standard'],
    stock: 110,
    sizeStock: { 'Standard': 110 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-jw-3',
    numericId: 21,
    title: '925 Sterling Silver Sparkling Zircon Solitaire Ring',
    description: 'Elegant sterling silver ring featuring brilliant cut AAA+ zircon crystal with high polish platinum finish.',
    category: 'Jewellery & Ornaments',
    price: 499,
    originalPrice: 1599,
    discountPercent: 68,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 1280,
    reviewCount: 345,
    images: [
      'https://images.unsplash.com/photo-1535276505703-e8c1fc56ffea?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Silver Shine Creations',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Metal', value: '925 Sterling Silver' },
      { label: 'Stone', value: 'AAA+ Austrian Zircon' },
      { label: 'Finish', value: 'Rhodium Anti-Tarnish' }
    ],
    additionalDetails: [
      { label: 'Certification', value: 'Authenticity Certificate Included' },
      { label: 'Gift Box', value: 'Includes Velvet Gift Box' }
    ],
    sizeOptions: ['US 6', 'US 7', 'US 8', 'US 9'],
    stock: 75,
    sizeStock: { 'US 6': 15, 'US 7': 25, 'US 8': 25, 'US 9': 10 },
    approvalStatus: 'approved'
  },

  // 8. Beauty & Personal Care (3 products, 6 unique images)
  {
    id: 'prod-bp-1',
    numericId: 22,
    title: 'Professional Ayurvedic Onion Hair Growth & Scalp Oil (200ml)',
    description: 'Nutrient-rich hair oil infused with red onion extract, black seed oil, and botanical herbs to reduce hair fall and promote growth.',
    category: 'Beauty & Personal Care',
    price: 299,
    originalPrice: 599,
    discountPercent: 50,
    codPrice: 299,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 4500,
    reviewCount: 1200,
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608248597359-974b1248041a?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Herbal Essence Labs',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Volume', value: '200 ml' },
      { label: 'Key Ingredients', value: 'Red Onion Oil, Redensyl, Amla' },
      { label: 'Free From', value: 'Paraben & Mineral Oil Free' }
    ],
    additionalDetails: [
      { label: 'Hair Type', value: 'All Hair Types' },
      { label: 'Shelf Life', value: '36 Months' }
    ],
    sizeOptions: ['200ml'],
    stock: 200,
    sizeStock: { '200ml': 200 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bp-2',
    numericId: 23,
    title: 'Matte Finish Long-Lasting Liquid Lipstick Combo (Pack of 4)',
    description: 'Waterproof, transfer-proof pigmented liquid lipsticks enriched with Vitamin E for comfortable all-day wear.',
    category: 'Beauty & Personal Care',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1890,
    reviewCount: 510,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Glamour Cosmetics India',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Finish', value: 'Ultra Matte' },
      { label: 'Longevity', value: '16 Hours' },
      { label: 'Pack', value: 'Set of 4 Trending Shades' }
    ],
    additionalDetails: [
      { label: 'Formulation', value: 'Liquid' },
      { label: 'Cruelty Free', value: '100% Vegan & Cruelty Free' }
    ],
    sizeOptions: ['Standard Combo'],
    stock: 150,
    sizeStock: { 'Standard Combo': 150 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bp-3',
    numericId: 24,
    title: 'Ayurvedic Brightening Vitamin C Face Serum (30ml)',
    description: 'Potent antioxidant face serum with 20% Vitamin C and Hyaluronic acid for glowing skin and dark spot reduction.',
    category: 'Beauty & Personal Care',
    price: 349,
    originalPrice: 799,
    discountPercent: 56,
    codPrice: 349,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2300,
    reviewCount: 620,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Botanical Skincare Co.',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Volume', value: '30 ml' },
      { label: 'Active', value: '20% Vitamin C + Hyaluronic Acid' },
      { label: 'Skin Type', value: 'All Skin Types' }
    ],
    additionalDetails: [
      { label: 'Usage', value: 'Day & Night' },
      { label: 'Dermatologically Tested', value: 'Yes' }
    ],
    sizeOptions: ['30ml'],
    stock: 175,
    sizeStock: { '30ml': 175 },
    approvalStatus: 'approved'
  },

  // 9. Bags & Luggage (3 products, 6 unique images)
  {
    id: 'prod-bl-1',
    numericId: 25,
    title: 'Premium PU Leather Casual Handbag & Sling Bag Combo',
    description: 'Stylish structured handbag crafted from durable PU leather with spacious compartments and detachable sling strap.',
    category: 'Bags & Luggage',
    price: 699,
    originalPrice: 1899,
    discountPercent: 63,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1420,
    reviewCount: 380,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Delhi Leather Works',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Material', value: 'Premium Vegan PU Leather' },
      { label: 'Compartments', value: '3 Zipped Compartments' },
      { label: 'Set', value: 'Handbag + Matching Sling Pouch' }
    ],
    additionalDetails: [
      { label: 'Closure', value: 'Zip Closure' },
      { label: 'Water Resistant', value: 'Yes' }
    ],
    sizeOptions: ['Standard'],
    stock: 90,
    sizeStock: { 'Standard': 90 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bl-2',
    numericId: 26,
    title: 'Durable Water-Resistant Laptop Backpack (15.6 Inch)',
    description: 'Ergonomic business laptop backpack with USB charging port, padded shoulder straps, and multi-utility organizer pockets.',
    category: 'Bags & Luggage',
    price: 799,
    originalPrice: 1999,
    discountPercent: 60,
    codPrice: 799,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 3100,
    reviewCount: 840,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Apex Travel Gear',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Laptop Capacity', value: 'Up to 15.6 Inches' },
      { label: 'Fabric', value: 'Water-Repellent Polyester' },
      { label: 'Special Feature', value: 'Integrated USB Charging Port' }
    ],
    additionalDetails: [
      { label: 'Capacity', value: '30 Liters' },
      { label: 'Warranty', value: '1 Year Manufacturer' }
    ],
    sizeOptions: ['Standard 30L'],
    stock: 120,
    sizeStock: { 'Standard 30L': 120 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bl-3',
    numericId: 27,
    title: 'Travel Friendly Lightweight Cabin Hard Trolley Suitcase (20 Inch)',
    description: 'Scratch-resistant polycarbonate hard-sided cabin luggage featuring 360-degree silent spinner wheels and TSA lock.',
    category: 'Bags & Luggage',
    price: 1899,
    originalPrice: 4999,
    discountPercent: 62,
    codPrice: 1899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 980,
    reviewCount: 290,
    images: [
      'https://images.unsplash.com/photo-1581557991964-125469da3b8a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Voyager Luggage Co.',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Shell Material', value: 'Polycarbonate Hard Shell' },
      { label: 'Wheels', value: '4 Silent 360° Spinner Wheels' },
      { label: 'Lock', value: 'Built-in Number Combination Lock' }
    ],
    additionalDetails: [
      { label: 'Size', value: 'Cabin Size (20 Inch)' },
      { label: 'Warranty', value: '3 Years International' }
    ],
    sizeOptions: ['20 Inch Cabin'],
    stock: 50,
    sizeStock: { '20 Inch Cabin': 50 },
    approvalStatus: 'approved'
  },

  // 10. Home & Kitchen Decor (3 products, 6 unique images)
  {
    id: 'prod-hk-1',
    numericId: 28,
    title: '100% Cotton King Size Luxury Bedsheet with 2 Pillow Covers',
    description: 'Breathable high-thread-count pure cotton bedsheet with vibrant ethnic floral print that adds elegance to your bedroom.',
    category: 'Home & Kitchen Decor',
    price: 599,
    originalPrice: 1599,
    discountPercent: 62,
    codPrice: 599,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2800,
    reviewCount: 750,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Panipat Handloom Direct',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Material', value: '100% Glace Cotton' },
      { label: 'Dimensions', value: '108 x 108 Inches (King)' },
      { label: 'Includes', value: '1 Bedsheet & 2 Pillow Covers' }
    ],
    additionalDetails: [
      { label: 'Fade Resistant', value: 'Yes' },
      { label: 'Wash Care', value: 'Machine Washable' }
    ],
    sizeOptions: ['King Size'],
    stock: 130,
    sizeStock: { 'King Size': 130 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-hk-2',
    numericId: 29,
    title: 'Non-Stick Aluminium Fry Pan & Kadhai Cooking Set',
    description: 'Heavy gauge 3-layer non-stick cookware set with cool-touch handles for healthy, oil-free daily cooking.',
    category: 'Home & Kitchen Decor',
    price: 899,
    originalPrice: 2299,
    discountPercent: 60,
    codPrice: 899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1920,
    reviewCount: 510,
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590794056226-79ef3a81154e?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'KitchenKing Appliances',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Coating', value: 'German 3-Layer Non-Stick' },
      { label: 'Compatibility', value: 'Gas & Induction Compatible' },
      { label: 'Set', value: 'Fry Pan + Kadhai with Glass Lid' }
    ],
    additionalDetails: [
      { label: 'PFOA Free', value: '100% Safe & Nontoxic' },
      { label: 'Warranty', value: '1 Year' }
    ],
    sizeOptions: ['Standard Set'],
    stock: 80,
    sizeStock: { 'Standard Set': 80 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-hk-3',
    numericId: 30,
    title: 'Modern Ceramic Table Vase for Living Room Decor',
    description: 'Minimalist handcrafted ceramic vase designed to elevate home decor, living room shelves, and festive floral arrangements.',
    category: 'Home & Kitchen Decor',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 740,
    reviewCount: 190,
    images: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Artisan Home Decor',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Material', value: 'High-Fired Ceramic' },
      { label: 'Height', value: '8 Inches' },
      { label: 'Finish', value: 'Matte Glazed' }
    ],
    additionalDetails: [
      { label: 'Placement', value: 'Living Room, Office, Dining' },
      { label: 'Care', value: 'Wipe with Damp Cloth' }
    ],
    sizeOptions: ['Standard'],
    stock: 100,
    sizeStock: { 'Standard': 100 },
    approvalStatus: 'approved'
  },

  // 11. Electronics & Mobiles (3 products, 6 unique images)
  {
    id: 'prod-em-1',
    numericId: 31,
    title: 'Active Noise Cancelling Wireless Bluetooth Earbuds',
    description: 'Immersive sound quality TWS earbuds featuring ENC mic, 40-hour playback with case, and ultra-low latency gaming mode.',
    category: 'Electronics & Mobiles',
    price: 899,
    originalPrice: 2999,
    discountPercent: 70,
    codPrice: 899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 5400,
    reviewCount: 1420,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'TechNova Gadgets India',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Bluetooth Version', value: 'v5.3 Ultra Stable' },
      { label: 'Playback', value: 'Up to 40 Hours with Case' },
      { label: 'Charging', value: 'Type-C Fast Charge' }
    ],
    additionalDetails: [
      { label: 'Water Resistance', value: 'IPX5 Splashproof' },
      { label: 'Warranty', value: '6 Months Replacement' }
    ],
    sizeOptions: ['Standard'],
    stock: 250,
    sizeStock: { 'Standard': 250 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-em-2',
    numericId: 32,
    title: 'Fast Charging 20000mAh Power Bank with LED Display',
    description: 'High-capacity dual USB output power bank with intelligent power distribution and digital percentage battery indicator.',
    category: 'Electronics & Mobiles',
    price: 999,
    originalPrice: 2499,
    discountPercent: 60,
    codPrice: 999,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 3800,
    reviewCount: 990,
    images: [
      'https://images.unsplash.com/photo-1609592424158-450f3835626a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'PowerGrid Electronics',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Capacity', value: '20000 mAh Li-Polymer' },
      { label: 'Output', value: '22.5W Fast Two-Way Charging' },
      { label: 'Display', value: 'Smart LED Battery Percentage' }
    ],
    additionalDetails: [
      { label: 'Ports', value: 'Dual USB-A & Type-C' },
      { label: 'Safety', value: '9-Layer Circuit Protection' }
    ],
    sizeOptions: ['20000mAh'],
    stock: 140,
    sizeStock: { '20000mAh': 140 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-em-3',
    numericId: 33,
    title: 'Ultra-Slim Portable Wireless Fast Charging Pad',
    description: 'Qi-certified wireless charger pad with intelligent foreign object detection and LED sleep-friendly indicator.',
    category: 'Electronics & Mobiles',
    price: 499,
    originalPrice: 1299,
    discountPercent: 62,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1150,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'GadgetCraft Solutions',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Output', value: '15W Max Fast Wireless Charge' },
      { label: 'Compatibility', value: 'All Qi-Enabled Phones & Earbuds' },
      { label: 'Design', value: 'Ultra-Slim Aluminum Alloy' }
    ],
    additionalDetails: [
      { label: 'Input Port', value: 'USB Type-C' },
      { label: 'Protection', value: 'Over-Temperature Protection' }
    ],
    sizeOptions: ['Standard'],
    stock: 110,
    sizeStock: { 'Standard': 110 },
    approvalStatus: 'approved'
  },

  // 12. Watches & Smartbands (3 products, 6 unique images)
  {
    id: 'prod-ws-1',
    numericId: 34,
    title: 'Luxury Golden Analog Quartz Wristwatch for Men',
    description: 'Sophisticated golden stainless steel wrist watch with luminous hands, date display, and water resistance.',
    category: 'Watches & Smartbands',
    price: 899,
    originalPrice: 2999,
    discountPercent: 70,
    codPrice: 899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2200,
    reviewCount: 590,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Titanium Timepieces',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Movement', value: 'Japanese Quartz' },
      { label: 'Strap', value: 'Stainless Steel Golden Mesh' },
      { label: 'Water Resistance', value: '30 Meters (3 ATM)' }
    ],
    additionalDetails: [
      { label: 'Dial Shape', value: 'Round' },
      { label: 'Warranty', value: '1 Year Movement Warranty' }
    ],
    sizeOptions: ['Standard Dial'],
    stock: 95,
    sizeStock: { 'Standard Dial': 95 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-ws-2',
    numericId: 35,
    title: 'Bluetooth Calling AMOLED Smartwatch with Fitness Tracker',
    description: 'Feature-packed smartwatch with crisp AMOLED display, Bluetooth calling speaker, SpO2 monitoring, and 100+ sports modes.',
    category: 'Watches & Smartbands',
    price: 1499,
    originalPrice: 4999,
    discountPercent: 70,
    codPrice: 1499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 4800,
    reviewCount: 1350,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'SmartWear Innovations',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Display', value: '1.96" HD AMOLED Always-On' },
      { label: 'Calling', value: 'Single-Chip Bluetooth Calling' },
      { label: 'Health Sensors', value: 'Heart Rate, SpO2 & Sleep Tracker' }
    ],
    additionalDetails: [
      { label: 'Battery Life', value: 'Up to 7 Days' },
      { label: 'App Support', value: 'iOS & Android' }
    ],
    sizeOptions: ['Standard'],
    stock: 160,
    sizeStock: { 'Standard': 160 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-ws-3',
    numericId: 36,
    title: 'Minimalist Rose Gold Mesh Strap Watch for Women',
    description: 'Elegant minimalist women timepiece featuring sunray dial and rose gold adjustable mesh bracelet.',
    category: 'Watches & Smartbands',
    price: 799,
    originalPrice: 2299,
    discountPercent: 65,
    codPrice: 799,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1240,
    reviewCount: 340,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Chic Timepieces Co.',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Strap', value: 'Rose Gold Stainless Steel Mesh' },
      { label: 'Dial Glass', value: 'Mineral Hardened Crystal' },
      { label: 'Style', value: 'Formal & Casual Elegance' }
    ],
    additionalDetails: [
      { label: 'Clasp', value: 'Hook Buckle' },
      { label: 'Gift Box', value: 'Included' }
    ],
    sizeOptions: ['Standard'],
    stock: 85,
    sizeStock: { 'Standard': 85 },
    approvalStatus: 'approved'
  },

  // 13. Sports & Active Gym (3 products, 6 unique images)
  {
    id: 'prod-sg-1',
    numericId: 37,
    title: 'Adjustable Resistance Rubber Exercise Toning Bands (Set of 5)',
    description: 'Color-coded stackable resistance bands with door anchor, handles, and ankle straps for home gym workouts and physical therapy.',
    category: 'Sports & Active Gym',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2600,
    reviewCount: 710,
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'FitPro Fitness Gear',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Material', value: '100% Natural Latex' },
      { label: 'Resistance Level', value: '10 lbs to 100 lbs Stackable' },
      { label: 'Includes', value: '5 Bands, 2 Handles, Door Anchor' }
    ],
    additionalDetails: [
      { label: 'Portability', value: 'Includes Carry Pouch' },
      { label: 'Warranty', value: '6 Months' }
    ],
    sizeOptions: ['Set of 5'],
    stock: 150,
    sizeStock: { 'Set of 5': 150 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-sg-2',
    numericId: 38,
    title: 'Professional Stainless Steel Insulated Gym Water Bottle (1000ml)',
    description: 'Double-wall vacuum insulated water bottle that keeps beverages cold for 24 hours or hot for 12 hours during rigorous training.',
    category: 'Sports & Active Gym',
    price: 499,
    originalPrice: 1299,
    discountPercent: 62,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 3400,
    reviewCount: 920,
    images: [
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'HydratePro India',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Capacity', value: '1000 ml' },
      { label: 'Material', value: 'Food Grade 18/8 Stainless Steel' },
      { label: 'Insulation', value: 'Double Wall Vacuum Thermal' }
    ],
    additionalDetails: [
      { label: 'Leak Proof', value: '100% Leak Proof Lid' },
      { label: 'BPA Free', value: 'Yes' }
    ],
    sizeOptions: ['1000ml'],
    stock: 180,
    sizeStock: { '1000ml': 180 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-sg-3',
    numericId: 39,
    title: 'Anti-Skid NBR Exercise Yoga Mat with Carrying Strap (6mm)',
    description: 'High-density cushioning yoga mat designed to protect joints and provide excellent grip during yoga, pilates, and floor exercises.',
    category: 'Sports & Active Gym',
    price: 599,
    originalPrice: 1499,
    discountPercent: 60,
    codPrice: 599,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1850,
    reviewCount: 490,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Zenith Wellness Gear',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Thickness', value: '6mm High Density NBR' },
      { label: 'Texture', value: 'Dual-Sided Anti-Slip Surface' },
      { label: 'Accessory', value: 'Free Carrying Strap' }
    ],
    additionalDetails: [
      { label: 'Dimensions', value: '183 cm x 61 cm' },
      { label: 'Water Resistant', value: 'Easy to Wipe Clean' }
    ],
    sizeOptions: ['Standard 6mm'],
    stock: 110,
    sizeStock: { 'Standard 6mm': 110 },
    approvalStatus: 'approved'
  },

  // 14. Toys, Games & Baby Care (3 products, 6 unique images)
  {
    id: 'prod-tg-1',
    numericId: 40,
    title: 'Educational Wooden Montessori Alphabet & Number Puzzle Board',
    description: 'Eco-friendly wooden peg puzzle board designed to help toddlers learn English alphabets, numbers, and basic shapes interactively.',
    category: 'Toys, Games & Baby Care',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 2100,
    reviewCount: 580,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'KiddieLand Toys India',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Material', value: 'Natural Wood with Non-Toxic Paint' },
      { label: 'Skill Focus', value: 'Hand-Eye Coordination & Cognitive' },
      { label: 'Age', value: '2 to 5 Years' }
    ],
    additionalDetails: [
      { label: 'Safety', value: 'BIS Certified Safe' },
      { label: 'Dimensions', value: 'Standard Board' }
    ],
    sizeOptions: ['Standard'],
    stock: 95,
    sizeStock: { 'Standard': 95 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-tg-2',
    numericId: 41,
    title: 'Interactive Musical Crawling Crab Toy with LED Lights',
    description: 'Sensor-driven crawling crab toy that plays cheerful melodies and avoids obstacles, encouraging babies to crawl and walk.',
    category: 'Toys, Games & Baby Care',
    price: 699,
    originalPrice: 1699,
    discountPercent: 58,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1450,
    reviewCount: 390,
    images: [
      'https://images.unsplash.com/photo-1532336414038-cf19250c5756?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1558060370-d644429cb64c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'SmartBaby Innovations',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Feature', value: 'Obstacle Avoidance & Music' },
      { label: 'Power', value: 'USB Rechargeable Battery' },
      { label: 'Lights', value: 'Dynamic LED Eye Glow' }
    ],
    additionalDetails: [
      { label: 'Age', value: '6 Months+' },
      { label: 'Material', value: 'ABS Safe Plastic' }
    ],
    sizeOptions: ['Standard'],
    stock: 80,
    sizeStock: { 'Standard': 80 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-tg-3',
    numericId: 42,
    title: 'Soft Plush Stuffed Teddy Bear Toy with Ribbon (60 cm)',
    description: 'Cuddly, ultra-soft plush teddy bear stuffed with hypoallergenic fibers. Perfect birthday and festive gift for kids and loved ones.',
    category: 'Toys, Games & Baby Care',
    price: 599,
    originalPrice: 1499,
    discountPercent: 60,
    codPrice: 599,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 3200,
    reviewCount: 890,
    images: [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'PlushWorld Toys',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Height', value: '60 cm / 24 Inches' },
      { label: 'Filling', value: '100% Virgin Polyester Staple Fiber' },
      { label: 'Fabric', value: 'Velvety Soft Fur' }
    ],
    additionalDetails: [
      { label: 'Washable', value: 'Surface Washable' },
      { label: 'Non-Toxic', value: 'Child Safe' }
    ],
    sizeOptions: ['60cm'],
    stock: 120,
    sizeStock: { '60cm': 120 },
    approvalStatus: 'approved'
  },

  // 15. Books & Office Supplies (3 products, 6 unique images)
  {
    id: 'prod-bo-1',
    numericId: 43,
    title: 'Hardcover Ruled Journal Notebook & Pen Gift Set',
    description: 'Premium PU leather hardcover journal notebook with bookmark ribbon, elastic band closure, and smooth cream pages.',
    category: 'Books & Office Supplies',
    price: 349,
    originalPrice: 899,
    discountPercent: 61,
    codPrice: 349,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1600,
    reviewCount: 420,
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Stationery Hub India',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Pages', value: '192 Ruled Acid-Free Pages' },
      { label: 'Cover', value: 'Faux Leather Hardbound' },
      { label: 'Includes', value: 'Matching Metal Ballpen' }
    ],
    additionalDetails: [
      { label: 'Size', value: 'A5 Notebook' },
      { label: 'Binding', value: 'Thread Bound Stitched' }
    ],
    sizeOptions: ['A5 Size'],
    stock: 150,
    sizeStock: { 'A5 Size': 150 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bo-2',
    numericId: 44,
    title: 'Professional Desktop Multi-Compartment Organizer Caddy',
    description: 'Sturdy metallic mesh desktop organizer with multiple compartments for pens, sticky notes, scissors, and office stationery.',
    category: 'Books & Office Supplies',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1120,
    reviewCount: 300,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'OfficeMate Solutions',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Material', value: 'Durable Steel Mesh' },
      { label: 'Compartments', value: '6 Sorting Compartments + Drawer' },
      { label: 'Finish', value: 'Black Anti-Rust Powder Coat' }
    ],
    additionalDetails: [
      { label: 'Usage', value: 'Office Desk & Study Table' },
      { label: 'Assembly', value: 'Pre-Assembled' }
    ],
    sizeOptions: ['Standard'],
    stock: 100,
    sizeStock: { 'Standard': 100 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-bo-3',
    numericId: 45,
    title: 'Ergonomic Wooden Reading & Laptop Stand for Desk',
    description: 'Adjustable angle solid wood book and laptop stand designed to improve posture and reduce neck strain during reading or work.',
    category: 'Books & Office Supplies',
    price: 699,
    originalPrice: 1799,
    discountPercent: 61,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 890,
    reviewCount: 240,
    images: [
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'ErgoCraft India',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Material', value: 'Natural Pine Wood' },
      { label: 'Adjustability', value: '6 Tilt Angle Adjustments' },
      { label: 'Portability', value: 'Foldable Flat Design' }
    ],
    additionalDetails: [
      { label: 'Compatibility', value: 'Books, Tablets & Laptops' },
      { label: 'Weight', value: 'Lightweight & Sturdy' }
    ],
    sizeOptions: ['Standard'],
    stock: 85,
    sizeStock: { 'Standard': 85 },
    approvalStatus: 'approved'
  },

  // 16. Grocery & Gourmet Food (3 products, 6 unique images)
  {
    id: 'prod-gr-1',
    numericId: 46,
    title: 'Organic Kashmiri Saffron / Kesar Box (1 Gram)',
    description: 'Pure Grade-A Mongra Kashmiri saffron stigmas known for rich aroma, deep crimson color, and authentic gourmet flavor.',
    category: 'Grocery & Gourmet Food',
    price: 499,
    originalPrice: 1299,
    discountPercent: 61,
    codPrice: 499,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 1850,
    reviewCount: 490,
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Kashmir Valley Spices',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Grade', value: '100% Pure Mongra Saffron' },
      { label: 'Weight', value: '1 Gram' },
      { label: 'Aroma', value: 'Intense Natural Fragrance' }
    ],
    additionalDetails: [
      { label: 'Packaging', value: 'Hermetic Glass Vial' },
      { label: 'Purity', value: 'Lab Tested ISO Certified' }
    ],
    sizeOptions: ['1 Gram'],
    stock: 140,
    sizeStock: { '1 Gram': 140 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-gr-2',
    numericId: 47,
    title: 'Premium Raw Wildflower Honey in Glass Jar (500g)',
    description: 'Unprocessed 100% pure natural raw honey harvested from wild forest blossoms, retaining natural pollen and enzymes.',
    category: 'Grocery & Gourmet Food',
    price: 399,
    originalPrice: 999,
    discountPercent: 60,
    codPrice: 399,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 2400,
    reviewCount: 650,
    images: [
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Himalayan Organic Farms',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Weight', value: '500 Grams' },
      { label: 'Quality', value: '100% Raw & Unfiltered' },
      { label: 'Source', value: 'Wild Forest Blossoms' }
    ],
    additionalDetails: [
      { label: 'Container', value: 'Glass Jar' },
      { label: 'Shelf Life', value: '24 Months' }
    ],
    sizeOptions: ['500g Jar'],
    stock: 160,
    sizeStock: { '500g Jar': 160 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-gr-3',
    numericId: 48,
    title: 'Assorted Gourmet Dry Fruits Gift Box (Cashews, Almonds, Pistachios - 500g)',
    description: 'Festive gift box containing handpicked premium quality California almonds, Indian cashews, and roasted pistachios.',
    category: 'Grocery & Gourmet Food',
    price: 699,
    originalPrice: 1699,
    discountPercent: 58,
    codPrice: 699,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 3100,
    reviewCount: 840,
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1488459716790-3b5535277143?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'Royal Dry Fruits Emporium',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Contents', value: 'Almonds, Cashews, Pistachios' },
      { label: 'Net Weight', value: '500g Total' },
      { label: 'Packaging', value: 'Festive Gift Box' }
    ],
    additionalDetails: [
      { label: 'Occasion', value: 'Festivals & Corporate Gifting' },
      { label: 'Quality', value: 'Jumbo Size Kernels' }
    ],
    sizeOptions: ['500g Box'],
    stock: 110,
    sizeStock: { '500g Box': 110 },
    approvalStatus: 'approved'
  },

  // 17. Automotive Accessories (3 products, 6 unique images)
  {
    id: 'prod-au-1',
    numericId: 49,
    title: 'Dual Camera HD Dash Cam for Cars with Night Vision',
    description: 'Front and cabin car dash camera featuring loop recording, G-sensor collision detection, and clear night vision.',
    category: 'Automotive Accessories',
    price: 1899,
    originalPrice: 4999,
    discountPercent: 62,
    codPrice: 1899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.8,
    ratingCount: 1950,
    reviewCount: 520,
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'AutoShield Technologies',
    soldByRating: 4.8,
    productHighlights: [
      { label: 'Resolution', value: '1080P Full HD Dual Lens' },
      { label: 'Sensor', value: 'G-Sensor & Motion Detection' },
      { label: 'Memory Support', value: 'Up to 64GB MicroSD' }
    ],
    additionalDetails: [
      { label: 'Installation', value: 'Windshield Mount & Cigarette Lighter Plug' },
      { label: 'Warranty', value: '1 Year' }
    ],
    sizeOptions: ['Standard'],
    stock: 70,
    sizeStock: { 'Standard': 70 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-au-2',
    numericId: 50,
    title: 'Portable High-Pressure Electric Car Tyre Inflator Pump',
    description: 'Compact digital air compressor pump with auto shut-off, LED emergency flashlight, and digital pressure gauge for cars and bikes.',
    category: 'Automotive Accessories',
    price: 1299,
    originalPrice: 3299,
    discountPercent: 60,
    codPrice: 1299,
    isCodAvailable: true,
    reviews: [],
    rating: 4.9,
    ratingCount: 2800,
    reviewCount: 740,
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'SpeedWay Auto Gadgets',
    soldByRating: 4.9,
    productHighlights: [
      { label: 'Max Pressure', value: '150 PSI Fast Inflation' },
      { label: 'Display', value: 'Digital LCD Pressure Preset' },
      { label: 'Extra', value: 'Built-in LED Work Light' }
    ],
    additionalDetails: [
      { label: 'Power Source', value: '12V Car Socket / Rechargeable Battery' },
      { label: 'Portability', value: 'Compact Glovebox Size' }
    ],
    sizeOptions: ['Standard'],
    stock: 90,
    sizeStock: { 'Standard': 90 },
    approvalStatus: 'approved'
  },
  {
    id: 'prod-au-3',
    numericId: 51,
    title: 'Waterproof All-Weather Car Body Cover with Mirror Pockets',
    description: 'Heavy-duty breathable fabric car cover designed to protect against UV rays, dust, scratches, and heavy monsoon rain.',
    category: 'Automotive Accessories',
    price: 899,
    originalPrice: 2299,
    discountPercent: 60,
    codPrice: 899,
    isCodAvailable: true,
    reviews: [],
    rating: 4.7,
    ratingCount: 1620,
    reviewCount: 430,
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [],
    soldBy: 'AutoGuard Protections',
    soldByRating: 4.7,
    productHighlights: [
      { label: 'Material', value: 'Parachute Tafetta Water Resistant' },
      { label: 'Fit', value: 'Custom Mirror Pockets & Elastic Hem' },
      { label: 'Protection', value: 'UV Resistant & Dust Proof' }
    ],
    additionalDetails: [
      { label: 'Buckle', value: 'Windproof Center Buckle Strap' },
      { label: 'Washable', value: 'Yes' }
    ],
    sizeOptions: ['Sedan', 'SUV', 'Hatchback'],
    stock: 100,
    sizeStock: { 'Sedan': 40, 'SUV': 30, 'Hatchback': 30 },
    approvalStatus: 'approved'
  }
];

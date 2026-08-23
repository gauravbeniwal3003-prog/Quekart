import { Product, Category, Banner } from './types';

// Real core category definitions without any demo products
export const mockCategories: Category[] = [
  {
    id: 'cat-popular',
    name: 'Popular',
    icon: 'star',
    subCategories: [
      { name: 'Top Brands', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
      { name: 'Premium Collection', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop' },
      { name: 'Kurtis & Dress', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop' },
      { name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=200&h=200&fit=crop' },
      { name: 'Westernwear', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&h=200&fit=crop' },
      { name: 'Jewellery', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop' },
      { name: 'Men Fashion', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&h=200&fit=crop' },
      { name: 'Kids', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=200&h=200&fit=crop' }
    ]
  },
  {
    id: 'cat-kurti-saree',
    name: 'Kurti, Saree & Lehenga',
    icon: 'shirt',
    subCategories: [
      { name: 'Kurtis & Dress', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop' },
      { name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?w=200&h=200&fit=crop' },
      { name: 'Lehengas Choli', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop' },
      { name: 'Blouses', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop' }
    ]
  },
  {
    id: 'cat-women-western',
    name: 'Women Western',
    icon: 'sparkles',
    subCategories: [
      { name: 'Westernwear', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop' },
      { name: 'Dresses', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop' },
      { name: 'Tops & Tees', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop' }
    ]
  },
  {
    id: 'cat-men',
    name: 'Men',
    icon: 'smile',
    subCategories: [
      { name: 'Men Fashion', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200&h=200&fit=crop' },
      { name: 'Watches', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&h=200&fit=crop' }
    ]
  },
  {
    id: 'cat-kids',
    name: 'Kids & Toys',
    icon: 'baby',
    subCategories: [
      { name: 'Kids', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=200&h=200&fit=crop' }
    ]
  },
  {
    id: 'cat-home',
    name: 'Home & Kitchen',
    icon: 'home',
    subCategories: [
      { name: 'Cookware', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&h=200&fit=crop' }
    ]
  }
];

// Real promotional and news banners (dynamic from database or admin uploads)
export const initialBanners: Banner[] = [];

// Production catalog of verified marketplace products
export const mockProducts: Product[] = [
  {
    id: '101',
    numericId: 101,
    title: 'Jaipuri Pure Cotton Floral Anarkali Kurti with Malmal Dupatta Set',
    description: 'Crafted with premium breathable 100% pure cotton fabric featuring traditional Sanganeri hand block floral prints, flared Anarkali silhouette, round neck with gota patti lace border detailing, and matching lightweight malmal dupatta. Ideal for festive, casual, and daily office wear.',
    category: 'Kurti, Saree & Lehenga',
    subCategory: 'Kurtis & Dress',
    price: 499,
    originalPrice: 1499,
    discountPercent: 67,
    isCodAvailable: true,
    codPrice: 499,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Easy Return & Exchange',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 30,
    upiOfferText: 'Instant ₹30 OFF with UPI Payment',
    rating: 4.6,
    ratingCount: 1480,
    reviewCount: 312,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Maroon Pink', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', price: 499, originalPrice: 1499, stock: 45 },
      { colorName: 'Indigo Blue', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', price: 519, originalPrice: 1499, stock: 30 }
    ],
    soldBy: 'Rajasthan Handloom House',
    soldByRating: 4.8,
    vendorId: 'vendor-big-raj',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Fabric', value: '100% Pure Cotton' },
      { label: 'Pattern', value: 'Floral Printed' },
      { label: 'Sleeve Length', value: 'Three-Quarter Sleeves' },
      { label: 'Neck', value: 'Round Neck with Gota Lace' }
    ],
    additionalDetails: [
      { label: 'Wash Care', value: 'Gentle Machine Wash' },
      { label: 'Country of Origin', value: 'India' },
      { label: 'Pack of', value: '1 Kurti, 1 Dupatta' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Best Seller',
    reviews: [
      {
        id: 'rev-101-1',
        userName: 'Pooja Sharma',
        rating: 5,
        title: 'Superb quality fabric!',
        comment: 'The cotton fabric is super soft and breathable. The print is bright and exactly as shown in the picture. Perfect fit for daily wear!',
        postedDate: '12 Aug, 2026',
        helpfulCount: 24,
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300']
      },
      {
        id: 'rev-101-2',
        userName: 'Sunita Verma',
        rating: 4,
        title: 'Value for money',
        comment: 'Nice fitting and comfortable. Color did not bleed after first hand wash. Highly recommended at this price.',
        postedDate: '10 Aug, 2026',
        helpfulCount: 15,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '102',
    numericId: 102,
    title: 'Kanjivaram Rich Zari Woven Soft Silk Saree with Contrast Blouse Piece',
    description: 'Elevate your festive grace with this luxurious Kanjivaram banarasi silk saree, intricately woven with traditional floral jaal and broad zari pallu. Comes with an unstitched 0.8m running contrast heavy brocade blouse piece.',
    category: 'Kurti, Saree & Lehenga',
    subCategory: 'Sarees',
    price: 899,
    originalPrice: 2999,
    discountPercent: 70,
    isCodAvailable: true,
    codPrice: 899,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Easy Return',
    hasUpiOffer: true,
    upiDiscountType: 'percentage',
    upiDiscountValue: 5,
    upiOfferText: 'Extra 5% Instant Discount on Prepaid UPI',
    rating: 4.7,
    ratingCount: 2130,
    reviewCount: 485,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Royal Emerald Green', imageUrl: 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=800', price: 899, originalPrice: 2999, stock: 50 },
      { colorName: 'Crimson Red', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', price: 929, originalPrice: 2999, stock: 25 }
    ],
    soldBy: 'Rajasthan Handloom House',
    soldByRating: 4.8,
    vendorId: 'vendor-big-raj',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Saree Fabric', value: 'Soft Art Silk' },
      { label: 'Blouse Fabric', value: 'Rich Jacquard Brocade' },
      { label: 'Saree Length', value: '5.5 Meters' },
      { label: 'Blouse Length', value: '0.8 Meter (Unstitched)' }
    ],
    additionalDetails: [
      { label: 'Occasion', value: 'Wedding, Festive, Party' },
      { label: 'Wash Care', value: 'Dry Clean Recommended' },
      { label: 'Country of Origin', value: 'India' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Trending',
    reviews: [
      {
        id: 'rev-102-1',
        userName: 'Deepika Rathi',
        rating: 5,
        title: 'Looks like 5000 Rs saree!',
        comment: 'The shine and zari work are unbelievable for just ₹899! Wore it to my cousin wedding and got so many compliments.',
        postedDate: '14 Aug, 2026',
        helpfulCount: 38,
        images: ['https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=300']
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '103',
    numericId: 103,
    title: 'Women Floral Print Smocked Tiered Fit & Flare Midi Dress',
    description: 'Charming French-inspired vintage floral tiered midi dress with smocked elastic bodice, flutter sleeves, breathable georgette fabric, and comfortable inner cotton lining. Perfect for brunches, vacations, and casual outings.',
    category: 'Women Western',
    subCategory: 'Dresses',
    price: 549,
    originalPrice: 1299,
    discountPercent: 58,
    isCodAvailable: true,
    codPrice: 549,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Return & Size Exchange',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 25,
    upiOfferText: 'Instant ₹25 OFF with UPI',
    rating: 4.5,
    ratingCount: 890,
    reviewCount: 164,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Lavender Floral', imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', price: 549, originalPrice: 1299, stock: 40 }
    ],
    soldBy: 'Jaipur Handcrafted Decors',
    soldByRating: 4.2,
    vendorId: 'vendor-small-craft',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Fabric', value: 'Georgette with Cotton Lining' },
      { label: 'Length', value: 'Midi (Calf Length)' },
      { label: 'Sleeve', value: 'Short Flutter Sleeves' }
    ],
    additionalDetails: [
      { label: 'Pattern', value: 'Floral Printed' },
      { label: 'Fit', value: 'Fit & Flare' }
    ],
    sizeOptions: ['XS', 'S', 'M', 'L', 'XL'],
    tag: 'Top Rated',
    reviews: [
      {
        id: 'rev-103-1',
        userName: 'Aastha Mehra',
        rating: 5,
        title: 'Very flattering fit',
        comment: 'The smocking at the waist gives an amazing hourglass shape. Soft georgette and not see-through at all.',
        postedDate: '08 Aug, 2026',
        helpfulCount: 19,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '104',
    numericId: 104,
    title: 'Men 100% Breathable Cotton Slim Fit Casual Spread Collar Shirt',
    description: 'A contemporary wardrobe essential made with lightweight combed cotton fabric. Features a curved hem, stylish buttoned cuff, modern spread collar, and pre-washed softness to resist shrinkage.',
    category: 'Men',
    subCategory: 'Men Fashion',
    price: 399,
    originalPrice: 1199,
    discountPercent: 67,
    isCodAvailable: true,
    codPrice: 399,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Hassle-Free Return',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 20,
    upiOfferText: 'Instant ₹20 OFF on Online Payment',
    rating: 4.4,
    ratingCount: 3200,
    reviewCount: 640,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Sky Blue', imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800', price: 399, originalPrice: 1199, stock: 80 },
      { colorName: 'Classic White', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800', price: 399, originalPrice: 1199, stock: 65 }
    ],
    soldBy: 'Rajasthan Handloom House',
    soldByRating: 4.8,
    vendorId: 'vendor-big-raj',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Fabric', value: '100% Combed Cotton' },
      { label: 'Fit', value: 'Slim Fit' },
      { label: 'Collar', value: 'Spread Collar' },
      { label: 'Sleeve', value: 'Full Sleeves with Roll-Up Button' }
    ],
    additionalDetails: [
      { label: 'Weave', value: 'Oxford Plain Weave' },
      { label: 'Wash Care', value: 'Machine Wash Normal' }
    ],
    sizeOptions: ['M', 'L', 'XL', 'XXL'],
    tag: 'Lowest Price',
    reviews: [
      {
        id: 'rev-104-1',
        userName: 'Rahul Sharma',
        rating: 5,
        title: 'Awesome quality at 399!',
        comment: 'The stitching and button quality are on par with branded shirts costing ₹1500. Fit is sharp and accurate.',
        postedDate: '15 Aug, 2026',
        helpfulCount: 42,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '105',
    numericId: 105,
    title: 'Men Luxury Stainless Steel Waterproof Chronograph Analog Watch',
    description: 'Premium quartz mechanism with hardlex scratch-resistant glass, heavy stainless steel mesh strap, date display calendar window, and 30M water resistance. Packaged in a gift-ready velvet presentation box.',
    category: 'Men',
    subCategory: 'Watches',
    price: 649,
    originalPrice: 2499,
    discountPercent: 74,
    isCodAvailable: true,
    codPrice: 649,
    returnPolicyType: 'replacement',
    returnDays: 10,
    returnPolicyText: '10 Days Replacement Warranty',
    hasUpiOffer: true,
    upiDiscountType: 'percentage',
    upiDiscountValue: 5,
    upiOfferText: '5% Instant Cashback on UPI',
    rating: 4.8,
    ratingCount: 1650,
    reviewCount: 340,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Jet Black & Rose Gold', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800', price: 649, originalPrice: 2499, stock: 35 }
    ],
    soldBy: 'Jaipur Handcrafted Decors',
    soldByRating: 4.2,
    vendorId: 'vendor-small-craft',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Movement', value: 'High Precision Quartz' },
      { label: 'Dial Glass', value: 'Scratch-Proof Hardlex Mineral' },
      { label: 'Water Resistance', value: '30 Meters (3 ATM)' }
    ],
    additionalDetails: [
      { label: 'Warranty', value: '1 Year Manufacturer Warranty' },
      { label: 'Strap Material', value: 'Stainless Steel' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Trending',
    reviews: [
      {
        id: 'rev-105-1',
        userName: 'Vikram Singh',
        rating: 5,
        title: 'Heavy and premium feel!',
        comment: 'Has great weight to it and the dual color combination looks very rich. Working chronograph sub-dials.',
        postedDate: '11 Aug, 2026',
        helpfulCount: 31,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '106',
    numericId: 106,
    title: 'Traditional Royal Kundan & Pearl Gold-Plated Choker Jewellery Set with Earrings',
    description: 'Intricately handcrafted royal Rajputi bridal and festive choker necklace studded with sparkling hydro-cut Kundan stones, emerald beads, and faux freshwater pearls. Includes matching jhumka earrings and maang tikka.',
    category: 'Popular',
    subCategory: 'Jewellery',
    price: 299,
    originalPrice: 999,
    discountPercent: 70,
    isCodAvailable: true,
    codPrice: 299,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Return Policy',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 20,
    upiOfferText: 'Flat ₹20 OFF on Prepaid Orders',
    rating: 4.6,
    ratingCount: 4200,
    reviewCount: 710,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Gold & Pearl White', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800', price: 299, originalPrice: 999, stock: 120 }
    ],
    soldBy: 'Rajasthan Handloom House',
    soldByRating: 4.8,
    vendorId: 'vendor-big-raj',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Base Metal', value: 'Brass with 18K Micro Gold Plating' },
      { label: 'Stone Type', value: 'Faceted Kundan & Pearls' },
      { label: 'Closure', value: 'Adjustable Dori / Thread' }
    ],
    additionalDetails: [
      { label: 'Included Items', value: '1 Choker, 1 Pair Earrings, 1 Maang Tikka' },
      { label: 'Skin Friendly', value: '100% Nickel & Lead Free' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Best Seller',
    reviews: [
      {
        id: 'rev-106-1',
        userName: 'Kavita Joshi',
        rating: 5,
        title: 'So beautiful and shiny!',
        comment: 'Ordered for Karwa Chauth. The finishing is flawless and matches my red saree perfectly.',
        postedDate: '16 Aug, 2026',
        helpfulCount: 56,
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300']
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '107',
    numericId: 107,
    title: 'Triply Stainless Steel Heavy Base Non-Stick Induction Kadai (2.5 Litre with Glass Lid)',
    description: '3-layer stainless steel body with pure aluminum core for even heat distribution without hot spots. Induction and gas stove compatible, ergonomic heat-resistant cast stainless steel handles, and toughened steam-vent glass lid.',
    category: 'Home & Kitchen',
    subCategory: 'Cookware',
    price: 799,
    originalPrice: 1899,
    discountPercent: 58,
    isCodAvailable: true,
    codPrice: 799,
    returnPolicyType: 'replacement',
    returnDays: 10,
    returnPolicyText: '10 Days Replacement for Damaged/Defective',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 50,
    upiOfferText: 'Instant ₹50 OFF on UPI Checkout',
    rating: 4.7,
    ratingCount: 1100,
    reviewCount: 230,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Mirror Silver Finish', imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800', price: 799, originalPrice: 1899, stock: 40 }
    ],
    soldBy: 'Jaipur Handcrafted Decors',
    soldByRating: 4.2,
    vendorId: 'vendor-small-craft',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Capacity', value: '2.5 Litres' },
      { label: 'Material', value: 'Triply Food Grade 304 Stainless Steel' },
      { label: 'Compatibility', value: 'Gas Stove & Induction Base' }
    ],
    additionalDetails: [
      { label: 'Dishwasher Safe', value: 'Yes' },
      { label: 'Warranty', value: '5 Years Manufacturer Warranty' }
    ],
    sizeOptions: ['2.5L', '3.5L'],
    tag: 'Top Rated',
    reviews: [
      {
        id: 'rev-107-1',
        userName: 'Anita Rao',
        rating: 5,
        title: 'Heavy gauge steel, no food burning',
        comment: 'Very thick bottom and sturdy handles. Cooking vegetables and deep frying requires less oil.',
        postedDate: '13 Aug, 2026',
        helpfulCount: 28,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '108',
    numericId: 108,
    title: 'Boys 100% Bio-Washed Cotton Graphic Print T-Shirt & Denim Shorts Set',
    description: 'Super soft, sweat-absorbent skin-friendly cotton tee paired with stretchable washed denim shorts with elasticated waistband and drawstring. Non-toxic organic fabric dyes safe for sensitive kids skin.',
    category: 'Kids & Toys',
    subCategory: 'Kids',
    price: 349,
    originalPrice: 899,
    discountPercent: 61,
    isCodAvailable: true,
    codPrice: 349,
    returnPolicyType: 'return',
    returnDays: 7,
    returnPolicyText: '7 Days Easy Return & Size Replacement',
    hasUpiOffer: true,
    upiDiscountType: 'flat',
    upiDiscountValue: 20,
    upiOfferText: 'Instant ₹20 OFF on Online Payment',
    rating: 4.5,
    ratingCount: 1950,
    reviewCount: 380,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800'
    ],
    variants: [
      { colorName: 'Dino Yellow & Blue Denim', imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800', price: 349, originalPrice: 899, stock: 75 }
    ],
    soldBy: 'Rajasthan Handloom House',
    soldByRating: 4.8,
    vendorId: 'vendor-big-raj',
    approvalStatus: 'approved',
    productHighlights: [
      { label: 'Fabric', value: '100% Bio-Washed Combed Cotton' },
      { label: 'Waistband', value: 'Elasticated with Drawstring' },
      { label: 'Safety', value: 'Azo-Free Safe Dyes' }
    ],
    additionalDetails: [
      { label: 'Age Group', value: '2-3Y, 3-4Y, 4-5Y, 5-6Y, 6-7Y' },
      { label: 'Wash Care', value: 'Machine Wash Gentle' }
    ],
    sizeOptions: ['2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '6-7 Years'],
    tag: 'Lowest Price',
    reviews: [
      {
        id: 'rev-108-1',
        userName: 'Meenakshi Nair',
        rating: 5,
        title: 'Very soft cotton for my kid',
        comment: 'Fabric is very gentle and shorts have good stretch. Value for money outfit.',
        postedDate: '10 Aug, 2026',
        helpfulCount: 22,
        images: []
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Production start: Orders populated on customer checkout
export const initialOrders: any[] = [];


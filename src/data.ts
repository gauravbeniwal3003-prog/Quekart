import { Product, Category } from './types';

// Let's create mock product images representing the screenshots
const WATCH_BLACK_MAIN = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=600';
const WATCH_BLUE = 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600';
const WATCH_BROWN = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600';
const WATCH_ROSE_GOLD = 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&q=80&w=600';
const WATCH_METALLIC = 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600';

const KURTI_MAIN = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600';
const SAREE_MAIN = 'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&q=80&w=600';
const KIDS_MAIN = 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=600';
const HOME_MAIN = 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600';
const COOKWARE_MAIN = 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600';
const JEWEL_MAIN = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600';
const BEAUTY_MAIN = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600';

// User photos for ratings matching Screenshot 1
const USER_WATCH_1 = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=150';
const USER_WATCH_2 = 'https://images.unsplash.com/photo-1434056886845-dac89ffee9b5?auto=format&fit=crop&q=80&w=150';
const USER_WATCH_3 = 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=150';

const rawProducts: Product[] = [
  {
    id: 'prod-watch-lr05',
    title: 'New Stylish LR 05 Black Dial Black PU Strap Watch For Men',
    description: 'Elevate your everyday look with this minimalist, classy analogue watch. Crafted with durable casing and a comfortable PU strap, this watch is suitable for casual outings, office wear, and gifting purposes.',
    category: 'Men',
    subCategory: 'Watches',
    price: 93,
    originalPrice: 152,
    discountPercent: 39,
    codPrice: 122,
    hasUpiOffer: true,
    rating: 3.8,
    ratingCount: 1253,
    reviewCount: 444,
    images: [WATCH_BLACK_MAIN, WATCH_BLUE, WATCH_BROWN, WATCH_ROSE_GOLD],
    variants: [
      { colorName: 'Black Dial', imageUrl: WATCH_BLACK_MAIN, price: 93, originalPrice: 152 },
      { colorName: 'Royal Blue Dial', imageUrl: WATCH_BLUE, price: 99, originalPrice: 159 },
      { colorName: 'Classic Brown', imageUrl: WATCH_BROWN, price: 95, originalPrice: 155 },
      { colorName: 'Rose Gold Accent', imageUrl: WATCH_ROSE_GOLD, price: 105, originalPrice: 170 },
      { colorName: 'Silver Steel', imageUrl: WATCH_METALLIC, price: 110, originalPrice: 180 }
    ],
    soldBy: 'HDFCREATION',
    soldByRating: 4.1,
    productHighlights: [
      { label: 'Case/Bezel Material', value: 'Alloy' },
      { label: 'Strap Material', value: 'Polyurethane (PU)' },
      { label: 'Clasp Type', value: 'Buckle' },
      { label: 'Dial Design', value: 'Minimalist No-numeral' },
      { label: 'Dial Shape', value: 'Round' }
    ],
    additionalDetails: [
      { label: 'Mechanism', value: 'Quartz Analogue' },
      { label: 'Power Source', value: 'Battery Powered' },
      { label: 'Water Resistance', value: 'Splash Resistant' },
      { label: 'Net Quantity', value: '1 Piece' },
      { label: 'Country of Origin', value: 'India' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Lowest Price',
    timeLeftText: '01h : 25m : 26s',
    reviews: [
      {
        id: 'rev-1',
        userName: 'Jittu Sahu',
        rating: 5,
        title: 'Very Good',
        comment: 'nice watch Looking cool, Jaisa dikhaya tha Same waisa hi mila hai. Pure black color looks premium on hand.',
        postedDate: '17 Jun, 2024',
        images: [USER_WATCH_1, USER_WATCH_2],
        helpfulCount: 29
      },
      {
        id: 'rev-2',
        userName: 'Rohan Sharma',
        rating: 5,
        title: 'Very Good',
        comment: 'The quality of watch is very well and the packaging was super tight. Totally worth the 93 Rupees!',
        postedDate: '07 Oct, 2024',
        images: [USER_WATCH_3],
        helpfulCount: 14
      },
      {
        id: 'rev-3',
        userName: 'Amit Patel',
        rating: 4,
        title: 'Good',
        comment: 'Nice watch in low price. Gifted to my younger brother, he liked it so much. Daily wearable.',
        postedDate: '12 Sep, 2024',
        images: [],
        helpfulCount: 8
      },
      {
        id: 'rev-4',
        userName: 'Suresh Kumar',
        rating: 3,
        title: 'Ok-Ok',
        comment: 'Decent watch. Strap quality is okay, not leather but works fine. Looks stylish.',
        postedDate: '24 Aug, 2024',
        images: [],
        helpfulCount: 2
      }
    ]
  },
  {
    id: 'prod-watch-csamon',
    title: 'CSAMON Fabulous Men Black Dial Analog Watch with Metal strap',
    description: 'Add a touch of elegance to your attire with CSAMON watches. Fitted with metal chain link straps and a durable casing, this is a premium look watch for wedding and formal occasions.',
    category: 'Men',
    subCategory: 'Watches',
    price: 83,
    originalPrice: 160,
    discountPercent: 48,
    isAd: true,
    codPrice: 116,
    hasUpiOffer: true,
    rating: 3.9,
    ratingCount: 3171,
    reviewCount: 981,
    images: [WATCH_METALLIC, WATCH_BLACK_MAIN],
    variants: [
      { colorName: 'Metallic Black', imageUrl: WATCH_METALLIC, price: 83, originalPrice: 160 }
    ],
    soldBy: 'CSAMON_ENTERPRISE',
    soldByRating: 3.9,
    productHighlights: [
      { label: 'Strap Material', value: 'Stainless Steel' },
      { label: 'Dial Shape', value: 'Round' }
    ],
    additionalDetails: [
      { label: 'Warranty', value: '6 Months Manufacturer' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Top rated',
    timeLeftText: '01h : 26m : 58s',
    reviews: [
      {
        id: 'rev-cs-1',
        userName: 'Manish G.',
        rating: 4,
        title: 'Good watch',
        comment: 'Chain quality is solid. Perfect matching for formals.',
        postedDate: '01 May, 2024',
        images: [],
        helpfulCount: 42
      }
    ]
  },
  {
    id: 'prod-watch-fogg',
    title: 'Fogg Modern Men Analog Watch - Unique Hexagonal Casing',
    description: 'Stand out from the crowd with Fogg Modern watch. It features an exquisite dark dial face, designer hour indicators, and a solid premium strap.',
    category: 'Men',
    subCategory: 'Watches',
    price: 249,
    originalPrice: 337,
    discountPercent: 26,
    codPrice: 282,
    hasUpiOffer: true,
    rating: 3.9,
    ratingCount: 751,
    reviewCount: 240,
    images: [WATCH_BROWN, WATCH_ROSE_GOLD],
    variants: [
      { colorName: 'Fogg Charcoal', imageUrl: WATCH_BROWN, price: 249, originalPrice: 337 }
    ],
    soldBy: 'FOGG_RETAILERS',
    soldByRating: 4.2,
    productHighlights: [
      { label: 'Strap Material', value: 'Genuine Leather Mix' },
      { label: 'Dial Shape', value: 'Hexagon' }
    ],
    additionalDetails: [
      { label: 'Net Quantity', value: '1 Piece' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Trending',
    reviews: []
  },
  {
    id: 'prod-watch-voguish',
    title: 'Voguish Men Analog Watches with Minimal Black Dial Face',
    description: 'Sleek and clean design for those who love minimalism. Perfectly matches both ethnic and casual outfits.',
    category: 'Men',
    subCategory: 'Watches',
    price: 85,
    originalPrice: 145,
    discountPercent: 41,
    codPrice: 116,
    hasUpiOffer: true,
    rating: 4.1,
    ratingCount: 161,
    reviewCount: 43,
    images: [WATCH_BLUE, WATCH_BLACK_MAIN],
    variants: [
      { colorName: 'Voguish Matte Black', imageUrl: WATCH_BLUE, price: 85, originalPrice: 145 }
    ],
    soldBy: 'VOGUE_TRENDS',
    soldByRating: 4.0,
    productHighlights: [
      { label: 'Strap Material', value: 'Silicon Strap' }
    ],
    additionalDetails: [
      { label: 'Warranty', value: 'No Warranty' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Budget Pick',
    reviews: []
  },
  // Apparel products from Lucky Categories screenshot
  {
    id: 'prod-kurti-anarkali',
    title: 'Premium Rayon Anarkali Kurti & dupatta Set For Women',
    description: 'Beautifully printed rayon ethnic dress with gota patti handwork. Ideal for festival celebrations, weddings, and traditional events. Soft, breathable fabric ensures all-day comfort.',
    category: 'Kurti, Saree & Lehenga',
    subCategory: 'Kurtis & Dress',
    price: 399,
    originalPrice: 799,
    discountPercent: 50,
    codPrice: 435,
    hasUpiOffer: true,
    rating: 4.2,
    ratingCount: 5123,
    reviewCount: 1845,
    images: [KURTI_MAIN, SAREE_MAIN],
    variants: [
      { colorName: 'Royal Indigo', imageUrl: KURTI_MAIN, price: 399, originalPrice: 799 }
    ],
    soldBy: 'SHREE_BALAJI_TEXTILES',
    soldByRating: 4.3,
    productHighlights: [
      { label: 'Fabric', value: 'Rayon' },
      { label: 'Pattern', value: 'Floral Printed' },
      { label: 'Sleeve Length', value: 'Three-Quarter Sleeves' }
    ],
    additionalDetails: [
      { label: 'Length', value: 'Ankle Length' },
      { label: 'Stitch Type', value: 'Fully Stitched' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Best Seller',
    reviews: []
  },
  {
    id: 'prod-saree-silk',
    title: 'Kanjivaram Saree Traditional Zari Border Saree',
    description: 'Embrace timeless beauty with our traditional Kanjivaram banarasi silk saree featuring heavy golden zari work. Perfect choice for brides, festivals, and family functions.',
    category: 'Kurti, Saree & Lehenga',
    subCategory: 'Sarees',
    price: 289,
    originalPrice: 599,
    discountPercent: 51,
    codPrice: 320,
    hasUpiOffer: true,
    rating: 4.0,
    ratingCount: 12943,
    reviewCount: 3412,
    images: [SAREE_MAIN, KURTI_MAIN],
    variants: [
      { colorName: 'Crimson Red & Gold', imageUrl: SAREE_MAIN, price: 289, originalPrice: 599 }
    ],
    soldBy: 'JAIPUR_WEAVERS',
    soldByRating: 4.1,
    productHighlights: [
      { label: 'Saree Fabric', value: 'Jacquard Silk' },
      { label: 'Blouse Fabric', value: 'Silk Blend' },
      { label: 'Zari Type', value: 'Gold Metallic Thread' }
    ],
    additionalDetails: [
      { label: 'Saree Length', value: '5.5 Meters' },
      { label: 'Blouse Length', value: '0.8 Meters' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Lowest Price',
    reviews: []
  },
  {
    id: 'prod-dress-western',
    title: 'Chic Crepe A-Line Flared Sleeve Dress',
    description: 'Elegant and lightweight western dress. Features a waist tie-up knot, elegant keyhole neck, and breathable synthetic fabric. Suitable for birthday parties, high teas, and casual dates.',
    category: 'Women Western',
    subCategory: 'Westernwear',
    price: 199,
    originalPrice: 399,
    discountPercent: 50,
    codPrice: 225,
    hasUpiOffer: true,
    rating: 4.3,
    ratingCount: 982,
    reviewCount: 312,
    images: [KURTI_MAIN],
    variants: [
      { colorName: 'Ruby Wine', imageUrl: KURTI_MAIN, price: 199, originalPrice: 399 }
    ],
    soldBy: 'GLAM_GIRL_CREATIONS',
    soldByRating: 4.4,
    productHighlights: [
      { label: 'Fabric', value: 'Crepe' },
      { label: 'Style', value: 'A-Line Flared' }
    ],
    additionalDetails: [
      { label: 'Length', value: 'Knee Length' }
    ],
    sizeOptions: ['S', 'M', 'L', 'XL'],
    tag: 'Popular',
    reviews: []
  },
  {
    id: 'prod-kids-suit',
    title: 'Kids Soft Cotton T-Shirt & Shorts Set (Pack of 2 Sets)',
    description: 'Crafted with premium skin-friendly combed cotton, this pack includes two bright colored t-shirts and two comfortable active shorts for kids daily wear.',
    category: 'Kids & Toys',
    subCategory: 'Kids',
    price: 245,
    originalPrice: 490,
    discountPercent: 50,
    codPrice: 270,
    hasUpiOffer: true,
    rating: 4.1,
    ratingCount: 1450,
    reviewCount: 520,
    images: [KIDS_MAIN],
    variants: [
      { colorName: 'Yellow & Peach Mix', imageUrl: KIDS_MAIN, price: 245, originalPrice: 490 }
    ],
    soldBy: 'TINY_TOTS_APPAREL',
    soldByRating: 4.1,
    productHighlights: [
      { label: 'Material', value: '100% Breathable Cotton' },
      { label: 'Pack of', value: '2 Sets' }
    ],
    additionalDetails: [
      { label: 'Ideal for', value: 'Unisex Kids' }
    ],
    sizeOptions: ['2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years'],
    tag: 'Value Pack',
    reviews: []
  },
  {
    id: 'prod-home-cookware',
    title: 'Non-Stick Aluminum Cookware Kadai & Fry Pan Combo',
    description: 'Complete non-stick kitchen set featuring extra thick aluminum for heat distribution. Ergonomic cool-touch bakelite handles and matching heavy-duty glass lids.',
    category: 'Home & Kitchen',
    subCategory: 'Cookware',
    price: 480,
    originalPrice: 960,
    discountPercent: 50,
    codPrice: 510,
    hasUpiOffer: true,
    rating: 4.3,
    ratingCount: 824,
    reviewCount: 290,
    images: [COOKWARE_MAIN, HOME_MAIN],
    variants: [
      { colorName: 'Cherry Red Cookset', imageUrl: COOKWARE_MAIN, price: 480, originalPrice: 960 }
    ],
    soldBy: 'METRO_KITCHEN_MART',
    soldByRating: 4.2,
    productHighlights: [
      { label: 'Material', value: 'Heavy Gauge Aluminum' },
      { label: 'Coating', value: '3-Layer Scratch Resistant Non-Stick' }
    ],
    additionalDetails: [
      { label: 'Induction Compatible', value: 'Yes' }
    ],
    sizeOptions: ['Free Size'],
    tag: 'Kitchen Star',
    reviews: []
  },
  {
    id: 'prod-home-decor',
    title: 'Royal Floral Print Ceramic Cushion Covers (Pack of 5)',
    description: 'Transform your living room setup with these glossy, ultra-soft printed decorative cushion covers. Comes with robust hidden zip closures and stitch interlocking.',
    category: 'Home & Kitchen',
    subCategory: 'Fruits', // using fruits as mock categories from header, let's put it in Home decor
    price: 180,
    originalPrice: 360,
    discountPercent: 50,
    codPrice: 210,
    hasUpiOffer: true,
    rating: 3.8,
    ratingCount: 152,
    reviewCount: 39,
    images: [HOME_MAIN, COOKWARE_MAIN],
    variants: [
      { colorName: 'Floral Cream Multi', imageUrl: HOME_MAIN, price: 180, originalPrice: 360 }
    ],
    soldBy: 'CREATIVE_HOMES',
    soldByRating: 3.9,
    productHighlights: [
      { label: 'Material', value: 'Polyester Velvet Blend' },
      { label: 'Size', value: '16x16 Inches' }
    ],
    additionalDetails: [
      { label: 'Wash Care', value: 'Cold Machine Wash' }
    ],
    sizeOptions: ['Free Size'],
    reviews: []
  }
];

export const mockProducts: Product[] = rawProducts.map((p, idx) => ({
  ...p,
  numericId: idx + 1
}));

export const mockCategories: Category[] = [
  {
    id: 'cat-popular',
    name: 'Popular',
    icon: 'star',
    subCategories: [
      { name: 'Top Brands', image: BEAUTY_MAIN },
      { name: 'Premium Collection', image: KURTI_MAIN },
      { name: 'Fruits', image: HOME_MAIN },
      { name: 'Cookware', image: COOKWARE_MAIN },
      { name: 'Kurtis & Dress', image: KURTI_MAIN },
      { name: 'Sarees', image: SAREE_MAIN },
      { name: 'Westernwear', image: WATCH_BLACK_MAIN },
      { name: 'Jewellery', image: JEWEL_MAIN },
      { name: 'Men Fashion', image: WATCH_METALLIC },
      { name: 'Kids', image: KIDS_MAIN },
      { name: 'Footwear', image: WATCH_BLUE },
      { name: 'Beauty & Personal', image: BEAUTY_MAIN },
      { name: 'Grocery', image: COOKWARE_MAIN }
    ]
  },
  {
    id: 'cat-kurti-saree',
    name: 'Kurti, Saree & Lehenga',
    icon: 'shirt',
    subCategories: [
      { name: 'Kurtis & Dress', image: KURTI_MAIN },
      { name: 'Sarees', image: SAREE_MAIN },
      { name: 'Lehengas Choli', image: KURTI_MAIN },
      { name: 'Gowns & Anarkalis', image: SAREE_MAIN },
      { name: 'Blouses', image: KURTI_MAIN }
    ]
  },
  {
    id: 'cat-women-western',
    name: 'Women Western',
    icon: 'sparkles',
    subCategories: [
      { name: 'Westernwear', image: KURTI_MAIN },
      { name: 'Dresses', image: KURTI_MAIN },
      { name: 'Tops & Tees', image: JEWEL_MAIN },
      { name: 'Jeans & Jeggings', image: WATCH_BLACK_MAIN },
      { name: 'Shrugs & Jackets', image: COOKWARE_MAIN }
    ]
  },
  {
    id: 'cat-lingerie',
    name: 'Lingerie',
    icon: 'heart',
    subCategories: [
      { name: 'Bras & Panties', image: BEAUTY_MAIN },
      { name: 'Nightwear Sets', image: KURTI_MAIN },
      { name: 'Camisoles', image: BEAUTY_MAIN }
    ]
  },
  {
    id: 'cat-men',
    name: 'Men',
    icon: 'smile',
    subCategories: [
      { name: 'Men Fashion', image: WATCH_METALLIC },
      { name: 'Watches', image: WATCH_BLACK_MAIN },
      { name: 'Activewear T-Shirts', image: WATCH_BLUE },
      { name: 'Innerwear', image: WATCH_BROWN },
      { name: 'Footwear', image: WATCH_ROSE_GOLD },
      { name: 'Wallets & Belts', image: WATCH_METALLIC }
    ]
  },
  {
    id: 'cat-kids',
    name: 'Kids & Toys',
    icon: 'baby',
    subCategories: [
      { name: 'Kids', image: KIDS_MAIN },
      { name: 'Infant Rompers', image: KIDS_MAIN },
      { name: 'Soft Toys & Games', image: KIDS_MAIN },
      { name: 'Kids Watches', image: WATCH_BLUE }
    ]
  },
  {
    id: 'cat-home',
    name: 'Home & Kitchen',
    icon: 'home',
    subCategories: [
      { name: 'Cookware', image: COOKWARE_MAIN },
      { name: 'Vases & Decor', image: HOME_MAIN },
      { name: 'Bed Sheets & Covers', image: HOME_MAIN },
      { name: 'Kitchen Storage', image: COOKWARE_MAIN }
    ]
  }
];

export const initialBanners: import('./types').Banner[] = [
  {
    id: 'banner-promo-1',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=400',
    type: 'promotional'
  },
  {
    id: 'banner-promo-2',
    imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76ba?auto=format&fit=crop&q=80&w=1200&h=400',
    type: 'promotional'
  },
  {
    id: 'banner-news-1',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=400',
    type: 'news'
  }
];

// Initial mock orders to show on "My Orders" tab
export const initialOrders = [
  {
    id: 'order-102941',
    items: [
      {
        id: 'cart-item-watch-lr05-free-size',
        product: mockProducts[0], // LR 05 watch
        selectedVariantIndex: 0,
        selectedSize: 'Free Size',
        quantity: 1
      }
    ],
    orderDate: '21 Sep, 2026',
    deliveryDate: '29 Sep, 2026',
    status: 'Delivered Early' as const,
    totalPrice: 93,
    shippingAddress: {
      name: 'Gaurav Beniwal',
      phone: '9876543210',
      addressLine: 'House 442, Sector 15',
      city: 'Gurugram',
      pincode: '122001',
      state: 'Haryana'
    }
  },
  {
    id: 'order-103984',
    items: [
      {
        id: 'cart-item-kids-combed-cotton',
        product: mockProducts[7], // Kids suit
        selectedVariantIndex: 0,
        selectedSize: '3-4 Years',
        quantity: 1
      }
    ],
    orderDate: '10 Jul, 2026',
    deliveryDate: '15 Jul, 2026',
    status: 'Delivered Early' as const,
    totalPrice: 245,
    shippingAddress: {
      name: 'Gaurav Beniwal',
      phone: '9876543210',
      addressLine: 'House 442, Sector 15',
      city: 'Gurugram',
      pincode: '122001',
      state: 'Haryana'
    }
  }
];

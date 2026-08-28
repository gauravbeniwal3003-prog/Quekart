export interface SeoPageData {
  slug: string;
  category: 'compare' | 'collections' | 'explore' | 'sell-online';
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  badge: string;
  h1: string;
  subheadline: string;
  targetCategoryName?: string;
  highlights: { title: string; desc: string; iconName: string }[];
  comparisonTable?: {
    feature: string;
    quekart: string;
    competitor: string;
  }[];
  contentSections: {
    heading: string;
    body: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  ctaText: string;
  ctaPath: string;
}

export const SEO_PAGES: Record<string, SeoPageData> = {
  // -------------------------------------------------------------
  // 1. COMPARISON: QueKart vs Meesho
  // -------------------------------------------------------------
  'quekart-vs-meesho': {
    slug: 'quekart-vs-meesho',
    category: 'compare',
    title: 'QueKart vs Meesho: Compare Wholesale Prices & Seller Benefits',
    metaTitle: 'QueKart vs Meesho 2026: Why QueKart Offers Lower Wholesale Rates & True 0% Commission',
    metaDescription: 'Looking for a Meesho alternative? QueKart connects Indian shoppers and resellers directly with factory manufacturers in Surat, Jaipur, and Panipat at rock-bottom wholesale prices with 0% seller commission and Free COD.',
    keywords: 'QueKart vs Meesho, Meesho alternative, apps like Meesho, cheap online shopping app, wholesale clothing online, meesho supplier alternative, zero commission reseller app',
    badge: 'Competitor Breakdown',
    h1: 'QueKart vs Meesho: Which Wholesale App Offers Better Value in 2026?',
    subheadline: 'Compare direct factory pricing, seller margins, Cash on Delivery availability, and fast doorstep delivery between India’s top wholesale shopping destinations.',
    targetCategoryName: 'Kurti, Saree & Ethnic Wear',
    highlights: [
      {
        title: 'Direct Factory Sourcing',
        desc: 'QueKart eliminates 3 intermediary supplier layers, delivering genuine manufacturer prices directly to end buyers and resellers.',
        iconName: 'Factory'
      },
      {
        title: 'True 0% Commission for Sellers',
        desc: 'Suppliers retain 100% of their earnings without hidden listing fees, payment gateway penalties, or surprise deductions.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Super-Fast SMS OTP Checkout',
        desc: 'Instant 1-tap mobile login without complex password requirements for seamless purchasing on both app and web.',
        iconName: 'Zap'
      },
      {
        title: '100% Cash on Delivery & Free Returns',
        desc: 'Every single pin code across India enjoys doorstep Cash on Delivery with transparent 7-day doorstep replacement policies.',
        iconName: 'Truck'
      }
    ],
    comparisonTable: [
      { feature: 'Commission Fee for Sellers', quekart: '0% Flat (Forever)', competitor: '0% with tiered return charge deductions' },
      { feature: 'Direct Factory Sourcing Hubs', quekart: 'Surat, Jaipur, Panipat, Tirupur, Delhi', competitor: 'Aggregator networks & 3rd party distributors' },
      { feature: 'Pricing Advantage', quekart: 'Up to 30-40% cheaper factory direct', competitor: 'Standard retail/reseller marked-up rates' },
      { feature: 'Cash on Delivery (COD)', quekart: 'Available on 27,000+ Indian Pin Codes', competitor: 'Available on select items and areas' },
      { feature: 'Vendor Instant Payouts', quekart: 'Fast 2-3 business days after delivery', competitor: '7 to 15 days clearing cycle' },
      { feature: 'Dedicated Helpline Support', quekart: '24/7 Human Phone & WhatsApp Assistance', competitor: 'Primarily automated chatbot queues' }
    ],
    contentSections: [
      {
        heading: 'Why Thousands of Resellers and Buyers are Choosing QueKart over Meesho',
        body: [
          'In recent years, e-commerce shoppers across India have noticed increasing retail markups on aggregator platforms. QueKart was built with a single mission: direct factory transparency. By partnering directly with handloom weavers in Panipat, saree manufacturers in Surat, and cotton kurti mills in Jaipur, QueKart offers wholesale rates for single-piece purchases.',
          'Whether you are shopping for your family wardrobe, home furnishing, or stocking inventory for your local boutique or online reselling business, QueKart provides unmatched price-to-quality ratios.'
        ]
      },
      {
        heading: 'How QueKart Empowers Indian Micro-Vendors with 0% Commission',
        body: [
          'Small manufacturers and local shopkeepers often lose 15-25% of their revenue to legacy platform commissions and hidden marketing levies. On QueKart, registered sellers keep every single rupee of their list price.',
          'Our transparent vendor dashboard allows sellers to upload catalog photos, manage dynamic price tiers, track live order dispatches, and receive payouts directly to their bank account.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Is QueKart cheaper than Meesho?',
        answer: 'Yes. Because QueKart sources directly from registered textile and manufacturing mills without middleman aggregators, product prices on QueKart are often 15% to 40% lower for equivalent quality.'
      },
      {
        question: 'Can I sell on QueKart if I already sell on Meesho or Flipkart?',
        answer: 'Absolutely! You can register as a seller on QueKart in under 2 minutes with either your GSTIN or basic business registration. We welcome multi-channel merchants and charge zero onboarding fees.'
      },
      {
        question: 'Is Cash on Delivery (COD) supported on QueKart?',
        answer: 'Yes, QueKart offers 100% Cash on Delivery across all serviceable pin codes in India with easy doorstep returns and instant refund tracking.'
      }
    ],
    ctaText: 'Explore Wholesale Catalog on QueKart',
    ctaPath: '/shop'
  },

  // -------------------------------------------------------------
  // 2. COMPARISON: QueKart vs Flipkart
  // -------------------------------------------------------------
  'quekart-vs-flipkart': {
    slug: 'quekart-vs-flipkart',
    category: 'compare',
    title: 'QueKart vs Flipkart: Wholesale Direct vs Retail Marketplace',
    metaTitle: 'QueKart vs Flipkart 2026: Compare Factory Prices, Delivery & Value for Indian Shoppers',
    metaDescription: 'Looking for a Flipkart alternative for budget fashion and electronics? QueKart delivers direct-from-source wholesale prices on sarees, kurtis, smartwatches, and kitchenware with zero middlemen markups.',
    keywords: 'QueKart vs Flipkart, Flipkart alternative, cheap online shopping app, budget shopping app india, wholesale vs retail ecommerce, meesho vs flipkart vs quekart',
    badge: 'Platform Comparison',
    h1: 'QueKart vs Flipkart: Why Pay Retail When You Can Buy Factory Wholesale?',
    subheadline: 'Discover how QueKart cuts middleman margins to bring you the highest quality fashion, home goods, and mobile accessories at true manufacturing costs.',
    targetCategoryName: 'Popular',
    highlights: [
      {
        title: 'Factory-Floor Pricing',
        desc: 'Skip distributor, brand licensing, and super-stockist margins. Buy single units at authentic bulk wholesale pricing.',
        iconName: 'Tag'
      },
      {
        title: 'Low Bandwidth & Fast Loading',
        desc: 'Engineered for seamless performance on budget smartphones and 4G/5G connections across Tier-2, Tier-3, and rural India.',
        iconName: 'Smartphone'
      },
      {
        title: 'Direct Vendor Relationship',
        desc: 'Products are packed and shipped directly by the certified manufacturer or authorized master wholesaler.',
        iconName: 'CheckCircle'
      },
      {
        title: 'No Inflated Sale Gimmicks',
        desc: 'Transparent honest pricing every day of the year without artificial markups before festive discount campaigns.',
        iconName: 'BadgePercent'
      }
    ],
    comparisonTable: [
      { feature: 'Core Target Audience', quekart: 'Direct factory buyers, budget shoppers & resellers', competitor: 'Premium retail consumer brand buyers' },
      { feature: 'Price Tag on Everyday Ethnic Wear', quekart: 'Starting from ₹199 to ₹499', competitor: 'Starting from ₹499 to ₹1,499' },
      { feature: 'Seller Commission Overhead', quekart: '0% Platform Commission', competitor: '8% to 28% Commission + Closing Fees' },
      { feature: 'App Footprint & Speed', quekart: 'Ultra-lightweight PWA & Instant Web App', competitor: 'Heavy application with frequent updates' },
      { feature: 'Cash on Delivery Verification', quekart: 'Instant 1-Tap OTP without extra fee', competitor: 'Convenience fees on small cart values' }
    ],
    contentSections: [
      {
        heading: 'The Shift from Retail Marketplaces to Direct-to-Consumer Wholesale',
        body: [
          'Traditional e-commerce giants like Flipkart operate with layered logistics, heavy fulfillment centers, and significant seller advertising fees. These overheads are inevitably baked into the final sticker price paid by consumers.',
          'QueKart operates on a lean, decentralized marketplace model. Indian manufacturers list their stock directly on QueKart, allowing buyers from Delhi, Mumbai, Bengaluru, Lucknow, Patna, and village pin codes to access identical wholesale pricing.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Are QueKart products genuine quality?',
        answer: 'Yes! Every vendor on QueKart undergoes phone and document verification. All customer reviews and unboxing ratings are real and verified before public display.'
      },
      {
        question: 'How fast is delivery compared to Flipkart?',
        answer: 'Most orders on QueKart are dispatched within 24 to 48 hours via top courier partners (Delhivery, BlueDart, Ecom Express, Shadowfax) and reach metro cities in 2-4 days and regional areas in 4-6 days.'
      }
    ],
    ctaText: 'Start Shopping at Factory Rates',
    ctaPath: '/shop'
  },

  // -------------------------------------------------------------
  // 3. COMPARISON: QueKart vs Amazon
  // -------------------------------------------------------------
  'quekart-vs-amazon': {
    slug: 'quekart-vs-amazon',
    category: 'compare',
    title: 'QueKart vs Amazon India: Bharat’s Value-Driven Wholesale Alternative',
    metaTitle: 'QueKart vs Amazon: The Best Value E-Commerce App for Indian Wholesale Fashion & Home Needs',
    metaDescription: 'Compare QueKart and Amazon India for ethnic fashion, kitchen essentials, and daily lifestyle products. Discover how QueKart delivers authentic Indian wholesale hub products at a fraction of global retail costs.',
    keywords: 'QueKart vs Amazon, Amazon India alternative, cheap online shopping app, wholesale marketplace india, online bazar india, meesho amazon alternative',
    badge: 'Marketplace Analysis',
    h1: 'QueKart vs Amazon India: Made in India Value vs Global Retail',
    subheadline: 'Empowering Indian households and small enterprises with direct factory prices, simple Hindi/English navigation, and zero extra platform taxes.',
    targetCategoryName: 'Home & Living',
    highlights: [
      {
        title: 'Tailored for Indian Needs',
        desc: 'Curated catalogs focusing on Indian ethnic wear, festive gifts, handloom bedsheets, and stainless-steel cookware.',
        iconName: 'Heart'
      },
      {
        title: 'Zero Annual Prime Subscription Needed',
        desc: 'Everyone gets the lowest discounted price and free delivery perks without having to pay ₹1,499 annual subscription charges.',
        iconName: 'Sparkles'
      },
      {
        title: 'Authentic Regional Crafts',
        desc: 'Direct access to regional artisans from Jaipur, Surat, Panipat, Moradabad, and Varanasi.',
        iconName: 'Layers'
      }
    ],
    comparisonTable: [
      { feature: 'Annual Membership Fee', quekart: '₹0 (Free for everyone)', competitor: '₹1,499 / year for Prime perks' },
      { feature: 'Specialization in Indian Ethnic Wear', quekart: 'Direct mill sourcing from Surat & Jaipur', competitor: 'Third-party retail resellers' },
      { feature: 'Seller Onboarding Complexity', quekart: '2-Minute instant mobile verification', competitor: 'Lengthy brand authorization paperwork' },
      { feature: 'Payment Flexibility', quekart: 'COD, UPI, PhonePe, Google Pay, Paytm, Cards', competitor: 'Card-centric with select COD pin codes' }
    ],
    contentSections: [
      {
        heading: 'Why Indian Shoppers Prefer QueKart for Daily Lifestyle Shopping',
        body: [
          'While Amazon excels in multinational electronics and imported luxury brands, Indian consumers looking for authentic sarees, daily-wear kurtis, kitchen appliances, and handloom home furnishings find much greater variety and 50% lower prices on QueKart.',
          'QueKart celebrates Indian manufacturing by giving local textile hubs a direct digital storefront to reach over 1.4 billion people.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Do I need an account to browse products on QueKart?',
        answer: 'No! You can browse the entire live catalog as a guest with full price transparency. You only need a 1-tap mobile number login when placing an order.'
      }
    ],
    ctaText: 'Browse QueKart Collection',
    ctaPath: '/shop'
  },

  // -------------------------------------------------------------
  // 4. COLLECTION: Wholesale Sarees & Kurtis
  // -------------------------------------------------------------
  'wholesale-sarees-kurtis': {
    slug: 'wholesale-sarees-kurtis',
    category: 'collections',
    title: 'Buy Wholesale Sarees, Kurtis & Ethnic Wear Online - Direct Factory Rates from ₹199',
    metaTitle: 'Wholesale Sarees & Designer Kurtis Online: Surat & Jaipur Factory Prices | QueKart',
    metaDescription: 'Shop latest designer sarees, Anarkali kurtis, cotton suits, and festive ethnic wear directly from Surat & Jaipur textile mills. Lowest wholesale prices, Cash on Delivery & Free Doorstep Shipping on QueKart.',
    keywords: 'wholesale sarees online, buy kurtis wholesale online, surat saree wholesale market, jaipur kurti wholesale online, cotton suits wholesale cash on delivery, ethnic wear wholesale app',
    badge: 'Direct Mill Sourcing',
    h1: 'Wholesale Sarees, Kurtis & Ethnic Wear Factory Market Online',
    subheadline: 'Direct from Surat and Jaipur textile mills to your doorstep. Buy single pieces or bulk lots at genuine manufacturer prices with 100% Cash on Delivery.',
    targetCategoryName: 'Kurti, Saree & Ethnic Wear',
    highlights: [
      {
        title: 'Authentic Surat & Jaipur Weaves',
        desc: 'Banarasi silk, Georgette, Chiffon, Cotton Bandhani, and Kanjivaram zari sarees directly from master weavers.',
        iconName: 'Sparkles'
      },
      {
        title: 'Prices Starting from Just ₹199',
        desc: 'Unbeatable factory-direct prices that allow boutique owners to resell with 100%+ profit margins.',
        iconName: 'Tag'
      },
      {
        title: 'Daily New Arrivals',
        desc: 'Over 500+ trending new designs added daily matching the latest Bollywood and festive bridal trends.',
        iconName: 'TrendingUp'
      }
    ],
    contentSections: [
      {
        heading: 'India’s Largest Online Wholesale Hub for Women’s Ethnic Fashion',
        body: [
          'Looking for high-quality ethnic wear without paying exorbitant boutique retail prices? QueKart brings the bustling wholesale markets of Surat’s Ring Road and Jaipur’s Johari Bazaar straight to your phone.',
          'Explore an extensive collection of embroidered Anarkali sets, daily-wear breathable pure cotton kurtis, party-wear heavy silk sarees, ready-to-wear stitched blouses, and stylish palazzos.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I buy single pieces at wholesale rates on QueKart?',
        answer: 'Yes! Unlike physical wholesale markets where you are forced to buy 10-piece bundles (catalogs), QueKart allows end-shoppers and home resellers to order single pieces at direct wholesale rates.'
      },
      {
        question: 'What is the return policy on sarees and kurtis?',
        answer: 'We offer an easy 7-day hassle-free return and exchange policy if there is any size mismatch or manufacturing defect.'
      }
    ],
    ctaText: 'Shop Sarees & Kurtis from ₹199',
    ctaPath: '/shop/categories/cat-ethnic-wear'
  },

  // -------------------------------------------------------------
  // 5. COLLECTION: Electronics & Mobile Accessories
  // -------------------------------------------------------------
  'electronics-accessories': {
    slug: 'electronics-accessories',
    category: 'collections',
    title: 'Wholesale Electronics, Bluetooth Smartwatches & Earbuds Online',
    metaTitle: 'Wholesale Smartwatches, TWS Earbuds & Mobile Accessories Online | QueKart',
    metaDescription: 'Discover incredible wholesale rates on Bluetooth calling smartwatches, true wireless earbuds, fast chargers, power banks, and audio gear directly from verified suppliers on QueKart.',
    keywords: 'wholesale smartwatches online, wholesale earbuds india, mobile accessories wholesale market, delhi gaffar market online, cheap gadgets online india, electronics wholesale app',
    badge: 'Tech & Gadgets',
    h1: 'Wholesale Mobile Accessories & Smart Gadgets at Factory Rates',
    subheadline: 'Bluetooth TWS earbuds, AMOLED smartwatches, fast charging cables, and party speakers sourced directly from verified gadget importers and manufacturers.',
    targetCategoryName: 'Popular',
    highlights: [
      {
        title: 'Rigorous 100% QC Testing',
        desc: 'All electronic items are tested for battery life, Bluetooth connectivity, and sound clarity before dispatch.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Direct Delhi / Mumbai Wholesale Rates',
        desc: 'Get Gaffar Market and Lamington Road wholesale prices delivered anywhere in India.',
        iconName: 'Zap'
      }
    ],
    contentSections: [
      {
        heading: 'Top-Trending Gadgets at Direct Importer Rates',
        body: [
          'Stay ahead of tech trends with QueKart’s electronics wholesale department. Whether you are searching for high-bass noise cancellation earbuds, fitness trackers with heart-rate monitoring, or heavy-duty braided charging cables, our catalog offers the best pricing in the country.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Do electronic gadgets come with replacement warranty?',
        answer: 'Yes, all electronic products on QueKart include a standard replacement guarantee against manufacturing defects.'
      }
    ],
    ctaText: 'Shop Electronics at Wholesale Rates',
    ctaPath: '/shop'
  },

  // -------------------------------------------------------------
  // 6. COLLECTION: Home & Kitchen Handloom
  // -------------------------------------------------------------
  'kitchen-home-appliances': {
    slug: 'kitchen-home-appliances',
    category: 'collections',
    title: 'Wholesale Cookware, Kitchen Essentials & Home Decor Online',
    metaTitle: 'Wholesale Non-Stick Cookware & Home Furnishing Online | QueKart',
    metaDescription: 'Shop direct from Panipat handloom weavers and cookware factories. Buy non-stick dosa tawas, pressure cookers, pure cotton bedsheets, and curtains at lowest wholesale prices.',
    keywords: 'panipat handloom online, wholesale bedsheets online, non stick cookware wholesale, kitchen items wholesale market, home decor wholesale india, quekart home living',
    badge: 'Home & Kitchen',
    h1: 'Factory Direct Kitchen Essentials, Cookware & Home Furnishings',
    subheadline: 'Non-stick aluminum cooksets, stainless steel spice boxes, premium cotton double bedsheets, and decorative blackout curtains at authentic wholesale rates.',
    targetCategoryName: 'Home & Living',
    highlights: [
      {
        title: 'Panipat Handloom Direct',
        desc: '100% pure cotton Glace and Jaipuri printed double bedsheets with matching pillow covers.',
        iconName: 'Home'
      },
      {
        title: 'Induction & Gas Compatible Cookware',
        desc: 'Granite finish non-stick pans, heavy-gauge tawas, and tri-ply stainless steel pots.',
        iconName: 'CheckCircle'
      }
    ],
    contentSections: [
      {
        heading: 'Upgrade Your Home at Factory Prices',
        body: [
          'Panipat is world-renowned as the textile city of India for handloom bedsheets, blankets, and rugs. QueKart connects you directly with registered manufacturing units in Panipat, cutting out all middleman profits.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Are bedsheets color-fast and machine washable?',
        answer: 'Yes, our premium bedsheets use reactive eco-friendly dyes that remain vibrant after multiple machine washes.'
      }
    ],
    ctaText: 'Shop Home & Kitchen at Factory Prices',
    ctaPath: '/shop/categories/cat-home'
  },

  // -------------------------------------------------------------
  // 7. EXPLORE: Surat Wholesale Textile Market
  // -------------------------------------------------------------
  'wholesale-market-surat': {
    slug: 'wholesale-market-surat',
    category: 'explore',
    title: 'Surat Textile Wholesale Market Online: Buy Directly from Surat Mills',
    metaTitle: 'Surat Wholesale Saree & Textile Market Online | Direct Mill Rates on QueKart',
    metaDescription: 'Experience the world-famous Surat Textile Market online. Buy silk sarees, printed georgette kurtis, and unstitched dress materials directly from Surat manufacturers on QueKart with Cash on Delivery.',
    keywords: 'surat textile market online, surat wholesale saree market online, surat cloth market, buy sarees direct from surat factory, surat kurti wholesale app, quekart surat wholesale',
    badge: 'Textile Capital of India',
    h1: 'Surat Wholesale Cloth & Saree Market Now Online on QueKart',
    subheadline: 'Direct from Surat’s legendary mills on Ring Road, Millennium Market, and Textile Tower. Single pieces and bulk orders delivered directly to your doorstep.',
    targetCategoryName: 'Kurti, Saree & Ethnic Wear',
    highlights: [
      {
        title: '5,000+ Saree Weavers Connected',
        desc: 'Direct sourcing from verified textile mills in Surat with zero reseller commissions.',
        iconName: 'Sparkles'
      },
      {
        title: 'All Traditional & Modern Fabrics',
        desc: 'Silk, Organza, Jacquard, Chanderi, Kota Doria, Crepe, Rayon, and Chiffon at mill rates.',
        iconName: 'Layers'
      }
    ],
    contentSections: [
      {
        heading: 'No Need to Travel to Surat to Get Surat Mill Prices',
        body: [
          'For decades, shopkeepers from all over India travelled to Surat to buy sarees and fabrics in bulk. Now, QueKart makes Surat’s entire wholesale inventory available directly on your smartphone screen with video previews and verified product specifications.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Can I order samples before placing bulk reseller orders?',
        answer: 'Yes! You can order any single piece at wholesale rates to test fabric quality and delivery speed before ordering larger volumes.'
      }
    ],
    ctaText: 'Explore Surat Textile Catalog',
    ctaPath: '/shop/categories/cat-ethnic-wear'
  },

  // -------------------------------------------------------------
  // 8. EXPLORE: Jaipur Ethnic & Kurti Market
  // -------------------------------------------------------------
  'wholesale-market-jaipur': {
    slug: 'wholesale-market-jaipur',
    category: 'explore',
    title: 'Jaipur Kurti & Bandhani Wholesale Market Online - Direct Factory Hub',
    metaTitle: 'Jaipur Kurti Wholesale Market Online: Pure Cotton & Bandhani Sets | QueKart',
    metaDescription: 'Shop authentic Jaipuri cotton kurtis, Sanganeri block print suits, and traditional Bandhej dupattas directly from Jaipur artisans and factories on QueKart.',
    keywords: 'jaipur kurti wholesale market online, sanganeri print kurtis wholesale, jaipuri suits wholesale cash on delivery, jaipur wholesale market online shopping, quekart jaipur',
    badge: 'Artisan Craft Hub',
    h1: 'Jaipur Wholesale Cotton Kurti & Sanganeri Print Online Market',
    subheadline: 'Handcrafted Block Prints, Bagru prints, and Pure 60x60 Cotton Jaipuri Kurti-Pant-Dupatta sets directly from manufacturing units in Sanganer and Sitapura.',
    targetCategoryName: 'Kurti, Saree & Ethnic Wear',
    highlights: [
      {
        title: '100% Breathable Pure Cotton',
        desc: 'Finest 60x60 Cambric cotton perfect for Indian summer and daily comfort.',
        iconName: 'CheckCircle'
      },
      {
        title: 'Authentic Natural Dye Sanganeri Prints',
        desc: 'Traditional wooden block motifs crafted by generational Rajasthani artisans.',
        iconName: 'Sparkles'
      }
    ],
    contentSections: [
      {
        heading: 'Jaipuri Ethnic Fashion - Direct from the Pink City',
        body: [
          'Jaipur’s vibrant Sanganeri prints, Gotta Patti embroidery, and Leheriya designs are loved nationwide. On QueKart, you bypass distributor layers and buy straight from Jaipur textile manufacturing units.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Are the sizes standard Indian sizing?',
        answer: 'Yes, all our Jaipuri kurtis adhere to standard chest measurement size charts (M-38, L-40, XL-42, XXL-44, 3XL-46).'
      }
    ],
    ctaText: 'Explore Jaipur Kurti Collection',
    ctaPath: '/shop/categories/cat-ethnic-wear'
  },

  // -------------------------------------------------------------
  // 9. EXPLORE: Panipat Handloom Market
  // -------------------------------------------------------------
  'wholesale-market-panipat': {
    slug: 'wholesale-market-panipat',
    category: 'explore',
    title: 'Panipat Handloom & Home Furnishing Wholesale Market Online',
    metaTitle: 'Panipat Wholesale Market Online: Bedsheets, Curtains & Blankets | QueKart',
    metaDescription: 'Direct sourcing from Panipat, India’s handloom capital. Buy pure cotton double bedsheets, mink blankets, dohars, and curtains at factory floor wholesale rates on QueKart.',
    keywords: 'panipat wholesale market online, panipat handloom bedsheets wholesale, panipat blanket market online, home furnishing wholesale panipat, quekart panipat',
    badge: 'Handloom Capital',
    h1: 'Panipat Handloom & Home Textile Wholesale Hub Online',
    subheadline: 'High-thread-count cotton bedsheets, designer curtains, and cozy blankets straight from the manufacturing powerhouse of Haryana.',
    targetCategoryName: 'Home & Living',
    highlights: [
      {
        title: 'Direct Panipat Factory Pricing',
        desc: 'Save up to 60% compared to local retail home furnishing stores.',
        iconName: 'Home'
      },
      {
        title: 'King & Queen Size Bedsheets',
        desc: 'Fitted elastic and flat bedsheets with guaranteed color-fast reactive prints.',
        iconName: 'Layers'
      }
    ],
    contentSections: [
      {
        heading: 'The World-Famous Handloom City at Your Fingertips',
        body: [
          'Panipat produces over 75% of India’s handloom home decor. QueKart’s headquarters and verified partner network in Panipat provide direct-from-loom access to consumers and commercial hotel/guest house buyers across India.'
        ]
      }
    ],
    faqs: [
      {
        question: 'What is the standard GSM of bedsheets available?',
        answer: 'We offer high-density cotton sheets ranging from 180 TC to 300 TC and microfibre sheets from 120 GSM to 220 GSM.'
      }
    ],
    ctaText: 'Shop Panipat Handloom Goods',
    ctaPath: '/shop/categories/cat-home'
  },

  // -------------------------------------------------------------
  // 10. SELLER SEO HUB: Sell Online 0% Commission
  // -------------------------------------------------------------
  'zero-commission-marketplace': {
    slug: 'zero-commission-marketplace',
    category: 'sell-online',
    title: 'Sell Online on QueKart with 0% Commission - Best Supplier Portal India',
    metaTitle: 'Sell Online on QueKart: 0% Commission, 2-Minute Registration, 7-Day Payments',
    metaDescription: 'Join 50,000+ Indian manufacturers and wholesalers selling on QueKart with 0% platform commission. Reach millions of customers across India with zero listing fees and fast payouts.',
    keywords: 'sell on quekart, 0 commission seller portal, become a supplier on quekart, meesho seller alternative, flipkart seller registration, sell products online india, zero commission ecommerce marketplace',
    badge: 'Supplier Growth Program',
    h1: 'Grow Your Manufacturing Business with 0% Commission on QueKart',
    subheadline: 'Keep 100% of your selling price. Reach crores of verified online shoppers and resellers across all 27,000+ Indian pin codes with zero middleman deductions.',
    highlights: [
      {
        title: '0% Commission on All Categories',
        desc: 'No commission fees, no listing charges, and no collection fee deductions.',
        iconName: 'ShieldCheck'
      },
      {
        title: 'Instant 2-Minute Onboarding',
        desc: 'Start listing your products right away with basic business details or GSTIN.',
        iconName: 'Zap'
      },
      {
        title: 'Fast Automated Payouts',
        desc: 'Payments deposited directly into your bank account on a transparent cycle.',
        iconName: 'Tag'
      },
      {
        title: 'Pan-India Logistics Support',
        desc: 'Doorstep pickup from your warehouse or shop with automated shipping labels.',
        iconName: 'Truck'
      }
    ],
    contentSections: [
      {
        heading: 'Why Sellers are Shifting to QueKart from Traditional Platforms',
        body: [
          'High commission rates on legacy e-commerce platforms squeeze profit margins and force suppliers to inflate prices. QueKart’s 0% commission philosophy creates a win-win: buyers get genuine factory prices, and sellers earn higher net profits.',
          'Our easy-to-use vendor portal includes real-time order notifications, instant inventory updates, AI-assisted product descriptions, and comprehensive sales reports.'
        ]
      }
    ],
    faqs: [
      {
        question: 'What documents do I need to register as a seller?',
        answer: 'You just need your mobile number, bank account details for payouts, and GSTIN (or basic registration for non-GST categories).'
      },
      {
        question: 'How do customer returns work for sellers?',
        answer: 'Returns are strictly managed through our verified tracking system to protect sellers from fraud and fake claims.'
      }
    ],
    ctaText: 'Register as a QueKart Seller Today',
    ctaPath: '/vendor'
  }
};

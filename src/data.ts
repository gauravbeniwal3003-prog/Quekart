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
    name: 'Kurti, Saree & Ethnic Wear',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-women-western',
    name: 'Women Western',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-men',
    name: 'Men Fashion',
    icon: 'user',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-jewellery',
    name: 'Jewellery & Accessories',
    icon: 'gem',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-kids',
    name: 'Kids & Toys',
    icon: 'baby',
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    icon: 'home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'cat-footwear',
    name: 'Footwear & Bags',
    icon: 'shopping-bag',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300'
  }
];

// 3 Promotional Raksha Bandhan Banners
export const initialBanners: Banner[] = [
  {
    id: 'banner-rakhi-1',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&crop=entropy&w=1280&h=400&q=80',
    type: 'promotional',
    title: 'RAKSHA BANDHAN MAHOTSAV',
    subtitle: 'Up to 80% OFF on Designer Sarees, Kurtis & Festive Gift Sets',
    code: 'RAKHI80',
    targetCategory: 'Kurti, Saree & Ethnic Wear',
    row: 'main',
    order: 1
  },
  {
    id: 'banner-rakhi-2',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&crop=entropy&w=880&h=400&q=80',
    type: 'promotional',
    title: 'BHAI-BEHEN SPECIAL GIFT HAMPER',
    subtitle: 'Flat ₹100 Instant Discount on Royal Kundan & Gold Jewellery',
    code: 'FESTIVE100',
    targetCategory: 'Jewellery & Accessories',
    row: 'double',
    order: 1
  },
  {
    id: 'banner-rakhi-3',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&crop=entropy&w=880&h=400&q=80',
    type: 'promotional',
    title: 'ROYAL ETHNIC RAKHI COLLECTION',
    subtitle: 'Buy 2 Get 1 FREE on All Festive Apparel & Sherwanis',
    code: 'BUY2GET1',
    targetCategory: 'Men Fashion',
    row: 'double',
    order: 2
  }
];

// Production catalog of verified marketplace products (starts empty)
export const mockProducts: Product[] = [];

// Production start: Orders populated on customer checkout
export const initialOrders: any[] = [];

export const mockCategoryFilters: CategoryFilter[] = [
  {
    id: 'filter-fashion',
    name: 'Fashion & Clothing',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=150',
    categoryIds: ['cat-ethnic-wear', 'cat-women-western', 'cat-men', 'cat-footwear']
  },
  {
    id: 'filter-popular',
    name: 'Popular',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150',
    categoryIds: ['cat-popular']
  },
  {
    id: 'filter-electronics',
    name: 'Electronics & Gadgets',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=150',
    categoryIds: []
  },
  {
    id: 'filter-ethnic',
    name: 'Kurti, Saree & Ethnic Wear',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=150',
    categoryIds: ['cat-ethnic-wear']
  }
];



import { Product, Category, Banner } from './types';

// Core category definitions matching logo color theme (#143C6B Navy Blue & #FF8C00 Saffron Gold)
export const mockCategories: Category[] = [
  {
    id: 'cat-popular',
    name: 'Popular',
    icon: 'star',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Top Brands', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300' },
      { name: 'Festive Specials', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
      { name: 'Rakhi Collections', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300' },
      { name: 'Premium Collection', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-ethnic-wear',
    name: 'Kurti, Saree & Ethnic Wear',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Designer Kurtis', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300' },
      { name: 'Silk & Banarasi Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
      { name: 'Lehengas & Anarkalis', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300' },
      { name: 'Suits & Dress Material', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Dupattas & Shawls', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-women-western',
    name: 'Women Western',
    icon: 'sparkles',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Western Dresses', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300' },
      { name: 'Tops & Tunics', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300' },
      { name: 'Jeans & Jeggings', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=300' },
      { name: 'Party Wear', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-men',
    name: 'Men Fashion',
    icon: 'user',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Royal Kurta Sets', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=300' },
      { name: 'Festive Sherwanis', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&q=80&w=300' },
      { name: 'Casual Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=300' },
      { name: 'Formal Trousers', image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-jewellery',
    name: 'Jewellery & Accessories',
    icon: 'gem',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Kundan & Gold Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=300' },
      { name: 'Royal Bangles & Kadas', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=300' },
      { name: 'Earrings & Jhumkas', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=300' },
      { name: 'Clutches & Handbags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-kids',
    name: 'Kids & Toys',
    icon: 'baby',
    image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Boys Festive Wear', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=300' },
      { name: 'Girls Lehengas', image: 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&q=80&w=300' },
      { name: 'Toys & Games', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-home',
    name: 'Home & Living',
    icon: 'home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Royal Bedding & Cushions', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300' },
      { name: 'Festive Home Decors', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=300' },
      { name: 'Kitchenware & Dining', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=300' }
    ]
  },
  {
    id: 'cat-footwear',
    name: 'Footwear & Bags',
    icon: 'shopping-bag',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300',
    subCategories: [
      { name: 'Mojaris & Ethnic Juttis', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=300' },
      { name: 'Ethnic Heels & Wedges', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=300' },
      { name: 'Handbags & Sling Bags', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=300' }
    ]
  }
];

// 3 Promotional Raksha Bandhan Banners
export const initialBanners: Banner[] = [
  {
    id: 'banner-rakhi-1',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
    type: 'promotional',
    title: 'RAKSHA BANDHAN MAHOTSAV',
    subtitle: 'Up to 80% OFF on Designer Sarees, Kurtis & Festive Gift Sets',
    code: 'RAKHI80',
    targetCategory: 'Kurti, Saree & Ethnic Wear'
  },
  {
    id: 'banner-rakhi-2',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200',
    type: 'promotional',
    title: 'BHAI-BEHEN SPECIAL GIFT HAMPER',
    subtitle: 'Flat ₹100 Instant Discount on Royal Kundan & Gold Jewellery',
    code: 'FESTIVE100',
    targetCategory: 'Jewellery & Accessories'
  },
  {
    id: 'banner-rakhi-3',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200',
    type: 'promotional',
    title: 'ROYAL ETHNIC RAKHI COLLECTION',
    subtitle: 'Buy 2 Get 1 FREE on All Festive Apparel & Sherwanis',
    code: 'BUY2GET1',
    targetCategory: 'Men Fashion'
  }
];

// Production catalog of verified marketplace products (starts empty)
export const mockProducts: Product[] = [];

// Production start: Orders populated on customer checkout
export const initialOrders: any[] = [];



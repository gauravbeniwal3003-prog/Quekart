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

// Aesthetic marketplace promo banners (No products referenced)
export const initialBanners: Banner[] = [
  {
    id: 'banner-promo-1',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=400',
    type: 'promotional'
  },
  {
    id: 'banner-promo-2',
    imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76ba?auto=format&fit=crop&q=80&w=1200&h=400',
    type: 'promotional'
  }
];

// Production start: No demo products! All items are empty and loaded from live live database
export const mockProducts: Product[] = [];

// Production start: No demo orders! Orders are empty and registered dynamically by authenticated users
export const initialOrders: any[] = [];

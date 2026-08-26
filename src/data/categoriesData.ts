export interface MasterCategory {
  id: string;
  name: string;
  group: string;
  iconName: string;
}

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'women-ethnic',
    name: 'Women Ethnic Wear',
    group: 'Apparel & Clothing',
    iconName: 'Sparkles'
  },
  {
    id: 'women-western',
    name: 'Women Western Wear',
    group: 'Apparel & Clothing',
    iconName: 'Shirt'
  },
  {
    id: 'men-ethnic',
    name: 'Men Ethnic Wear',
    group: 'Apparel & Clothing',
    iconName: 'Crown'
  },
  {
    id: 'men-western',
    name: 'Men Western & Casuals',
    group: 'Apparel & Clothing',
    iconName: 'User'
  },
  {
    id: 'kids-baby',
    name: 'Kids & Baby Wear',
    group: 'Kids & Toys',
    iconName: 'Baby'
  },
  {
    id: 'footwear',
    name: 'Footwear & Shoes',
    group: 'Footwear',
    iconName: 'ShoppingBag'
  },
  {
    id: 'jewellery',
    name: 'Jewellery & Ornaments',
    group: 'Jewellery',
    iconName: 'Gem'
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    group: 'Beauty',
    iconName: 'Sparkles'
  },
  {
    id: 'bags-wallets',
    name: 'Bags & Luggage',
    group: 'Accessories',
    iconName: 'Briefcase'
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen Decor',
    group: 'Home & Living',
    iconName: 'Home'
  },
  {
    id: 'electronics',
    name: 'Electronics & Mobiles',
    group: 'Electronics',
    iconName: 'Smartphone'
  },
  {
    id: 'watches-wearables',
    name: 'Watches & Smartbands',
    group: 'Accessories',
    iconName: 'Watch'
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Active Gym',
    group: 'Sports',
    iconName: 'Dumbbell'
  },
  {
    id: 'toys-babycare',
    name: 'Toys, Games & Baby Care',
    group: 'Kids & Toys',
    iconName: 'Gamepad2'
  },
  {
    id: 'books-stationery',
    name: 'Books & Office Supplies',
    group: 'Books',
    iconName: 'BookOpen'
  },
  {
    id: 'grocery-gourmet',
    name: 'Grocery & Gourmet Food',
    group: 'Essentials',
    iconName: 'Utensils'
  },
  {
    id: 'automotive',
    name: 'Automotive Accessories',
    group: 'Automotive',
    iconName: 'Car'
  }
];

// Helper to get all category names
export const ALL_CATEGORY_NAMES = MASTER_CATEGORIES.map(c => c.name);

// Helper compatibility shim returning empty array (since subcategories have been removed)
export const getSubcategoriesForCategory = (_categoryName: string): string[] => {
  return [];
};

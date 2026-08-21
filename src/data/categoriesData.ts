export interface MasterCategory {
  id: string;
  name: string;
  group: string;
  iconName: string;
  subCategories: string[];
}

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'women-ethnic',
    name: 'Women Ethnic Wear',
    group: 'Apparel & Clothing',
    iconName: 'Sparkles',
    subCategories: [
      'Banarasi Sarees',
      'Cotton & Linen Sarees',
      'Silk & Chanderi Sarees',
      'Georgette & Chiffon Sarees',
      'Designer Kanjeevaram Sarees',
      'Embroidered Salwar Suits',
      'Kurtis & Anarkalis',
      'Kurti Sets & Palazzos',
      'Bridal Lehenga Cholis',
      'Partywear Gowns',
      'Dupattas & Stoles',
      'Blouses & Petticoats',
      'Dress Materials & Unstitched Fabrics'
    ]
  },
  {
    id: 'women-western',
    name: 'Women Western Wear',
    group: 'Apparel & Clothing',
    iconName: 'Shirt',
    subCategories: [
      'Dresses & Jumpsuits',
      'Tops & Tunics',
      'T-Shirts & Crop Tops',
      'Jeans & Jeggings',
      'Trousers & Chinos',
      'Skirts & Shorts',
      'Jackets & Shrugs',
      'Co-ord Sets',
      'Nightwear & Loungewear',
      'Activewear & Tights'
    ]
  },
  {
    id: 'men-ethnic',
    name: 'Men Ethnic Wear',
    group: 'Apparel & Clothing',
    iconName: 'Crown',
    subCategories: [
      'Kurtas & Kurta Pyjama Sets',
      'Nehru Jackets & Waistcoats',
      'Sherwanis & Indo-Western',
      'Dhotis & Mundus',
      'Traditional Shawls & Turbans',
      'Pathani Suits'
    ]
  },
  {
    id: 'men-western',
    name: 'Men Western & Casuals',
    group: 'Apparel & Clothing',
    iconName: 'User',
    subCategories: [
      'Casual Shirts',
      'Formal Office Shirts',
      'T-Shirts & Polos',
      'Jeans & Denim',
      'Formal Trousers & Chinos',
      'Track Pants & Joggers',
      'Hoodies & Sweatshirts',
      'Blazers & Suits',
      'Innerwear & Vests',
      'Nightwear & Boxers'
    ]
  },
  {
    id: 'kids-baby',
    name: 'Kids & Baby Wear',
    group: 'Kids & Toys',
    iconName: 'Baby',
    subCategories: [
      'Baby Boys Clothing',
      'Baby Girls Clothing',
      'Infant Rompers & Sets',
      'Kids Ethnic Wear',
      'Party Frocks & Dresses',
      'Kids Toys & Games',
      'School Bags & Stationery',
      'Baby Bedding & Blankets'
    ]
  },
  {
    id: 'footwear',
    name: 'Footwear & Shoes',
    group: 'Footwear',
    iconName: 'Footprints',
    subCategories: [
      'Men Casual Sneakers',
      'Men Formal Leather Shoes',
      'Men Slippers & Flip Flops',
      'Traditional Mojaris & Juttis',
      'Ethnic Kolhapuris',
      'Women Flats & Ballerinas',
      'Women Heels & Wedges',
      'Women Casual Shoes',
      'Sports & Running Shoes',
      'Kids Sandals & Shoes'
    ]
  },
  {
    id: 'jewellery',
    name: 'Fashion Jewellery & Accessories',
    group: 'Jewellery & Watches',
    iconName: 'Gem',
    subCategories: [
      'Necklaces & Chokers',
      'Earrings & Jhumkas',
      'Bangles, Kadas & Bracelets',
      'Bridal Jewellery Sets',
      'Mangalsutras & Pendants',
      'Anklets & Toe Rings',
      'Nose Pins & Rings',
      'Men Chains & Rings',
      'Hair Accessories & Pins',
      'Oxidised Silver Jewellery'
    ]
  },
  {
    id: 'bags-luggage',
    name: 'Handbags, Wallets & Luggage',
    group: 'Bags & Accessories',
    iconName: 'ShoppingBag',
    subCategories: [
      'Women Handbags & Totes',
      'Sling Bags & Crossbody',
      'Bridal Clutches & Potlis',
      'Backpacks & Laptop Bags',
      'Men Leather Wallets & Belts',
      'Trolley Suitcases & Luggage',
      'Duffel & Gym Bags'
    ]
  },
  {
    id: 'watches-eyewear',
    name: 'Watches & Eyewear',
    group: 'Accessories',
    iconName: 'Watch',
    subCategories: [
      'Men Analog & Chronograph Watches',
      'Women Designer Watches',
      'Smartwatches & Fitness Bands',
      'Couple Watches Gift Sets',
      'Sunglasses (UV & Polarized)',
      'Spectacle Frames'
    ]
  },
  {
    id: 'beauty-cosmetics',
    name: 'Beauty, Skincare & Cosmetics',
    group: 'Personal Care',
    iconName: 'Heart',
    subCategories: [
      'Lipsticks & Lip Gloss',
      'Eye Makeup, Kajal & Mascara',
      'Foundation & Face Powders',
      'Skincare, Serums & Creams',
      'Haircare, Shampoos & Hair Oils',
      'Traditional Henna & Mehendi',
      'Attars & Premium Perfumes',
      'Herbal & Ayurvedic Cosmetics',
      'Bath, Body Wash & Soaps'
    ]
  },
  {
    id: 'home-kitchen',
    name: 'Home, Decor & Kitchen',
    group: 'Home Living',
    iconName: 'Home',
    subCategories: [
      'Bed Sheets & Pillow Covers',
      'Curtains & Blinds',
      'Blankets & Comforters',
      'Cushion Covers & Rugs',
      'Cookware & Non-stick Pans',
      'Kitchen Utensils & Knives',
      'Dinner Sets & Crockery',
      'Storage Containers & Jars',
      'Home Cleaning & Organization'
    ]
  },
  {
    id: 'handicrafts-pooja',
    name: 'Handicrafts, Decor & Pooja',
    group: 'Crafts & Culture',
    iconName: 'Flame',
    subCategories: [
      'Brass & Metal Idols / Murtis',
      'Traditional Diyas & Urli Bowls',
      'Incense Sticks, Agarbatti & Dhoop',
      'Wall Hangings & Paintings',
      'Handcrafted Wooden Art',
      'Torans, Bandhanwars & Rangolis',
      'Pooja Thalis & Essentials'
    ]
  },
  {
    id: 'electronics-gadgets',
    name: 'Consumer Electronics & Gadgets',
    group: 'Electronics',
    iconName: 'Smartphone',
    subCategories: [
      'Mobile Covers & Screen Protectors',
      'TWS Earbuds & Neckbands',
      'Power Banks & Fast Chargers',
      'Cables, Adapters & OTG',
      'Bluetooth Speakers',
      'Smart Home Gadgets',
      'Ring Lights & Tripods'
    ]
  },
  {
    id: 'sports-fitness',
    name: 'Sports, Fitness & Outdoor',
    group: 'Fitness',
    iconName: 'Activity',
    subCategories: [
      'Yoga Mats & Foam Rollers',
      'Dumbbells & Resistance Bands',
      'Gym Shakers & Water Bottles',
      'Cricket, Badminton & Football',
      'Fitness Trackers & Accessories'
    ]
  },
  {
    id: 'groceries-ayurveda',
    name: 'Organics, Spices & Dry Fruits',
    group: 'Food & Wellness',
    iconName: 'Apple',
    subCategories: [
      'Indian Spices & Masalas',
      'Dry Fruits, Almonds & Cashews',
      'Desi Ghee & Organic Oils',
      'Herbal Teas & Green Teas',
      'Chyawanprash & Immunity Boosters',
      'Organic Honey & Jaggery'
    ]
  },
  {
    id: 'stationery-gifts',
    name: 'Stationery, Books & Gifts',
    group: 'Gifting',
    iconName: 'BookOpen',
    subCategories: [
      'Diaries, Planners & Notebooks',
      'Office Stationery & Pens',
      'Festive Gift Hampers',
      'Customized & Wooden Gifts',
      'Greeting Cards & Envelopes'
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive & Bike Accessories',
    group: 'Automotive',
    iconName: 'Car',
    subCategories: [
      'Car Mobile Holders & Chargers',
      'Car Perfumes & Fresheners',
      'Car Cleaning & Microfiber Cloths',
      'Bike Body Covers & Seat Covers',
      'Helmets & Riding Gloves'
    ]
  }
];

// Helper to get all category names
export const ALL_CATEGORY_NAMES = MASTER_CATEGORIES.map(c => c.name);

// Helper to get subcategories for a category
export const getSubcategoriesForCategory = (categoryName: string): string[] => {
  const found = MASTER_CATEGORIES.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
  return found ? found.subCategories : [];
};

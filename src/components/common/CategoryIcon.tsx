import React from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Shirt, 
  Gem, 
  Heart, 
  User, 
  Baby, 
  Home, 
  Star, 
  Layers, 
  Grid,
  Tag,
  Package,
  LucideProps
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  icon?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, className = "w-6 h-6", ...props }) => {
  const normalized = (icon || '').toLowerCase().trim();

  switch (normalized) {
    case 'sparkles':
      return <Sparkles className={className} {...props} />;
    case 'shirt':
    case 'clothing':
      return <Shirt className={className} {...props} />;
    case 'gem':
    case 'jewellery':
    case 'jewelry':
      return <Gem className={className} {...props} />;
    case 'heart':
      return <Heart className={className} {...props} />;
    case 'user':
    case 'men':
    case 'person':
      return <User className={className} {...props} />;
    case 'baby':
    case 'kids':
    case 'toys':
      return <Baby className={className} {...props} />;
    case 'home':
    case 'living':
    case 'kitchen':
      return <Home className={className} {...props} />;
    case 'star':
    case 'popular':
      return <Star className={className} {...props} />;
    case 'layers':
      return <Layers className={className} {...props} />;
    case 'grid':
      return <Grid className={className} {...props} />;
    case 'tag':
      return <Tag className={className} {...props} />;
    case 'package':
      return <Package className={className} {...props} />;
    case 'shopping-bag':
    default:
      return <ShoppingBag className={className} {...props} />;
  }
};

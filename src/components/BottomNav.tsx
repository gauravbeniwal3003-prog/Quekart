import { Home, Grid2X2, Heart, ShoppingCart, Package } from 'lucide-react';
import Logo from './Logo';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  cartCount?: number;
  isCartOpen?: boolean;
}

export default function BottomNav({ activeTab, onSelectTab, cartCount = 0, isCartOpen = false }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: Grid2X2 },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-100 py-1.5 px-2 flex md:hidden items-center justify-around shadow-lg md:max-w-md md:mx-auto" id="lucky-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === 'cart' ? isCartOpen : (activeTab === item.id && !isCartOpen);

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all relative ${
              isActive ? 'text-lucky-magenta scale-105' : 'text-gray-500 hover:text-gray-700'
            }`}
            id={`nav-item-${item.id}`}
          >
            {item.id === 'home' ? (
              <Logo className="w-5 h-5 flex-shrink-0" animated={isActive} />
            ) : item.id === 'cart' && cartCount > 0 ? (
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] fill-blue-50' : 'stroke-[1.8px]'}`} />
                <span className="absolute -top-1.5 -right-2 bg-lucky-magenta text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              </div>
            ) : (
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] fill-blue-50' : 'stroke-[1.8px]'}`} />
            )}
            <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}


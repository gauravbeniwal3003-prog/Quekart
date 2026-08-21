import { Home, Grid2X2, Heart, ShoppingBag, User } from 'lucide-react';
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
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80 py-2 px-3 flex items-center justify-around shadow-lg" id="lucky-bottom-nav">
      <div className="max-w-md mx-auto w-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'user');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-all relative ${
                isActive ? 'text-lucky-magenta font-black scale-105' : 'text-gray-500 hover:text-gray-800'
              }`}
              id={`nav-item-${item.id}`}
            >
              {item.id === 'home' ? (
                <Logo className="w-5 h-5 flex-shrink-0" animated={isActive} />
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] fill-lucky-magenta/10' : 'stroke-[1.8px]'}`} />
              )}
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'font-black text-lucky-magenta' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-lucky-magenta rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}


import { motion } from 'motion/react';
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
    <nav className="sticky bottom-0 left-0 right-0 w-full flex-shrink-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-200/80 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 flex items-center justify-around shadow-lg" id="lucky-bottom-nav">
      <div className="max-w-md mx-auto w-full flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'user');

          return (
            <motion.button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              whileTap={{ scale: 0.88 }}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
                isActive ? 'text-lucky-magenta font-black' : 'text-gray-500 hover:text-gray-800'
              }`}
              id={`nav-item-${item.id}`}
            >
              <div className="relative">
                {item.id === 'home' ? (
                  <Logo className="w-5 h-5 flex-shrink-0" animated={isActive} />
                ) : (
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px] fill-lucky-magenta/10 scale-110' : 'stroke-[1.8px]'}`} />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight transition-all ${isActive ? 'font-black text-lucky-magenta' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.span 
                  layoutId="bottomNavIndicator"
                  className="w-1.5 h-1.5 bg-lucky-magenta rounded-full mt-0.5 shadow-xs"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}



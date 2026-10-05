import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  LayoutGrid, 
  Sparkles, 
  Package, 
  Heart, 
  ShoppingBag 
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface MobileBottomNavProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
}) => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: LayoutGrid },
    { name: 'Custom', path: '/custom-order', icon: Sparkles, highlight: true },
    { name: 'Track', path: '/track-order', icon: Package },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
  ];

  return (
    <aside
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center justify-around h-15 px-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full py-1 text-[8px] sm:text-[9px] font-bold tracking-wider uppercase transition-standard relative select-none',
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-black'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={cn(
                        'w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150',
                        isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]',
                        item.highlight && !isActive && 'text-blue-600'
                      )}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={cn('mt-1 leading-none truncate max-w-full', item.highlight && !isActive && 'text-blue-600 font-black')}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* মোবাইল কার্ট বাটন */}
        <button
          type="button"
          onClick={onOpenCart ? onOpenCart : undefined}
          aria-label="Open Shopping Cart"
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[8px] sm:text-[9px] font-bold tracking-wider uppercase text-slate-500 hover:text-black transition-standard relative select-none cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="mt-1 leading-none">Cart</span>
        </button>
      </div>
    </aside>
  );
};

MobileBottomNav.displayName = 'MobileBottomNav';
export default MobileBottomNav;
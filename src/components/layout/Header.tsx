import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Menu, 
  X, 
  Sparkles, 
  Clock, 
  ArrowRight,
  LogIn,
  Heart,
  ShieldCheck,
  User,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';
import { Drawer } from '@/components/ui/Drawer';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // লাইভ ঢাকা টাইম ডিজিটাল ক্লক
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours} : ${minutes} : ${seconds}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'PRODUCTS', path: '/shop' },
    { name: 'CUSTOM DESIGN', path: '/custom-order', highlight: true, icon: Sparkles },
    { name: 'TRACK PARCEL', path: '/track-order', icon: Package },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all">
        {/* মোবাইলেও উপরে ও নিচে স্পষ্ট ১৪-১৬px স্পেসিং সহ আরামদায়ক হেডার কন্টেইনার */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 min-h-[68px] sm:min-h-[80px] flex items-center justify-between gap-2.5 sm:gap-6">
          
          {/* বাম পাশ: লোগো ও বোল্ড METALIC */}
          <div className="flex items-center space-x-2 sm:space-x-3.5 shrink-0">
            {/* মোবাইল মেনু বাটন */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-xl transition-standard lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/"
              className="flex items-center space-x-2 sm:space-x-2.5 group select-none"
            >
              {/* সার্কুলার মেটালিক এমব্লেম */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0 border border-slate-200 shadow-xs group-hover:scale-105 transition-transform duration-200">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>

              <span className="text-base sm:text-xl font-black tracking-widest uppercase text-black leading-none">
                METALIC
              </span>
            </Link>
          </div>

          {/* মাঝের ডেস্কটপ লিঙ্কস */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-xs font-bold uppercase tracking-widest transition-standard py-1.5 flex items-center gap-1.5 relative',
                    isActive
                      ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full'
                      : 'text-slate-600 hover:text-black',
                    link.highlight && !isActive && 'text-slate-900'
                  )}
                >
                  {Icon && <Icon className={cn('w-3.5 h-3.5', link.highlight ? 'text-blue-600' : 'text-slate-500')} />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ডান পাশের টুলস: পিসিতে কার্ট সহ, মোবাইলে কার্ট ছাড়া স্লিক ফিট */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* লাইভ ঢাকা ক্লক (ডেস্কটপ) */}
            <div className="hidden xl:flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left select-none">
              <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                {currentTime || '00 : 00 : 00'}
              </span>
            </div>

            {/* সার্চ বাটন */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search posters"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-black hover:border-slate-300 transition-standard cursor-pointer"
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* কার্ট বাটন — পিসিতে দৃশ্যমান (sm:flex), মোবাইলে হাইড (hidden) */}
            <button
              type="button"
              onClick={onOpenCart ? onOpenCart : () => navigate('/cart')}
              aria-label="Shopping Cart"
              className="hidden sm:flex relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-700 hover:text-black hover:border-slate-300 transition-standard cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* ডায়নামিক অথেন্টিকেশন বাটন (ADMIN / ACCOUNT / LOGIN) */}
            {currentUser ? (
              isAdmin ? (
                <Link to="/admin" className="shrink-0 select-none">
                  <button
                    type="button"
                    className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-standard cursor-pointer shadow-xs active:scale-95"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>ADMIN</span>
                  </button>
                </Link>
              ) : (
                <Link to="/account" className="shrink-0 select-none">
                  <button
                    type="button"
                    className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-standard cursor-pointer shadow-xs active:scale-95"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline">ACCOUNT</span>
                  </button>
                </Link>
              )
            ) : (
              <Link to="/login" className="shrink-0 select-none">
                <button
                  type="button"
                  className="h-8 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-standard cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>LOGIN</span>
                </button>
              </Link>
            )}

          </div>
        </div>

        {/* এক্সপ্যান্ডেবল লাইভ সার্চ বার */}
        {isSearchOpen && (
          <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xl py-3 px-4 sm:px-6 lg:px-8 animate-in slide-in-from-top-2 duration-200">
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-3xl mx-auto relative flex items-center"
            >
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search metal posters..."
                className="w-full h-10 sm:h-11 pl-10 pr-20 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black transition-standard text-black placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 bg-black text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-standard cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* মোবাইল ন্যাভিগেশন ড্রয়ার */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="METALIC MENU"
        position="left"
      >
        <div className="flex flex-col space-y-6 pt-2 text-left">
          
          {/* সার্চ ইনপুট */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search metal posters..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black"
            />
          </form>

          {/* মেনু লিংকস */}
          <div className="flex flex-col space-y-1.5 border-t border-slate-100 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-xs font-bold tracking-wide uppercase text-slate-800 hover:text-black transition-standard"
              >
                <span className="flex items-center gap-2">
                  {link.icon && <link.icon className={cn('w-4 h-4', link.highlight ? 'text-blue-600' : 'text-slate-400')} />}
                  {link.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            ))}
          </div>

          {/* উইশলিস্ট ও ড্যাশবোর্ড / লগইন */}
          <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3 rounded-xl hover:bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-black flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Saved Posters</span>
              </div>
              {wishlistCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {currentUser ? (
              isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Admin Portal</span>
                </Link>
              ) : (
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>My Account</span>
                </Link>
              )
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Account</span>
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

Header.displayName = 'Header';
export default Header;
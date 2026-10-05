import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheck, 
  LayoutGrid, 
  Box, 
  ShoppingBag, 
  Users, 
  BarChart2, 
  SlidersHorizontal, 
  FileText, 
  ExternalLink, 
  LogOut, 
  Clock, 
  Settings, 
  ShieldAlert 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AdminLayout: React.FC = () => {
  const { currentUser, isAdmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  // স্ক্রিনশট ৪ ও ৫ অনুযায়ী সাইডবার কোল্যাপ্সিবল স্টেট
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // লাইভ ডিজিটাল ক্লক
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-bold tracking-widest text-slate-500 font-mono">
            INITIALIZING MISSION CONTROL...
          </p>
        </div>
      </div>
    );
  }

  // অ্যাডমিন ভ্যালিডেশন
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 text-center text-black">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-premium flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black uppercase text-black font-mono">
            ACCESS DENIED
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Administrator security clearance required to access Mission Control.
            {currentUser && (
              <span className="block mt-2 font-mono text-[11px] text-blue-600">
                User: {currentUser.email}
              </span>
            )}
          </p>
          <div className="flex gap-3 w-full">
            <Link to="/" className="w-1/2">
              <Button variant="outline" className="w-full text-xs uppercase font-bold border-slate-300 text-slate-700">
                Live Store
              </Button>
            </Link>
            <Link to="/login" className="w-1/2">
              <Button variant="primary" className="w-full bg-black text-white text-xs uppercase font-bold">
                Authorize
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // স্ক্রিনশট ১ অনুযায়ী সাইডবার আইটেমসমূহ
  const navItems = [
    { name: 'DASHBOARD', path: '/admin', icon: LayoutGrid, end: true },
    { name: 'PRODUCT MANAGEMENT', path: '/admin/products', icon: Box, end: true },
    { name: 'ORDER LOGS', path: '/admin/orders', icon: ShoppingBag, end: true },
    { name: 'CUSTOMER DATABASE', path: '/admin/customers', icon: Users, end: true },
    { name: 'SALES ANALYTICS', path: '/admin/analytics', icon: BarChart2, end: true },
    { name: 'SITE SETTINGS', path: '/admin/settings', icon: SlidersHorizontal, end: true },
    { name: 'LEGAL & POLICIES', path: '/admin/legal', icon: FileText, end: true },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-50/30 text-black font-sans selection:bg-black selection:text-white">
      
      {/* স্ক্রিনশট ১, ৪ ও ৫ অনুযায়ী Glassy Blue সাইডবার (লগআউট সবসময় নিচে ফিক্সড থাকবে) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-2xl border-r border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.05)] flex flex-col justify-between h-screen max-h-screen overflow-hidden transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* টপ ব্র্যান্ড লোগো */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className={cn(
            'h-20 flex items-center border-b border-slate-100 transition-all shrink-0',
            isCollapsed ? 'justify-center px-2' : 'px-6 space-x-3.5'
          )}>
            {/* প্রিমিয়াম ব্লু শিল্ড ব্যাজ */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[1.5px] shadow-sm shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* লোগো টেক্সট (কোল্যাপ্স হলে হাইড থাকবে) */}
            {!isCollapsed && (
              <div className="flex items-center text-lg font-black tracking-widest uppercase select-none animate-in fade-in duration-200">
                <span className="text-black">ADMIN</span>
                <span className="text-blue-600 ml-1">PANEL</span>
              </div>
            )}
          </div>

          {/* সাইডবার মেনু লিংকস (স্ক্রলেবল এরিয়া যাতে নিচে কোনো কিছু কেটে না যায়) */}
          <div className="p-3 space-y-1.5 mt-3 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 group relative',
                      isCollapsed ? 'justify-center w-14 h-12 mx-auto' : 'px-4 py-3 space-x-3.5',
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : 'text-slate-600 hover:text-black hover:bg-slate-100'
                    )
                  }
                >
                  <Icon className={cn(
                    'w-5 h-5 shrink-0 transition-transform group-hover:scale-110',
                    isCollapsed ? 'mx-auto' : ''
                  )} />
                  
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* বটম সেকশন: LIVE STORE ও LOGOUT (সবসময় স্ক্রিনের নিচে পিন থাকবে) */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/70 shrink-0">
          <Link
            to="/"
            target="_blank"
            title={isCollapsed ? 'Live Store' : undefined}
            className={cn(
              'flex items-center rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-black hover:bg-white transition-all group shadow-xs',
              isCollapsed ? 'justify-center w-14 h-11 mx-auto' : 'px-4 py-2.5 space-x-3'
            )}
          >
            <ExternalLink className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span>LIVE STORE</span>}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            className={cn(
              'flex items-center rounded-2xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all cursor-pointer group w-full',
              isCollapsed ? 'justify-center w-14 h-11 mx-auto' : 'px-4 py-2.5 space-x-3'
            )}
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span>LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* মূল কনটেন্ট রেন্ডারিং এরিয়া */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        {/* টপ হেডার (স্ক্রিনশট ৪ অনুযায়ী ৩-দাগ হ্যামবার্গার বাটন ও লাইভ ক্লক) */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          
          {/* বাম পাশ: স্ক্রিনশট ৪ এর মতো হ্যামবার্গার বাটন */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Toggle Sidebar"
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:border-black flex flex-col items-center justify-center space-y-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
            >
              <div className="w-5 h-0.5 bg-blue-600 group-hover:bg-black transition-colors" />
              <div className="w-5 h-0.5 bg-blue-600 group-hover:bg-black transition-colors" />
              <div className="w-5 h-0.5 bg-blue-600 group-hover:bg-black transition-colors" />
            </button>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                &gt;_ MISSION CONTROL
              </span>
              <span className="text-sm font-black uppercase tracking-wider text-black">
                ADMIN
              </span>
            </div>
          </div>

          {/* ডান পাশ: ডিজিটাল ক্লক ও সেটিংস */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-xs select-none">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-black tracking-widest">{currentTime}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse hidden sm:inline" />
            </div>

            <Link
              to="/admin/settings"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-black hover:border-black transition-colors shadow-xs cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* মূল পেইজ বডি */}
        <main className="p-6 sm:p-8 lg:p-10 flex-1 overflow-x-hidden text-left">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

AdminLayout.displayName = 'AdminLayout';
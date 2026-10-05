import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  User, 
  Package, 
  Heart, 
  LogOut, 
  ArrowRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AccountPage: React.FC = () => {
  const { currentUser, userProfile, logout, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('সফলভাবে লগআউট করা হয়েছে।');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'লগআউট ব্যর্থ হয়েছে।');
    }
  };

  // যদি লোডিং শেষ হওয়ার পরেও ইউজার লগইন না থাকে
  if (!isLoading && !currentUser) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-4 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase text-black mb-2">
          Sign In Required
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Please log in to your Metalic account to access your profile, track active orders, and view saved posters.
        </p>
        <Link to="/login">
          <Button variant="primary" className="bg-black text-white px-8 h-12 text-xs uppercase font-bold tracking-wider">
            Sign In Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Helmet>
        <title>My Account | METALIC</title>
        <meta name="description" content="Manage your Metalic profile, track your cash on delivery poster orders, and saved artworks." />
      </Helmet>

      {/* টপ ব্যানার */}
      <section className="w-full bg-slate-50/70 border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8 text-left">
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white border-slate-200 text-black">
                {isAdmin ? 'ADMINISTRATOR' : 'CUSTOMER ACCOUNT'}
              </Badge>
              {isAdmin && (
                <Link to="/admin">
                  <Badge variant="default" className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700">
                    Enter Admin Portal →
                  </Badge>
                </Link>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
              Welcome, {userProfile?.displayName || currentUser?.displayName || 'Collector'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {currentUser?.email}
            </p>
          </div>

          {/* লগআউট বাটন */}
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-red-600" />}
              className="border-slate-300 text-slate-800 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs uppercase font-bold tracking-wider"
            >
              Log Out
            </Button>
          </div>
        </div>
      </section>

      {/* মূল ড্যাশবোর্ড কন্টেন্ট এরিয়া */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* বাম পাশের ন্যাভিগেশন মেনু */}
          <div className="lg:col-span-4 flex flex-col space-y-2">
            <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-standard ${
                  activeTab === 'profile'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  Account Profile
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-standard ${
                  activeTab === 'orders'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black hover:bg-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  My Orders
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <Link
                to="/wishlist"
                className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-black hover:bg-white transition-standard"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4" />
                  Saved Wishlist
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                to="/shop"
                className="w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 hover:text-black hover:bg-white transition-standard"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Explore Posters
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>

            {/* ক্যাশ অন ডেলিভারি ইনফো কার্ড */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col space-y-2 mt-4">
              <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Cash on Delivery Active</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                All your metal posters include 3 pieces of damage-free nano tape and 100% Cash on Delivery across Bangladesh.
              </p>
            </div>
          </div>

          {/* ডান পাশের কনটেন্ট কার্ড */}
          <div className="lg:col-span-8">
            {activeTab === 'profile' ? (
              // প্রোফাইল ওভারভিউ
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-subtle flex flex-col space-y-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    Profile Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your personal contact information used for delivery updates
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Name
                    </span>
                    <span className="text-sm font-bold text-black">
                      {userProfile?.displayName || currentUser?.displayName || 'Not Set'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address
                    </span>
                    <span className="text-sm font-bold text-black truncate">
                      {currentUser?.email}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </span>
                    <span className="text-sm font-bold text-black">
                      {userProfile?.phoneNumber || 'Not Added'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account Status
                    </span>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <Link to="/shop">
                    <Button variant="primary" className="bg-black text-white px-6">
                      Browse Metal Posters
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              // অর্ডার হিস্ট্রি
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-subtle flex flex-col space-y-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    Order History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track your recent metal poster orders and delivery timeline
                  </p>
                </div>

                {/* এম্পটি স্টেট */}
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                    No Orders Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1 mb-5 leading-relaxed">
                    You haven&apos;t placed any poster orders yet. Browse our collection and order with Cash on Delivery!
                  </p>
                  <Link to="/shop">
                    <Button variant="primary" className="bg-black text-white px-6">
                      Explore Collection
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

AccountPage.displayName = 'AccountPage';
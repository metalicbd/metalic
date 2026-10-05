import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { Order } from '@/types/order';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { 
  Filter, 
  ShoppingBag, 
  Users, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ফিল্টার স্টেটসমূহ: SPECIFIC MONTH / FULL YEAR / ALL TIME
  const [filterMode, setFilterMode] = useState<'SPECIFIC MONTH' | 'FULL YEAR' | 'ALL TIME'>('SPECIFIC MONTH');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = October (0-indexed: 0=Jan, 9=Oct)

  // Firestore থেকে অর্ডার ও প্রোডাক্ট লোড করা
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // ১. অর্ডারসমূহ ফেচ
        const ordersCol = collection(db, COLLECTIONS.ORDERS);
        const qOrders = query(ordersCol, orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(qOrders);
        const ordersList: Order[] = [];
        ordersSnap.forEach((doc) => {
          ordersList.push({ id: doc.id, ...doc.data() } as Order);
        });

        // ২. প্রোডাক্টসমূহ ফেচ
        const productsCol = collection(db, COLLECTIONS.PRODUCTS);
        const productsSnap = await getDocs(productsCol);
        const productsList: Product[] = [];
        productsSnap.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() } as Product);
        });

        if (isMounted) {
          setOrders(ordersList);
          setProducts(productsList);
        }
      } catch (error) {
        console.error('Error fetching dashboard operational intel:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // বুলেটপ্রুফ Timestamp নরম্যালাইজার — _seconds, seconds, Date বা যেকোনো স্ট্রিং সমর্থন করে
  const getOrderDate = (order: any): Date => {
    const raw = order?.createdAt || order?.created_at || order?.timestamp || order?.date;
    if (!raw) return new Date();

    // ১. যদি সরাসরি JS Date অবজেক্ট হয়
    if (raw instanceof Date && !isNaN(raw.getTime())) {
      return raw;
    }

    // ২. যদি Firestore Timestamp (.toDate) হয়
    if (typeof raw?.toDate === 'function') {
      const d = raw.toDate();
      if (!isNaN(d.getTime())) return d;
    }

    // ৩. যদি Firestore-এর _seconds বা seconds অবজেক্ট থাকে
    const secs = raw?._seconds ?? raw?.seconds;
    if (typeof secs === 'number') {
      const d = new Date(secs * 1000);
      if (!isNaN(d.getTime())) return d;
    }

    // ৪. যদি মিলিসেকেন্ড / ইউনিক্স টাইমস্ট্যাম্প নাম্বার হয়
    if (typeof raw === 'number') {
      const d = raw < 10000000000 ? new Date(raw * 1000) : new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }

    // ৫. যদি কোনো স্ট্রিং হয়
    if (typeof raw === 'string') {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;

      const parts = raw.split(/[/.,-\s:]+/).map(Number).filter((n: number) => !isNaN(n));
      if (parts.length >= 3) {
        if (parts[0] > 1000) {
          const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
          if (!isNaN(parsed.getTime())) return parsed;
        }
        if (parts[2] > 1000) {
          const parsed = new Date(parts[2], parts[0] - 1, parts[1]);
          if (!isNaN(parsed.getTime())) return parsed;
        }
      }
    }

    return new Date();
  };

  // ফিল্টার অনুযায়ী অর্ডারসমূহ নির্বাচন (মাসভিত্তিক / বছরভিত্তিক / অল-টাইম)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterMode === 'ALL TIME') return true;
      const orderDate = getOrderDate(order);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();

      if (filterMode === 'FULL YEAR') {
        return orderYear === selectedYear;
      }

      if (filterMode === 'SPECIFIC MONTH') {
        return orderYear === selectedYear && orderMonth === selectedMonth;
      }

      return true;
    });
  }, [orders, filterMode, selectedYear, selectedMonth]);

  // মেট্রিক্স গণনা
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.grandTotal || o.subtotal || 0), 0);
  }, [filteredOrders]);

  const ordersCount = filteredOrders.length;

  const totalCustomers = useMemo(() => {
    const phones = new Set(
      filteredOrders.map((o) => o.customerInfo?.phoneNumber).filter(Boolean)
    );
    return phones.size;
  }, [filteredOrders]);

  const tacticalAssetsCount = products.length;

  // বর্তমান ফিল্টারের সুন্দর লেবেল টেক্সট
  const currentPeriodLabel = useMemo(() => {
    if (filterMode === 'ALL TIME') return 'ALL TIME';
    if (filterMode === 'FULL YEAR') return `FULL YEAR ${selectedYear}`;
    return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  }, [filterMode, selectedYear, selectedMonth]);

  return (
    <div className="flex flex-col space-y-8 text-left">
      <Helmet>
        <title>Operational Intel | METALIC Admin</title>
      </Helmet>

      {/* হেডার ও ডাইনামিক ফিল্টার বার */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
            OPERATIONAL INTEL
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
            SATELLITE VIEW OF MARKET PERFORMANCE
          </p>
        </div>

        {/* ৩টি ডাইনামিক ফিল্টার কন্ট্রোল (Mode, Month, Year) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/90 p-1.5 rounded-2xl shadow-xs self-start xl:self-auto">
          <div className="flex items-center space-x-1.5 px-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">SECTOR FILTER:</span>
          </div>

          {/* ফিল্টার মোড ড্রপডাউন */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="h-8 px-2.5 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-black cursor-pointer shadow-xs"
          >
            <option value="SPECIFIC MONTH">SPECIFIC MONTH</option>
            <option value="FULL YEAR">FULL YEAR</option>
            <option value="ALL TIME">ALL TIME</option>
          </select>

          {/* মাস নির্বাচন (যদি SPECIFIC MONTH মোড অন থাকে) */}
          {filterMode === 'SPECIFIC MONTH' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-8 px-2.5 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-blue-600 cursor-pointer shadow-xs"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {/* বছর নির্বাচন (যদি ALL TIME ছাড়া অন্য মোড থাকে) */}
          {filterMode !== 'ALL TIME' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-8 px-2.5 text-xs font-mono font-bold uppercase bg-white border border-slate-200 rounded-xl outline-none focus:border-black text-black cursor-pointer shadow-xs"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 font-mono text-xs uppercase tracking-widest">
          INTERCEPTING OPERATIONAL SIGNALS...
        </div>
      ) : (
        <>
          {/* ৪টি প্রধান মেট্রিক্স কার্ড গ্রিড — নির্বাচিত মাস/বছর অনুযায়ী রিয়েল-টাইম ক্যালকুলেশন */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* কার্ড ১: TOTAL REVENUE */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-50 font-mono select-none pointer-events-none">
                ৳
              </span>

              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-base shadow-xs">
                    ৳
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    TOTAL REVENUE
                  </span>
                </div>

                <div className="text-3xl font-black font-mono text-black">
                  ৳{totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>TARGET: {currentPeriodLabel}</span>
              </div>
            </div>

            {/* কার্ড ২: ORDERS DEPLOYED */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    ORDERS DEPLOYED
                  </span>
                </div>

                <div className="text-3xl font-black font-mono text-black">
                  {ordersCount}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SUCCESS VERIFIED ({currentPeriodLabel})</span>
              </div>
            </div>

            {/* কার্ড ৩: TOTAL CUSTOMERS */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    TOTAL CUSTOMERS
                  </span>
                </div>

                <div className="text-3xl font-black font-mono text-black">
                  {totalCustomers}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                CLIENTS IN {currentPeriodLabel}
              </div>
            </div>

            {/* কার্ড ৪: TACTICAL ASSETS (অ্যাক্টিভ পোস্টার সংখ্যা) */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    TACTICAL ASSETS
                  </span>
                </div>

                <div className="text-3xl font-black font-mono text-black">
                  {tacticalAssetsCount}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ACTIVE 1MM METAL POSTERS
              </div>
            </div>

          </div>

          {/* সাম্প্রতিক অর্ডার তালিকা (LATEST SIGNALS) — ফিল্টার অনুযায়ী */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-black">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>LATEST SIGNALS ({currentPeriodLabel})</span>
              </div>

              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 hover:underline"
              >
                <span>ACCESS ORDER LOGS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs uppercase tracking-widest">
                NO ACTIVITY DETECTED FOR {currentPeriodLabel}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredOrders.slice(0, 5).map((o) => {
                      const date = getOrderDate(o);
                      return (
                        <tr key={o.id || o.orderId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-bold text-black">
                            {o.orderId}
                          </td>
                          <td className="py-3 px-3 font-sans font-bold text-slate-800">
                            {o.customerInfo?.fullName || 'Anonymous'}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {o.customerInfo?.phoneNumber}
                          </td>
                          <td className="py-3 px-3 font-bold text-black">
                            ৳{(o.grandTotal || o.subtotal || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              variant={
                                o.orderStatus === 'Delivered'
                                  ? 'success'
                                  : o.orderStatus === 'Cancelled'
                                  ? 'discount'
                                  : 'secondary'
                              }
                              className="font-bold text-[10px]"
                            >
                              {o.orderStatus?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

AdminDashboardPage.displayName = 'AdminDashboardPage';
export default AdminDashboardPage;
import React, { useEffect, useState, useMemo } from 'react';
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
import { 
  Filter, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3 
} from 'lucide-react';
import { cn } from '@/utils/cn';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const MONTH_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const MONTH_INTERVALS = ['D1-5', 'D6-10', 'D11-15', 'D16-20', 'D21-25', 'D26-31'];

export const AdminAnalyticsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ফিল্টার কন্ট্রোল (SPECIFIC MONTH / FULL YEAR / ALL TIME)
  const [filterMode, setFilterMode] = useState<'SPECIFIC MONTH' | 'FULL YEAR' | 'ALL TIME'>('SPECIFIC MONTH');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 9 = October

  useEffect(() => {
    let isMounted = true;
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const ordersCol = collection(db, COLLECTIONS.ORDERS);
        const qOrders = query(ordersCol, orderBy('createdAt', 'desc'));
        const snap = await getDocs(qOrders);
        const list: Order[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Order);
        });

        if (isMounted) {
          setOrders(list);
        }
      } catch (error) {
        console.error('Error fetching visual intelligence orders:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
  }, []);

  // বুলেটপ্রুফ Timestamp নরম্যালাইজার
  const getOrderDate = (order: any): Date => {
    const raw = order?.createdAt || order?.created_at || order?.timestamp || order?.date;
    if (!raw) return new Date();

    if (raw instanceof Date && !isNaN(raw.getTime())) return raw;

    if (typeof raw?.toDate === 'function') {
      const d = raw.toDate();
      if (!isNaN(d.getTime())) return d;
    }

    const secs = raw?._seconds ?? raw?.seconds;
    if (typeof secs === 'number') {
      const d = new Date(secs * 1000);
      if (!isNaN(d.getTime())) return d;
    }

    if (typeof raw === 'number') {
      const d = raw < 10000000000 ? new Date(raw * 1000) : new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }

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

  // ফিল্টার অনুযায়ী অর্ডারসমূহ
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filterMode === 'ALL TIME') return true;
      const d = getOrderDate(order);
      const y = d.getFullYear();
      const m = d.getMonth();

      if (filterMode === 'FULL YEAR') {
        return y === selectedYear;
      }

      if (filterMode === 'SPECIFIC MONTH') {
        return y === selectedYear && m === selectedMonth;
      }

      return true;
    });
  }, [orders, filterMode, selectedYear, selectedMonth]);

  // মেট্রিক্স গণনা
  const netCreditsRevenue = useMemo(() => {
    return filteredOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.grandTotal || o.subtotal || 0), 0);
  }, [filteredOrders]);

  const tacticalDeployments = filteredOrders.filter((o) => o.orderStatus !== 'Cancelled').length;

  const avgValuePerUnit = useMemo(() => {
    if (tacticalDeployments === 0) return 0;
    return Math.round(netCreditsRevenue / tacticalDeployments);
  }, [netCreditsRevenue, tacticalDeployments]);

  // বর্তমান ফিল্টারের সুন্দর লেবেল টেক্সট
  const currentPeriodLabel = useMemo(() => {
    if (filterMode === 'ALL TIME') return 'ALL TIME';
    if (filterMode === 'FULL YEAR') return `FULL YEAR ${selectedYear}`;
    return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  }, [filterMode, selectedYear, selectedMonth]);

  // ডাইনামিক চার্ট ডেটা (মাস সিলেক্ট করলে দৈনিক ব্রেকডাউন, বছর সিলেক্ট করলে ১২ মাসের ব্রেকডাউন)
  const chartData = useMemo(() => {
    if (filterMode === 'SPECIFIC MONTH') {
      const intervals = Array(6).fill(0);
      filteredOrders.forEach((order) => {
        if (order.orderStatus === 'Cancelled') return;
        const d = getOrderDate(order);
        const day = d.getDate();
        const amount = order.grandTotal || order.subtotal || 0;

        if (day <= 5) intervals[0] += amount;
        else if (day <= 10) intervals[1] += amount;
        else if (day <= 15) intervals[2] += amount;
        else if (day <= 20) intervals[3] += amount;
        else if (day <= 25) intervals[4] += amount;
        else intervals[5] += amount;
      });

      return {
        labels: MONTH_INTERVALS,
        values: intervals,
        subTitle: `DAILY CYCLE BREAKDOWN (${MONTH_NAMES[selectedMonth]})`,
      };
    }

    if (filterMode === 'FULL YEAR') {
      const monthsData = Array(12).fill(0);
      filteredOrders.forEach((order) => {
        if (order.orderStatus === 'Cancelled') return;
        const d = getOrderDate(order);
        const m = d.getMonth();
        monthsData[m] += (order.grandTotal || order.subtotal || 0);
      });

      return {
        labels: MONTH_SHORT,
        values: monthsData,
        subTitle: `12-MONTH TRAJECTORY (${selectedYear})`,
      };
    }

    // ALL TIME: বিগত বছরগুলোর ব্রেকডাউন
    const years = [2024, 2025, 2026];
    const yearsData = Array(years.length).fill(0);
    filteredOrders.forEach((order) => {
      if (order.orderStatus === 'Cancelled') return;
      const d = getOrderDate(order);
      const y = d.getFullYear();
      const idx = years.indexOf(y);
      if (idx !== -1) {
        yearsData[idx] += (order.grandTotal || order.subtotal || 0);
      }
    });

    return {
      labels: years.map(String),
      values: yearsData,
      subTitle: 'ALL TIME YEAR-OVER-YEAR TRAJECTORY',
    };
  }, [filteredOrders, filterMode, selectedYear, selectedMonth]);

  const maxChartValue = Math.max(...chartData.values, 100);

  return (
    <div className="flex flex-col space-y-8 text-left">
      <Helmet>
        <title>Visual Intelligence | METALIC Admin</title>
      </Helmet>

      {/* হেডার ও ডাইনামিক ফিল্টার বার */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
            VISUAL INTELLIGENCE
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
            TACTICAL MARKET PERFORMANCE OVERVIEW
          </p>
        </div>

        {/* ৩টি ডাইনামিক ফিল্টার কন্ট্রোল (Mode, Month, Year) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/90 p-1.5 rounded-2xl shadow-xs self-start xl:self-auto">
          <div className="flex items-center space-x-1.5 px-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">FILTER LOGS:</span>
          </div>

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
          COMPILING VISUAL LOGIC SIGNALS...
        </div>
      ) : (
        <>
          {/* ৩টি প্রধান মেট্রিক্স কার্ড গ্রিড — নির্বাচিত মাস/বছর অনুযায়ী */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* কার্ড ১: NET CREDITS (REVENUE) */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <span className="absolute -right-2 -bottom-4 text-7xl font-black text-slate-50 font-mono select-none pointer-events-none">
                ৳
              </span>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block mb-4">
                  NET CREDITS (REVENUE)
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-black">
                  ৳{netCreditsRevenue.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>REVENUE FOR {currentPeriodLabel}</span>
              </div>
            </div>

            {/* কার্ড ২: TACTICAL DEPLOYMENTS */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block mb-4">
                  TACTICAL DEPLOYMENTS
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-black">
                  {tacticalDeployments}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMED IN {currentPeriodLabel}</span>
              </div>
            </div>

            {/* কার্ড ৩: AVG. VALUE PER UNIT */}
            <div className="relative p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col justify-between overflow-hidden">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 block mb-4">
                  AVG. VALUE PER UNIT
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-black">
                  ৳{avgValuePerUnit.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                AVERAGE BASKET SIZE
              </div>
            </div>

          </div>

          {/* চার্ট ও নিউরাল রিপোর্ট গ্রিড */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* বাম পাশ: REVENUE TRAJECTORY চার্ট (ডাইনামিক গ্রাফ) */}
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-black">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>REVENUE TRAJECTORY ({currentPeriodLabel})</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  {chartData.subTitle}
                </span>
              </div>

              {/* ডাইনামিক বার চার্ট */}
              <div className="h-64 w-full flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 border-b border-slate-100">
                {chartData.labels.map((label, idx) => {
                  const val = chartData.values[idx];
                  const heightPercent = val > 0 ? Math.max(15, Math.round((val / maxChartValue) * 100)) : 4;
                  const isPositive = val > 0;

                  return (
                    <div key={label} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* হোভার টুলটিপ */}
                      {isPositive && (
                        <div className="absolute -top-8 bg-slate-900 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-10 animate-in fade-in">
                          ৳{val.toLocaleString('en-IN')}
                        </div>
                      )}

                      {/* বার */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          'w-full max-w-[32px] rounded-t-lg transition-all duration-500',
                          isPositive
                            ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-md group-hover:scale-105'
                            : 'bg-slate-100'
                        )}
                      />

                      {/* লেবেল */}
                      <span className={cn(
                        'text-[9px] font-mono font-bold mt-2',
                        isPositive ? 'text-blue-600' : 'text-slate-400'
                      )}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase">
                <span>SECTOR: BANGLADESH</span>
                <span className="text-emerald-600 font-bold">TELEMETRY SYNCED</span>
              </div>
            </div>

            {/* ডান পাশ: NEURAL LOGIC REPORT */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-subtle flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-black pb-3 border-b border-slate-100">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>NEURAL LOGIC REPORT</span>
              </div>

              <p className="text-xs font-mono text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                &quot;Analyzing telemetry sector for {currentPeriodLabel}. Total deployed credits stand at ৳{netCreditsRevenue.toLocaleString('en-IN')} across {tacticalDeployments} verified deployment(s). Average unit valuation is ৳{avgValuePerUnit.toLocaleString('en-IN')}. Target performance indicates high consumer demand for magnetic 1mm steel posters in Bangladesh.&quot;
              </p>

              <div className="pt-2 flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Fulfillment Rate:</span>
                  <span className="font-bold text-black">{tacticalDeployments > 0 ? '100%' : '0%'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Payment Channel:</span>
                  <span className="font-bold text-blue-600">CASH ON DELIVERY</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

AdminAnalyticsPage.displayName = 'AdminAnalyticsPage';
export default AdminAnalyticsPage;
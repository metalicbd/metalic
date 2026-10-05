import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { UserProfile } from '@/services/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  ExternalLink, 
  ArrowUpDown, 
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const AdminCustomersPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const usersCol = collection(db, COLLECTIONS.USERS);
        const snapshot = await getDocs(usersCol);

        const list: UserProfile[] = [];
        snapshot.forEach((d) => {
          list.push({ uid: d.id, ...d.data() } as UserProfile);
        });

        // যদি ডাটাবেস নতুন হয়, তবে বর্তমান লগইন করা অ্যাডমিনকে সবসময় তালিকায় যুক্ত রাখা
        if (currentUser && !list.some((u) => u.uid === currentUser.uid)) {
          list.unshift({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: userProfile?.displayName || currentUser.displayName || 'Mosiur Rahman (Admin)',
            phoneNumber: userProfile?.phoneNumber || '',
            role: userProfile?.role || 'admin',
            createdAt: userProfile?.createdAt || new Date(),
            updatedAt: new Date(),
          });
        }

        if (isMounted) setCustomers(list);
      } catch (error) {
        console.error('Error fetching customer database:', error);
        // ফায়ারস্টোর রুলস রেস্ট্রিক্টেড থাকলেও বর্তমান অ্যাডমিনকে দেখানো
        if (currentUser) {
          setCustomers([
            {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: userProfile?.displayName || currentUser.displayName || 'Admin',
              phoneNumber: userProfile?.phoneNumber || '',
              role: userProfile?.role || 'admin',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCustomers();
    return () => {
      isMounted = false;
    };
  }, [currentUser, userProfile]);

  // সার্চ ফিল্টার
  const filteredCustomers = customers
    .filter(
      (c) =>
        c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phoneNumber?.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortAsc) {
        return (a.displayName || '').localeCompare(b.displayName || '');
      }
      return (b.displayName || '').localeCompare(a.displayName || '');
    });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recent';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <Helmet>
        <title>Customer Database | METALIC Admin</title>
      </Helmet>

      {/* হেডার এবং কাস্টমার কাউন্টার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-2 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
            CUSTOMER DATABASE
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
            REGISTERED CLIENTS & OPERATIVES REGISTRY
          </p>
        </div>

        {/* টোটাল কাস্টমার কাউন্ট কার্ড */}
        <div className="flex items-center space-x-3.5 px-5 py-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
              TOTAL USERS
            </span>
            <span className="text-xl font-black text-black font-mono leading-none mt-1">
              {customers.length}
            </span>
          </div>
        </div>
      </div>

      {/* সার্চ ও সর্ট বার */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full h-12 pl-11 pr-4 text-xs font-mono bg-white border border-slate-200 rounded-2xl outline-none focus:border-black text-black placeholder:text-slate-400 shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={() => setSortAsc(!sortAsc)}
          className="px-5 h-12 rounded-2xl bg-white border border-slate-200 hover:border-black text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shrink-0 shadow-xs"
        >
          <ArrowUpDown className="w-4 h-4 text-blue-600" />
          <span>SORT PROTOCOL</span>
        </button>
      </div>

      {/* কাস্টমার টেবিল কার্ড */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-subtle overflow-hidden text-left">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs uppercase">
            SYNCHRONIZING USER DATABASE...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-mono text-xs flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p>NO CLIENTS FOUND MATCHING QUERY</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">CLIENT PROFILE</th>
                  <th className="py-3 px-3">COMMUNICATION</th>
                  <th className="py-3 px-3">SECURITY CLEARANCE</th>
                  <th className="py-3 px-3">JOINED DATE</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((user) => {
                  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
                  return (
                    <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors font-mono">
                      
                      {/* ক্লায়েন্ট প্রোফাইল ও ইউআইডি */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm text-black">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-black font-sans text-xs tracking-wide">
                              {user.displayName || 'Unnamed Member'}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              UID: {user.uid.slice(0, 10)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ইমেইল ও ফোন */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="flex flex-col space-y-0.5">
                          <span className="text-slate-800 flex items-center gap-1.5 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            {user.email}
                          </span>
                          {user.phoneNumber && (
                            <span className="text-slate-400 text-[10px] font-mono">
                              Phone: {user.phoneNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* রোল ব্যাজ (ADMIN অথবা USER) */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                            user.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          )}
                        >
                          {user.role === 'admin' ? '🛡️ ADMIN' : 'CUSTOMER'}
                        </span>
                      </td>

                      {/* রেজিস্ট্রেশন তারিখ */}
                      <td className="py-4 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* অ্যাকশন লিংক */}
                      <td className="py-4 px-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-black hover:border-black flex items-center justify-center transition-colors ml-auto cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

AdminCustomersPage.displayName = 'AdminCustomersPage';
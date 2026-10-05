import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { COLLECTIONS } from '@/services/firebase/firestore';
import { Order, OrderStatus } from '@/types/order';
import { getPosterThumbnailUrl } from '@/services/cloudinary/url';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Copy, 
  Phone, 
  MapPin, 
  FileText, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const STATUS_TABS: (OrderStatus | 'All')[] = [
  'All',
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Firestore থেকে সব অর্ডার সংগ্রহ করা
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const ordersCol = collection(db, COLLECTIONS.ORDERS);
      const q = query(ordersCol, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const list: Order[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Order);
      });
      setOrders(list);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      toast.error('Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // স্ট্যাটাস পরিবর্তন
  const handleStatusChange = async (orderDocId: string, orderId: string, newStatus: OrderStatus) => {
    setIsUpdating(orderDocId);
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderDocId);
      await updateDoc(orderRef, {
        orderStatus: newStatus,
        paymentStatus: newStatus === 'Delivered' ? 'Paid' : 'Pending',
        updatedAt: serverTimestamp(),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderDocId
            ? {
                ...o,
                orderStatus: newStatus,
                paymentStatus: newStatus === 'Delivered' ? 'Paid' : o.paymentStatus,
              }
            : o
        )
      );

      toast.success(`Order ${orderId} updated to "${newStatus}"!`);
    } catch (error: any) {
      console.error('Status update failed:', error);
      toast.error('Failed to update status.');
    } finally {
      setIsUpdating(null);
    }
  };

  // অর্ডার ডিলিট করা (আপনার নির্দেশনা অনুযায়ী)
  const handleDeleteOrder = async (orderDocId: string, orderId: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete order "${orderId}"?`)) {
      return;
    }

    setIsDeleting(orderDocId);
    try {
      const orderRef = doc(db, COLLECTIONS.ORDERS, orderDocId);
      await deleteDoc(orderRef);
      setOrders((prev) => prev.filter((o) => o.id !== orderDocId));
      toast.success(`Order "${orderId}" permanently removed.`);
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      toast.error('Could not delete order.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success(`Order ID "${id}" copied!`);
  };

  // ফিল্টারিং ও সার্চ
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'All' || o.orderStatus === selectedStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerInfo.fullName.toLowerCase().includes(q) ||
      o.customerInfo.phoneNumber.includes(q) ||
      o.customerInfo.district.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col space-y-6">
      <Helmet>
        <title>Order Management | METALIC Admin</title>
      </Helmet>

      {/* হেডার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
            Cash on Delivery
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-0.5">
            Orders Management ({orders.length})
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage customer orders, update delivery timeline, or remove cancelled logs
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="border-slate-200 text-xs uppercase font-bold self-start sm:self-auto cursor-pointer"
        >
          Refresh Orders
        </Button>
      </div>

      {/* ফিল্টার ও সার্চ বার */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* সার্চ ইনপুট */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Name, Phone..."
            className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black placeholder:text-slate-400"
          />
        </div>

        {/* স্ট্যাটাস পিলস */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-standard shrink-0 cursor-pointer',
                selectedStatus === status
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* অর্ডার তালিকা কার্ডস */}
      <div className="flex flex-col space-y-4">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase bg-white rounded-3xl border border-slate-200">
            Loading Orders Database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center bg-white rounded-3xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p>No orders found matching your search or filter.</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o.id || o.orderId}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-subtle hover:border-slate-300 transition-all flex flex-col space-y-4 text-left"
            >
              {/* অর্ডার টপ বার */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono font-bold text-black whitespace-nowrap">
                    <span>{o.orderId}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(o.orderId)}
                      aria-label="Copy Order ID"
                      className="text-slate-400 hover:text-black ml-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

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
                    {o.orderStatus.toUpperCase()}
                  </Badge>
                </div>

                {/* স্ট্যাটাস আপডেট ও ডিলিট বাটন */}
                <div className="flex items-center space-x-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-bold uppercase text-[10px]">
                      Status:
                    </span>
                    <select
                      disabled={isUpdating === o.id}
                      value={o.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(o.id!, o.orderId, e.target.value as OrderStatus)
                      }
                      className="h-8 px-2.5 text-xs font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-black text-black cursor-pointer shadow-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* অর্ডার ডিলিট বাটন */}
                  <button
                    type="button"
                    disabled={isDeleting === o.id}
                    onClick={() => handleDeleteOrder(o.id!, o.orderId)}
                    className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    title="Delete Order"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* কাস্টমার তথ্য ও পোস্টার তালিকা */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                
                {/* ডেলিভারি ঠিকানা */}
                <div className="lg:col-span-4 flex flex-col space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    Customer & Address
                  </span>
                  <p className="font-bold text-black text-sm">{o.customerInfo.fullName}</p>
                  <p className="text-slate-600 font-mono font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {o.customerInfo.phoneNumber}
                    {o.customerInfo.alternativePhone && ` (Alt: ${o.customerInfo.alternativePhone})`}
                  </p>
                  {o.customerInfo.email && <p className="text-slate-500 truncate">{o.customerInfo.email}</p>}
                  <p className="text-slate-800 font-medium leading-snug mt-1">
                    {o.customerInfo.fullAddress}
                  </p>
                  <p className="text-slate-500 font-semibold text-[11px]">
                    Thana: {o.customerInfo.thana}, District: {o.customerInfo.district} (
                    {o.customerInfo.deliveryZone === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </p>
                  {o.customerInfo.deliveryNotes && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      Note: {o.customerInfo.deliveryNotes}
                    </p>
                  )}
                </div>

                {/* অর্ডার করা পোস্টার আইটেমস তালিকা */}
                <div className="lg:col-span-5 flex flex-col space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Posters In Order ({o.items?.length || 0})
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {o.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <div className="w-8 h-11 rounded-lg overflow-hidden bg-slate-950 border border-slate-200 shrink-0">
                            <img
                              src={getPosterThumbnailUrl(item.featuredImage)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-black truncate">{item.title}</p>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {item.dimensions} • Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-black shrink-0">
                          ৳{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* পেমেন্ট সামারি কার্ড */}
                <div className="lg:col-span-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-black">৳{o.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-black">৳{o.deliveryFee}</span>
                    </div>
                    {o.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount:</span>
                        <span>-৳{o.discount}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200/80 pt-2 mt-2 flex justify-between items-baseline">
                    <span className="font-bold uppercase text-[10px] text-slate-500">Payable Total:</span>
                    <span className="text-base font-black text-black">৳{o.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

AdminOrdersPage.displayName = 'AdminOrdersPage';
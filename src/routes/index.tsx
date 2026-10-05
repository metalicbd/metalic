import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ShopPage } from '@/pages/public/ShopPage';
import { ProductDetailPage } from '@/pages/public/ProductDetailPage';
import { WishlistPage } from '@/pages/public/WishlistPage';
import { CheckoutPage } from '@/pages/public/CheckoutPage';
import { OrderSuccessPage } from '@/pages/public/OrderSuccessPage';
import { TrackOrderPage } from '@/pages/public/TrackOrderPage';
import { CustomComingSoonPage } from '@/pages/public/CustomComingSoonPage';
import { LegalPage } from '@/pages/public/LegalPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { AccountPage } from '@/pages/account/AccountPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminNewProductPage } from '@/pages/admin/AdminNewProductPage';
import { AdminEditProductPage } from '@/pages/admin/AdminEditProductPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminLegalPage } from '@/pages/admin/AdminLegalPage';
import { Button } from '@/components/ui/Button';

// ৪-০-৪ নট-ফাউন্ড পেজ
const NotFoundPage: React.FC = () => {
  return (
    <div className="w-full min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <span className="text-6xl font-black text-slate-200">404</span>
      <h1 className="text-2xl font-black uppercase tracking-tight text-black mt-2">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The metal poster page you are looking for does not exist or has been relocated.
      </p>
      <Link to="/shop">
        <Button variant="primary" className="bg-black text-white px-6 cursor-pointer">
          Back to Catalog
        </Button>
      </Link>
    </div>
  );
};

interface AppRoutesProps {
  HomePageComponent: React.ComponentType;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ HomePageComponent }) => {
  return (
    <Routes>
      {/* পাবলিক কাস্টমার রাউটস (RootLayout) */}
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePageComponent />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/categories" element={<ShopPage />} />
        <Route path="/search" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/track-order" element={<TrackOrderPage />} />
        <Route path="/custom-order" element={<CustomComingSoonPage />} />

        {/* ডাইনামিক লিগ্যাল পলিসিস রাউট */}
        <Route path="/legal/:slug" element={<LegalPage />} />

        {/* চেকআউট ও অর্ডার কনফার্মেশন */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />

        {/* অথেন্টিকেশন রাউটস */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* কাস্টমার অ্যাকাউন্ট ড্যাশবোর্ড */}
        <Route path="/account" element={<AccountPage />} />

        {/* কার্ট ফলব্যাক */}
        <Route path="/cart" element={<Navigate to="/shop" replace />} />
      </Route>

      {/* প্রটেক্টেড অ্যাডমিন মিশন কন্ট্রোল রাউটস (AdminLayout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminNewProductPage />} />
        <Route path="products/:id/edit" element={<AdminEditProductPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        {/* লিগ্যাল রিচ টেক্সট এডিটর রাউট */}
        <Route path="legal" element={<AdminLegalPage />} />
      </Route>

      {/* ৪-০-৪ ক্যাচ-অল */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
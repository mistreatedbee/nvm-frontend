import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MarketplaceHome } from './pages/MarketplaceHome';
import { AllProducts } from './pages/AllProducts';
import { AllVendors } from './pages/AllVendors';
import { VendorStorefront } from './pages/VendorStorefront';
import { ProductDetail } from './pages/ProductDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { VendorDashboard } from './pages/VendorDashboard';
import { VendorProducts } from './pages/VendorProducts';
import { VendorAddProduct } from './pages/VendorAddProduct';
import { VendorEditProduct } from './pages/VendorEditProduct';
import { VendorOrders } from './pages/VendorOrders';
import { AdminUsers } from './pages/AdminUsers';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { VendorProfileSetup } from './pages/VendorProfileSetup';
import { EmailVerification } from './pages/EmailVerification';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VendorAnalytics } from './pages/VendorAnalytics';
import { AdminProducts } from './pages/AdminProducts';
import { AdminVendorManagement } from './pages/AdminVendorManagement';
import { VendorRegistration } from './pages/VendorRegistration';
import { VendorApprovalStatus } from './pages/VendorApprovalStatus';
import { OrderTracking } from './pages/OrderTracking';
import { VendorOrderManagement } from './pages/VendorOrderManagement';
import { VendorPublicProfile } from './pages/VendorPublicProfile';
import { Profile } from './pages/Profile';
import { OrderInvoice } from './pages/OrderInvoice';
import { Orders } from './pages/Orders';

// Note: VendorOrderTracking component is imported in VendorOrderManagement

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketplaceHome />} />
        <Route path="/marketplace" element={<AllProducts />} />
        <Route path="/vendors" element={<AllVendors />} />
        <Route path="/vendor/:id" element={<VendorStorefront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/products/new" element={<VendorAddProduct />} />
        <Route path="/vendor/products/edit/:id" element={<VendorEditProduct />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/analytics" element={<VendorAnalytics />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/vendors" element={<AdminVendorManagement />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/register" element={<VendorRegistration />} />
        <Route path="/vendor/approval-status" element={<VendorApprovalStatus />} />
        <Route path="/vendor/orders/:orderId" element={<VendorOrderManagement />} />
        
        {/* Public Vendor Profile */}
        <Route path="/vendors/:vendorId/profile" element={<VendorPublicProfile />} />
        
        {/* Order Tracking & Invoice */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId/track" element={<OrderTracking />} />
        <Route path="/orders/:orderId/invoice" element={<OrderInvoice />} />
        
        {/* Shopping Routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/vendor/setup" element={<VendorProfileSetup />} />
        
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Fallback route */}
        <Route path="*" element={<MarketplaceHome />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#2D6A4F',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export { App };
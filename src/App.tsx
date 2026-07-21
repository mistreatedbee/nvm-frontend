import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MarketplaceHome } from './pages/MarketplaceHome';
import { AllProducts } from './pages/AllProducts';
import { AllVendors } from './pages/AllVendors';
import { VendorStorefront } from './pages/VendorStorefront';
import { VendorStoreProfile } from './pages/VendorStoreProfile';
import { ProductDetail } from './pages/ProductDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { Wishlist } from './pages/Wishlist';
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
import { AdminOrders } from './pages/AdminOrders';
import { VendorRegistration } from './pages/VendorRegistration';
import { VendorApprovalStatus } from './pages/VendorApprovalStatus';
import { VendorDocuments } from './pages/VendorDocuments';
import { OrderTracking } from './pages/OrderTracking';
import { VendorOrderManagement } from './pages/VendorOrderManagement';
import { VendorPublicProfile } from './pages/VendorPublicProfile';
import { Profile } from './pages/Profile';
import { OrderInvoice } from './pages/OrderInvoice';
import { Orders } from './pages/Orders';
import { ChatInbox } from './pages/ChatInbox';
import { AdminSupportChats } from './pages/AdminSupportChats';
import { Notifications } from './pages/Notifications';
import { ChatFloatingButtons } from './components/chat/ChatFloatingButtons';
import { LoginRequiredModal } from './components/LoginRequiredModal';
import { CustomerInvoices } from './pages/CustomerInvoices';
import { VendorInvoices } from './pages/VendorInvoices';
import { VendorTransactions } from './pages/VendorTransactions';
import { AdminInvoices } from './pages/AdminInvoices';
import { AdminReviews } from './pages/AdminReviews';
import { AdminPaymentProofs } from './pages/AdminPaymentProofs';
import { AdminDisputes } from './pages/AdminDisputes';
import { Disputes } from './pages/Disputes';
import { KnowledgeHubHome } from './pages/KnowledgeHubHome';
import { KnowledgeArticlesPage } from './pages/KnowledgeArticlesPage';
import { KnowledgeArticleDetailPage } from './pages/KnowledgeArticleDetailPage';
import { KnowledgeResourcesPage } from './pages/KnowledgeResourcesPage';
import { AdminKnowledgeHub } from './pages/AdminKnowledgeHub';
import { PostsListPage } from './pages/PostsListPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { AdminPosts } from './pages/AdminPosts';
import { VendorToolkit } from './pages/VendorToolkit';
import { AdminPlaybook } from './pages/AdminPlaybook';
import { AdminControlCenter } from './pages/AdminControlCenter';
import { HelpCenter } from './pages/HelpCenter';
import { HelpGuideDetail } from './pages/HelpGuideDetail';
import { HelpVideoDetail } from './pages/HelpVideoDetail';
import { SupportContact } from './pages/SupportContact';
import { MySupportTickets } from './pages/MySupportTickets';
import { AdminSupportInbox } from './pages/AdminSupportInbox';
import { AdminHelpCenter } from './pages/AdminHelpCenter';
import { VendorInventory } from './pages/VendorInventory';
import { VendorMarketing } from './pages/VendorMarketing';
import { VendorWallet } from './pages/VendorWallet';
import { VendorReviewsManagement } from './pages/VendorReviewsManagement';
import { AdminCategories } from './pages/AdminCategories';
import { AdminContentManager } from './pages/AdminContentManager';
import { AdminAnalyticsOverview } from './pages/AdminAnalyticsOverview';
import { AdminLogistics } from './pages/AdminLogistics';
import { VendorLogistics } from './pages/VendorLogistics';
import { AdminMonetization } from './pages/AdminMonetization';
import { VendorMonetization } from './pages/VendorMonetization';

// Note: VendorOrderTracking component is imported in VendorOrderManagement

function App() {
  useEffect(() => {
    // Wake up the backend on app load (Render free-tier cold-start prevention)
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
    const url = base.endsWith('/api') ? base : `${base}/api`;
    fetch(`${url}/products/new?limit=1`).catch(() => {});
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MarketplaceHome />} />
        <Route path="/marketplace" element={<AllProducts />} />
        <Route path="/search" element={<AllProducts />} />
        <Route path="/vendors" element={<AllVendors />} />
        <Route path="/vendor/:id" element={<VendorStorefront />} />
        <Route path="/vendors/:slug" element={<VendorStorefront />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/announcements" element={<PostsListPage type="ANNOUNCEMENT" />} />
        <Route path="/blog" element={<PostsListPage type="BLOG" />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/announcements/:slug" element={<PostDetailPage />} />
        <Route path="/blog/:slug" element={<PostDetailPage />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help/guides/:slug" element={<HelpGuideDetail />} />
        <Route path="/help/videos/:slug" element={<HelpVideoDetail />} />
        <Route path="/support" element={<SupportContact />} />
        <Route path="/help/contact" element={<SupportContact />} />
        <Route path="/support/my" element={<MySupportTickets />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
        <Route path="/vendor/products/new" element={<VendorAddProduct />} />
        <Route path="/vendor/products/edit/:id" element={<VendorEditProduct />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/inventory" element={<VendorInventory />} />
        <Route path="/vendor/analytics" element={<VendorAnalytics />} />
        <Route path="/vendor/marketing" element={<VendorMarketing />} />
        <Route path="/vendor/wallet" element={<VendorWallet />} />
        <Route path="/vendor/logistics" element={<VendorLogistics />} />
        <Route path="/vendor/monetization" element={<VendorMonetization />} />
        <Route path="/vendor/reviews" element={<VendorReviewsManagement />} />
        <Route path="/vendor/toolkit" element={<VendorToolkit />} />
        <Route path="/vendor/store-profile" element={<VendorStoreProfile />} />
        <Route path="/vendor/knowledge" element={<KnowledgeHubHome />} />
        <Route path="/vendor/knowledge/articles" element={<KnowledgeArticlesPage />} />
        <Route path="/vendor/knowledge/articles/:slug" element={<KnowledgeArticleDetailPage />} />
        <Route path="/vendor/knowledge/resources" element={<KnowledgeResourcesPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/knowledge" element={<AdminKnowledgeHub />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/admin/playbook" element={<AdminPlaybook />} />
        <Route path="/admin/control-center" element={<AdminControlCenter />} />
        <Route path="/admin/help" element={<AdminHelpCenter />} />
        <Route path="/admin/support" element={<AdminSupportInbox />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/payments" element={<AdminPaymentProofs />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
        <Route path="/admin/disputes/:id" element={<Disputes />} />
        <Route path="/admin/vendors" element={<AdminVendorManagement />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/content" element={<AdminContentManager />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsOverview />} />
        <Route path="/admin/logistics" element={<AdminLogistics />} />
        <Route path="/admin/monetization" element={<AdminMonetization />} />
        
        {/* Vendor Routes */}
        <Route path="/vendor/register" element={<VendorRegistration />} />
        <Route path="/vendor/approval-status" element={<VendorApprovalStatus />} />
        <Route path="/vendor/documents" element={<VendorDocuments />} />
        <Route path="/vendor/orders/:orderId" element={<VendorOrderManagement />} />
        
        {/* Public Vendor Profile */}
        <Route path="/vendors/:vendorId/profile" element={<VendorPublicProfile />} />
        
        {/* Order Tracking & Invoice */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/orders/:orderId/track" element={<OrderTracking />} />
        <Route path="/orders/:orderId/invoice" element={<OrderInvoice />} />
        <Route path="/customer/invoices" element={<CustomerInvoices />} />
        <Route path="/vendor/invoices" element={<VendorInvoices />} />
        <Route path="/vendor/transactions" element={<VendorTransactions />} />
        
        {/* Shopping Routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/vendor/setup" element={<VendorProfileSetup />} />
        
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chat" element={<ChatInbox />} />
        <Route path="/admin/chats" element={<AdminSupportChats />} />
        
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
      <ChatFloatingButtons />
      <LoginRequiredModal />
    </Router>
  );
}

export { App };

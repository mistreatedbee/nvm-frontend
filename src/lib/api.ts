import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

function getGuestCartSessionId() {
  const key = 'nvm_cart_session_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const value = `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, value);
  return value;
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(localStorage.getItem('token'));
    if (error.response?.status === 401 && hadToken) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart-storage');
      localStorage.removeItem('wishlist-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  verifyEmailWithCode: (data: any) => api.post('/auth/verify-email-code', data),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.put(`/auth/reset-password/${token}`, data),
};

// Vendors
export const vendorsAPI = {
  create: (data: any) => api.post('/vendors', data),
  getAll: (params?: any) => api.get('/vendors', { params }),
  getAdminAll: (params?: any) => api.get('/vendors/admin/all', { params }),
  getAdminById: (id: string) => api.get(`/vendors/admin/${id}`),
  getById: (id: string) => api.get(`/vendors/${id}`),
  getBySlug: (slug: string) => api.get(`/vendors/slug/${slug}`),
  getPublicProfileBySlug: (slug: string) => api.get(`/vendors/${slug}/profile`),
  getProfileByVendorId: (vendorId: string) => api.get(`/vendors/${vendorId}/profile`),
  upsertProfile: (vendorId: string, data: any) => api.put(`/vendors/${vendorId}/profile`, data),
  createProfile: (vendorId: string, data: any) => api.post(`/vendors/${vendorId}/profile`, data),
  uploadProfileImages: (vendorId: string, formData: FormData) =>
    api.put(`/vendors/${vendorId}/profile/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getMyProfile: () => api.get('/vendors/me/profile'),
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data),
  adminUpdateProfile: (id: string, data: any) => api.put(`/vendors/${id}/admin-profile`, data),
  updateStatus: (id: string, data: any) => api.put(`/vendors/${id}/status`, data),
  uploadDocument: (id: string, formData: FormData) =>
    api.post(`/vendors/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  reviewDocument: (id: string, docId: string, data: any) =>
    api.put(`/vendors/${id}/documents/${docId}/review`, data),
  addComplianceCheck: (id: string, data: any) => api.post(`/vendors/${id}/compliance-checks`, data),
  getDocuments: (id: string, params?: any) => api.get(`/vendors/${id}/documents`, { params }),
  getActivityLogs: (id: string, params?: any) => api.get(`/vendors/${id}/activity-logs`, { params }),
  getPerformanceOverview: (id: string) => api.get(`/vendors/${id}/performance`),
  // Vendor analytics is derived from the authenticated vendor; no vendorId is required.
  // Keep vendorId optional for backward compatibility with older call sites.
  getAnalytics: (_vendorId?: string) => api.get(`/analytics/vendor`),
  approve: (id: string) => api.put(`/vendors/${id}/approve`),
  reject: (id: string, data: any) => api.put(`/vendors/${id}/reject`, data),
  // New vendor-management APIs
  adminList: (params?: any) => api.get('/admin/vendors', { params }),
  adminGetById: (vendorId: string) => api.get(`/admin/vendors/${vendorId}`),
  adminApprove: (vendorId: string) => api.patch(`/admin/vendors/${vendorId}/approve`),
  adminReject: (vendorId: string, data: { reason: string }) => api.patch(`/admin/vendors/${vendorId}/reject`, data),
  adminSuspend: (vendorId: string, data: { reason: string }) => api.patch(`/admin/vendors/${vendorId}/suspend`, data),
  adminUnsuspend: (vendorId: string) => api.patch(`/admin/vendors/${vendorId}/unsuspend`),
  adminUpdateVendorProfile: (vendorId: string, data: any) => api.patch(`/admin/vendors/${vendorId}/profile`, data),
  adminGetVendorDocuments: (vendorId: string, params?: any) => api.get(`/admin/vendors/${vendorId}/documents`, { params }),
  adminApproveDocument: (docId: string) => api.patch(`/admin/documents/${docId}/approve`),
  adminRejectDocument: (docId: string, data: { note?: string }) => api.patch(`/admin/documents/${docId}/reject`, data),
  adminGetVendorMetrics: (vendorId: string) => api.get(`/admin/vendors/${vendorId}/metrics`),
  adminGetAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
  vendorUploadDocument: (formData: FormData) =>
    api.post('/vendor/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  vendorGetDocuments: () => api.get('/vendor/documents'),
  vendorDeleteDocument: (docId: string) => api.delete(`/vendor/documents/${docId}`),
  vendorGetMetrics: () => api.get('/vendor/metrics'),
};

// Products
export const productsAPI = {
  create: (data: any) => api.post('/vendor/products', data),
  getAll: (params?: any) => api.get('/products', { params }),
  search: (params?: any) => api.get('/products/search', { params }),
  getTrending: (params?: any) => api.get('/products/trending', { params }),
  getNewArrivals: (params?: any) => api.get('/products/new', { params }),
  getSimilar: (productId: string, params?: any) => api.get(`/products/${productId}/similar`, { params }),
  getQuestions: (productId: string, params?: any) => api.get(`/products/${productId}/questions`, { params }),
  askQuestion: (productId: string, data: { question: string }) => api.post(`/products/${productId}/questions`, data),
  answerQuestion: (questionId: string, data: { answer: string }) => api.post(`/vendor/questions/${questionId}/answer`, data),
  getMyProducts: (params?: any) => api.get('/vendor/products', { params }),
  getVendorProductById: (productId: string) => api.get(`/vendor/products/${productId}`),
  getAdminProducts: (params?: any) => api.get('/admin/products', { params }),
  getAdminProductById: (productId: string, params?: any) => api.get(`/admin/products/${productId}`, { params }),
  getReportedProducts: (params?: any) => api.get('/products/admin/reported', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getVendorProducts: (vendorId: string, params?: any) =>
    api.get(`/products/vendor/${vendorId}`, { params }),
  getFeatured: () => api.get('/products/featured'),
  getHistory: (productId: string, params?: any) => api.get(`/products/${productId}/history`, { params }),
  update: (productId: string, data: any) => api.put(`/vendor/products/${productId}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  submitForReview: (productId: string) => api.post(`/vendor/products/${productId}/submit`),
  vendorUnpublish: (productId: string) => api.patch(`/vendor/products/${productId}/unpublish`),
  vendorPublish: (productId: string) => api.patch(`/vendor/products/${productId}/publish`),
  vendorRepublish: (productId: string) => api.patch(`/vendor/products/${productId}/republish`),
  adminApprove: (productId: string) => api.patch(`/admin/products/${productId}/approve`),
  adminReject: (productId: string, data: { reason: string }) => api.patch(`/admin/products/${productId}/reject`, data),
  adminUnpublish: (productId: string, data: { reason: string }) => api.patch(`/admin/products/${productId}/unpublish`, data),
  adminRepublish: (productId: string) => api.patch(`/admin/products/${productId}/republish`),
  adminFlag: (productId: string, data: { reason: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' }) =>
    api.patch(`/admin/products/${productId}/flag`, data),
  report: (id: string, data: any) => api.post(`/products/${id}/report`, data),
  moderate: (id: string, data: any) => api.put(`/products/${id}/moderate`, data),
};

// Orders
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  getMyOrders: (params?: any) => api.get('/orders/my', { params }),
  getMyOrderById: (orderId: string) => api.get(`/orders/my/${orderId}`),
  getMyOrderTracking: (orderId: string) => api.get(`/orders/my/${orderId}/tracking`),
  getMyPaymentProof: (orderId: string) => api.get(`/orders/my/${orderId}/payment-proof`),
  uploadPaymentProof: (orderId: string, formData: FormData) =>
    api.post(`/orders/${orderId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  reorder: (orderId: string) => api.post(`/orders/${orderId}/reorder`),
  createReturnRequest: (orderId: string, data: any) => api.post(`/orders/${orderId}/returns`, data),
  getMyReturns: () => api.get('/orders/my/returns'),
  getVendorOrders: (params?: any) => api.get('/orders/vendor/orders', { params }),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  cancel: (id: string, data: any) => api.put(`/orders/${id}/cancel`, data),
};

export const vendorOrdersAPI = {
  getOrders: (params?: any) => api.get('/vendor/orders', { params }),
  getById: (orderId: string) => api.get(`/vendor/orders/${orderId}`),
  updateItemStatus: (orderId: string, productId: string, data: { status: string; note?: string }) =>
    api.patch(`/vendor/orders/${orderId}/items/${productId}/status`, data),
  updateItemTracking: (
    orderId: string,
    productId: string,
    data: { carrier?: string; trackingNumber?: string; trackingUrl?: string }
  ) => api.patch(`/vendor/orders/${orderId}/items/${productId}/tracking`, data),
  cancelItem: (orderId: string, productId: string, data: { reason: string }) =>
    api.patch(`/vendor/orders/${orderId}/items/${productId}/cancel`, data),
  getPackingSlipPdf: (orderId: string) => api.get(`/vendor/orders/${orderId}/packing-slip.pdf`, { responseType: 'blob' }),
  getShippingLabelPdf: (orderId: string) => api.get(`/vendor/orders/${orderId}/shipping-label.pdf`, { responseType: 'blob' }),
};

export const adminOrdersAPI = {
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  getById: (orderId: string) => api.get(`/admin/orders/${orderId}`),
  updateStatus: (orderId: string, data: { status: string; reason?: string }) =>
    api.patch(`/admin/orders/${orderId}/status`, data),
  cancel: (orderId: string, data: { reason: string; items?: Array<{ productId: string; vendorId?: string }> }) =>
    api.patch(`/admin/orders/${orderId}/cancel`, data),
};

export const adminPaymentProofsAPI = {
  list: (params?: any) => api.get('/admin/payment-proofs', { params }),
  approve: (proofId: string) => api.patch(`/admin/payment-proofs/${proofId}/approve`),
  reject: (proofId: string, note: string) => api.patch(`/admin/payment-proofs/${proofId}/reject`, { note }),
};

export const dashboardAPI = {
  getAdminOverview: () => api.get('/admin/dashboard/overview'),
  getVendorOverview: () => api.get('/vendor/dashboard/overview'),
};

export const wishlistAPI = {
  get: (params?: { page?: number; limit?: number }) => api.get('/wishlist', { params }),
  add: (productId: string) => api.post('/wishlist/add', { productId }),
  remove: (productId: string) => api.post('/wishlist/remove', { productId }),
  toggle: (productId: string) => api.post('/wishlist/toggle', { productId }),
  count: () => api.get('/wishlist/count'),
};

export const cartAPI = {
  get: () => api.get('/cart', { headers: { 'x-session-id': getGuestCartSessionId() } }),
  add: (productId: string, qty = 1) => api.post('/cart/add', { productId, qty }, { headers: { 'x-session-id': getGuestCartSessionId() } }),
  update: (productId: string, qty: number) => api.post('/cart/update', { productId, qty }, { headers: { 'x-session-id': getGuestCartSessionId() } }),
  remove: (productId: string) => api.post('/cart/remove', { productId }, { headers: { 'x-session-id': getGuestCartSessionId() } }),
  clear: () => api.post('/cart/clear', {}, { headers: { 'x-session-id': getGuestCartSessionId() } }),
  merge: (items: Array<{ productId: string; quantity?: number; qty?: number }>) => api.post('/cart/merge', { items }),
};

export const recentlyViewedAPI = {
  get: (params?: { page?: number; limit?: number }) => api.get('/recently-viewed', { params }),
  track: (productId: string) => api.post('/recently-viewed/track', { productId }),
};

// Invoices
export const invoicesAPI = {
  getMy: (params?: any) => api.get('/invoices/my', { params }),
  getMyById: (invoiceId: string) => api.get(`/invoices/my/${invoiceId}`),
  downloadMyPdf: (invoiceId: string) => api.get(`/invoices/my/${invoiceId}/pdf`, { responseType: 'blob' }),
  getVendorInvoices: (params?: any) => api.get('/vendor/invoices', { params }),
  getVendorInvoiceById: (invoiceId: string) => api.get(`/vendor/invoices/${invoiceId}`),
  downloadVendorPdf: (invoiceId: string) => api.get(`/vendor/invoices/${invoiceId}/pdf`, { responseType: 'blob' }),
  getAdminInvoices: (params?: any) => api.get('/admin/invoices', { params }),
  getAdminInvoiceById: (invoiceId: string) => api.get(`/admin/invoices/${invoiceId}`),
  regenerateAdminPdf: (invoiceId: string) => api.post(`/admin/invoices/${invoiceId}/regenerate-pdf`),
  voidAdminInvoice: (invoiceId: string, data: { reason: string }) => api.patch(`/admin/invoices/${invoiceId}/void`, data),
  download: (orderId: string) => api.get(`/invoices/${orderId}`, { responseType: 'blob' }),
  getData: (orderId: string) => api.get(`/invoices/${orderId}/data`),
};

export const vendorTransactionsAPI = {
  getMy: (params?: any) => api.get('/vendor/transactions', { params }),
  getByVendorForAdmin: (vendorId: string, params?: any) => api.get(`/admin/vendors/${vendorId}/transactions`, { params })
};

// Order Management (Payment & Tracking)
export const orderManagementAPI = {
  uploadPaymentProof: (orderId: string, formData: FormData) => 
    api.post(`/order-management/${orderId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  confirmPayment: (orderId: string) => api.put(`/order-management/${orderId}/confirm-payment`),
  rejectPayment: (orderId: string, data: { reason: string }) => 
    api.put(`/order-management/${orderId}/reject-payment`, data),
  updateStatus: (orderId: string, data: any) => 
    api.put(`/order-management/${orderId}/status`, data),
  updateTrackingLocation: (orderId: string, data: { latitude: number; longitude: number; address?: string; description?: string }) =>
    api.post(`/order-management/${orderId}/tracking-location`, data),
  getTracking: (orderId: string) => api.get(`/order-management/${orderId}/tracking`),
};

// Reviews
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  getAll: (params?: any) => api.get('/reviews', { params }),
  getProductPageReviews: (productId: string, params?: any) =>
    api.get(`/products/${productId}/reviews`, { params }),
  getVendorPageReviews: (vendorId: string, params?: any) =>
    api.get(`/vendors/${vendorId}/reviews`, { params }),
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  getVendorReviews: (vendorId: string, params?: any) =>
    api.get(`/reviews/vendor/${vendorId}`, { params }),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  addResponse: (id: string, data: any) => api.put(`/reviews/${id}/response`, data),
  markHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
  report: (id: string, data: any) => api.post(`/reviews/${id}/report`, data),
  getReported: (params?: any) => api.get('/reviews/admin/reported', { params }),
  moderate: (id: string, data: any) => api.put(`/reviews/${id}/moderate`, data),
  adminList: (params?: any) => api.get('/admin/reviews', { params }),
  adminApprove: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
  adminReject: (id: string, data: { reason: string }) => api.patch(`/admin/reviews/${id}/reject`, data),
  adminHide: (id: string, data: { reason: string }) => api.patch(`/admin/reviews/${id}/hide`, data),
  adminDelete: (id: string, data?: { reason?: string }) => api.delete(`/admin/reviews/${id}`, { data }),
};

export const reportsAPI = {
  create: (data: {
    targetType: 'PRODUCT' | 'VENDOR' | 'USER' | 'REVIEW';
    targetId: string;
    reasonCategory: 'SPAM' | 'SCAM' | 'PROHIBITED_ITEM' | 'HARASSMENT' | 'FAKE_PRODUCT' | 'INFRINGEMENT' | 'OTHER';
    description?: string;
    evidenceUrls?: string[];
  }) => api.post('/reports', data),
  getMy: (params?: any) => api.get('/reports/my', { params }),
  adminList: (params?: any) => api.get('/admin/reports', { params }),
  adminGetById: (reportId: string) => api.get(`/admin/reports/${reportId}`),
  adminUpdateStatus: (reportId: string, data: any) => api.patch(`/admin/reports/${reportId}/status`, data),
};

// Categories
export const categoriesAPI = {
  create: (data: any) => api.post('/categories', data),
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  adminBroadcast: (data: {
    roles: Array<'CUSTOMER' | 'VENDOR' | 'ADMIN'>;
    title: string;
    message: string;
    linkUrl?: string;
    type?: 'ORDER' | 'VENDOR_APPROVAL' | 'ACCOUNT_STATUS' | 'SYSTEM';
    subType?: string;
    metadata?: any;
  }) => api.post('/admin/notifications/broadcast', data),
};

// Payments
export const paymentsAPI = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  initiatePayFast: (data: { orderId: string }) => api.post('/payments/payfast/initiate', data),
  confirm: (data: any) => api.post('/payments/confirm', data),
  saveEftProof: (data: { orderId: string; fileUrl: string }) => api.post('/payments/eft/proof', data),
  getMethods: () => api.get('/payments/methods'),
  requestRefund: (data: any) => api.post('/payments/refund', data),
};

// Chat
export const chatAPI = {
  getStarters: () => api.get('/chat/starters'),
  createConversation: (data: any) => api.post('/chat/conversations', data),
  getConversations: (params?: any) => api.get('/chat/conversations', { params }),
  getConversation: (id: string) => api.get(`/chat/conversations/${id}`),
  sendMessage: (data: any) => api.post('/chat/messages', data),
  uploadAttachment: (formData: FormData) =>
    api.post('/chat/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getMessages: (params: { conversationId: string; before?: string; limit?: number }) =>
    api.get('/chat/messages', { params }),
  markMessageRead: (messageId: string) => api.patch(`/chat/messages/${messageId}/read`),
  sendBotMessage: (data: any) => api.post('/chat/chatbot/message', data),
  escalate: (data: any) => api.post('/chat/escalate', data),
  getAdminEscalatedChats: (params?: any) => api.get('/admin/chats', { params }),
  updateAdminChatStatus: (conversationId: string, data: any) =>
    api.patch(`/admin/chats/${conversationId}/status`, data),
  sendAdminMessage: (conversationId: string, data: any) =>
    api.post(`/admin/chats/${conversationId}/messages`, data),
  // Backward compatibility aliases
  createChat: (data: any) => api.post('/chats', data),
  getMyChats: (params?: any) => api.get('/chats', { params }),
  getChat: (id: string) => api.get(`/chats/${id}`),
};

// Search & Recommendations
export const searchAPI = {
  products: (params?: any) => api.get('/search/products', { params }),
  autocomplete: (q: string, limit?: number) => api.get('/search/autocomplete', { params: { q, limit } }),
  saveSearch: (data: any) => api.post('/search/history', data),
  getHistory: () => api.get('/search/history'),
  clearHistory: () => api.delete('/search/history'),
  getPopular: () => api.get('/search/popular'),
  generateRecommendations: () => api.post('/search/recommendations/generate'),
  getRecommendations: (params?: any) => api.get('/search/recommendations', { params }),
  trackClick: (id: string) => api.put(`/search/recommendations/${id}/click`),
};

// Bulk Upload
export const bulkUploadAPI = {
  uploadProducts: (formData: FormData) => api.post('/bulk-upload/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadTemplate: () => api.get('/bulk-upload/template', { responseType: 'blob' }),
  getHistory: () => api.get('/bulk-upload/history'),
};

// Subscriptions
export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  subscribe: (data: any) => api.post('/subscriptions/subscribe', data),
  cancel: (data: any) => api.put('/subscriptions/cancel', data),
  checkLimits: () => api.get('/subscriptions/check-limits'),
};

// Analytics
export const analyticsAPI = {
  getVendorAnalytics: (params?: any) => api.get('/analytics/vendor', { params }),
  getVendorSummary: (params?: any) => api.get('/vendor/analytics/summary', { params }),
  getVendorTraffic: (params?: any) => api.get('/vendor/analytics/traffic', { params }),
  getPlatformAnalytics: () => api.get('/analytics/platform'),
  getSalesOverTime: (params?: any) => api.get('/analytics/sales-over-time', { params }),
};

export const vendorStoreAPI = {
  get: () => api.get('/vendor/store'),
  update: (data: any) => api.put('/vendor/store', data),
  uploadLogo: (formData: FormData) =>
    api.post('/vendor/store/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadCover: (formData: FormData) =>
    api.post('/vendor/store/upload-cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getPublicBySlug: (storeSlug: string) => api.get(`/vendor/public/stores/${storeSlug}`),
};

export const vendorProductsAdvancedAPI = {
  schedulePublish: (productId: string, scheduledPublishAt: string) =>
    api.patch(`/vendor/products/${productId}/schedule`, { scheduledPublishAt }),
  republish: (productId: string) => api.patch(`/vendor/products/${productId}/republish`),
  bulkUpload: (formData: FormData) =>
    api.post('/vendor/products/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  barcode: (productId: string, sku?: string) =>
    api.get(`/vendor/products/${productId}/barcode`, { params: sku ? { sku } : undefined, responseType: 'blob' }),
};

export const vendorInventoryAPI = {
  listAlerts: () => api.get('/vendor/inventory/alerts'),
  upsertAlert: (data: { productId?: string; variantSku?: string; threshold?: number; active?: boolean }) =>
    api.post('/vendor/inventory/alerts', data),
  reserveStock: (data: { productId: string; sku?: string; qty: number; minutes?: number }) =>
    api.post('/vendor/inventory/reservations', data),
  consumeReservation: (reservationId: string) =>
    api.patch(`/vendor/inventory/reservations/${reservationId}/consume`),
};

export const vendorMarketingAPI = {
  getAll: () => api.get('/vendor/marketing'),
  createCoupon: (data: any) => api.post('/vendor/marketing/coupons', data),
  updateCoupon: (id: string, data: any) => api.put(`/vendor/marketing/coupons/${id}`, data),
  createBundle: (data: any) => api.post('/vendor/marketing/bundles', data),
  createFlashSale: (data: any) => api.post('/vendor/marketing/flash-sales', data),
  createPromotedListing: (data: any) => api.post('/vendor/marketing/promoted-listings', data),
  validateCoupon: (data: { code: string; items: Array<{ vendorId: string; price: number; quantity: number }> }) =>
    api.post('/vendor/marketing/coupons/validate', data),
};

export const vendorWalletAPI = {
  summary: () => api.get('/vendor/wallet/summary'),
  transactions: (params?: any) => api.get('/vendor/wallet/transactions', { params }),
  withdraw: (amount: number) => api.post('/vendor/wallet/withdraw', { amount }),
  payoutRequests: () => api.get('/vendor/wallet/payout-requests'),
  adminApprovePayout: (id: string, notes?: string) => api.patch(`/vendor/admin/payouts/${id}/approve`, { notes }),
  adminMarkPaid: (id: string, notes?: string) => api.patch(`/vendor/admin/payouts/${id}/mark-paid`, { notes }),
};

export const vendorReviewsMgmtAPI = {
  list: (params?: any) => api.get('/vendor/reviews', { params }),
  summary: () => api.get('/vendor/reviews/summary'),
  reply: (reviewId: string, message: string) => api.post(`/vendor/reviews/${reviewId}/reply`, { message }),
  deleteReply: (reviewId: string) => api.delete(`/vendor/reviews/${reviewId}/reply`),
  report: (reviewId: string, reason: string) => api.post(`/vendor/reviews/${reviewId}/report`, { reason }),
};

// Users (Admin)
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  ban: (id: string) => api.put(`/users/${id}/ban`),
  unban: (id: string) => api.put(`/users/${id}/unban`),
  updateRole: (id: string, data: any) => api.put(`/users/${id}/role`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};

export const recommendationsAPI = {
  get: (params?: any) => api.get('/recommendations', { params }),
};

export const wishlistsAPI = {
  list: () => api.get('/wishlists'),
  create: (name: string) => api.post('/wishlists', { name }),
  add: (listId: string, productId: string) => api.post(`/wishlists/${listId}/add`, { productId }),
  remove: (listId: string, productId: string) => api.post(`/wishlists/${listId}/remove`, { productId }),
  delete: (listId: string) => api.delete(`/wishlists/${listId}`),
  move: (data: { productId: string; fromListId: string; toListId: string }) => api.post('/wishlists/move', data),
};

export const alertsAPI = {
  list: () => api.get('/alerts'),
  create: (data: { productId: string; type: 'PRICE_DROP' | 'BACK_IN_STOCK'; targetPrice?: number }) => api.post('/alerts', data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};

export const addressesAPI = {
  get: () => api.get('/addresses'),
  add: (data: any) => api.post('/addresses', data),
  update: (addressId: string, data: any) => api.put(`/addresses/${addressId}`, data),
  delete: (addressId: string) => api.delete(`/addresses/${addressId}`),
};

export const checkoutAPI = {
  applyPromo: (code: string, subtotal: number) => api.post('/checkout/promo/apply', { code, subtotal }),
  redeemGiftCard: (code: string, total: number) => api.post('/checkout/gift-card/redeem', { code, total }),
};

export const adminControlAPI = {
  getActivity: (params?: any) => api.get('/admin/activity', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserActivity: (userId: string, params?: any) => api.get(`/admin/users/${userId}/activity`, { params }),
  getVendorsCompliance: (params?: any) => api.get('/admin/vendors/compliance', { params }),
  createComplianceFlag: (vendorId: string, data: { type: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; note?: string }) =>
    api.post(`/admin/vendors/${vendorId}/compliance/flag`, data),
  resolveComplianceFlag: (flagId: string, data?: { note?: string }) => api.patch(`/admin/compliance/${flagId}/resolve`, data || {}),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
};

export const adminSuiteAPI = {
  categories: {
    list: (params?: any) => api.get('/admin/categories', { params }),
    create: (data: any) => api.post('/admin/categories', data),
    update: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
    feature: (id: string, isFeatured: boolean) => api.patch(`/admin/categories/${id}/feature`, { isFeatured }),
    reorder: (orderedIds: string[]) => api.patch('/admin/categories/reorder', { orderedIds }),
    deactivate: (id: string, isActive: boolean, unpublishProducts?: boolean) => api.patch(`/admin/categories/${id}/deactivate`, { isActive, unpublishProducts }),
    delete: (id: string, reason?: string) => api.delete(`/admin/categories/${id}`, { data: reason ? { reason } : undefined }),
  },
  cms: {
    listPages: (params?: any) => api.get('/admin/cms-pages', { params }),
    createPage: (data: any) => api.post('/admin/cms-pages', data),
    updatePage: (id: string, data: any) => api.put(`/admin/cms-pages/${id}`, data),
    deletePage: (id: string, reason?: string) => api.delete(`/admin/cms-pages/${id}`, { data: reason ? { reason } : undefined }),
    publishPage: (id: string) => api.patch(`/admin/cms-pages/${id}/publish`),
    unpublishPage: (id: string) => api.patch(`/admin/cms-pages/${id}/unpublish`),
    listBanners: (params?: any) => api.get('/admin/banners', { params }),
    createBanner: (data: any) => api.post('/admin/banners', data),
    updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
    deleteBanner: (id: string, reason?: string) => api.delete(`/admin/banners/${id}`, { data: reason ? { reason } : undefined }),
    listHomepageSections: (params?: any) => api.get('/admin/homepage-sections', { params }),
    createHomepageSection: (data: any) => api.post('/admin/homepage-sections', data),
    updateHomepageSection: (id: string, data: any) => api.put(`/admin/homepage-sections/${id}`, data),
    deleteHomepageSection: (id: string, reason?: string) => api.delete(`/admin/homepage-sections/${id}`, { data: reason ? { reason } : undefined }),
    reorderHomepageSections: (orderedIds: string[]) => api.patch('/admin/homepage-sections/reorder', { orderedIds }),
  },
  analytics: {
    overview: (params?: any) => api.get('/admin/analytics/overview', { params }),
  },
  trustSafety: {
    listFraudFlags: (params?: any) => api.get('/admin/fraud-flags', { params }),
    resolveFraudFlag: (id: string, note?: string) => api.patch(`/admin/fraud/${id}/resolve`, { note }),
    dismissFraudFlag: (id: string, note: string) => api.patch(`/admin/fraud-flags/${id}/dismiss`, { note }),
    listFraudRules: (params?: any) => api.get('/admin/fraud-rules', { params }),
    createFraudRule: (data: any) => api.post('/admin/fraud-rules', data),
    updateFraudRule: (id: string, data: any) => api.patch(`/admin/fraud-rules/${id}`, data),
    deleteFraudRule: (id: string, reason?: string) => api.delete(`/admin/fraud-rules/${id}`, { data: reason ? { reason } : undefined }),
  }
};

// Knowledge Hub (Vendor/Public)
export const knowledgeAPI = {
  getArticles: (params?: any) => api.get('/knowledge/articles', { params }),
  getArticleBySlug: (slug: string) => api.get(`/knowledge/articles/${slug}`),
  getResources: (params?: any) => api.get('/knowledge/resources', { params }),
  getResourceBySlug: (slug: string) => api.get(`/knowledge/resources/${slug}`),
  trackView: (data: { contentType: 'ARTICLE' | 'RESOURCE'; contentId: string; sessionId?: string }) =>
    api.post('/knowledge/track-view', data),
};

// Knowledge Hub (Admin)
export const adminKnowledgeAPI = {
  listArticles: (params?: any) => api.get('/admin/knowledge/articles', { params }),
  createArticle: (data: any) => api.post('/admin/knowledge/articles', data),
  updateArticle: (id: string, data: any) => api.put(`/admin/knowledge/articles/${id}`, data),
  publishArticle: (id: string) => api.patch(`/admin/knowledge/articles/${id}/publish`),
  unpublishArticle: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) =>
    api.patch(`/admin/knowledge/articles/${id}/unpublish`, data || {}),
  deleteArticle: (id: string) => api.delete(`/admin/knowledge/articles/${id}`),
  listResources: (params?: any) => api.get('/admin/knowledge/resources', { params }),
  createResource: (data: any) => api.post('/admin/knowledge/resources', data),
  updateResource: (id: string, data: any) => api.put(`/admin/knowledge/resources/${id}`, data),
  publishResource: (id: string) => api.patch(`/admin/knowledge/resources/${id}/publish`),
  unpublishResource: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) =>
    api.patch(`/admin/knowledge/resources/${id}/unpublish`, data || {}),
  deleteResource: (id: string) => api.delete(`/admin/knowledge/resources/${id}`),
  uploadResourceFile: (formData: FormData) =>
    api.post('/admin/knowledge/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAnalytics: (params?: any) => api.get('/admin/knowledge/analytics', { params }),
};

// Publications / Posts (Public)
export const postsAPI = {
  getPosts: (params?: any) => api.get('/posts', { params }),
  getPostBySlug: (slug: string) => api.get(`/posts/${slug}`),
  track: (data: { slug?: string; contentId?: string; eventType?: 'VIEW' | 'CLICK' | 'SHARE'; sessionId?: string }) =>
    api.post('/posts/track', data),
};

// Publications / Posts (Admin)
export const adminPostsAPI = {
  listPosts: (params?: any) => api.get('/admin/posts', { params }),
  createPost: (data: any) => api.post('/admin/posts', data),
  updatePost: (id: string, data: any) => api.put(`/admin/posts/${id}`, data),
  publishPost: (id: string) => api.patch(`/admin/posts/${id}/publish`),
  unpublishPost: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) => api.patch(`/admin/posts/${id}/unpublish`, data || {}),
  deletePost: (id: string) => api.delete(`/admin/posts/${id}`),
  getAnalytics: (params?: any) => api.get('/admin/posts/analytics', { params }),
  getPostAnalytics: (id: string, params?: any) => api.get(`/admin/posts/${id}/analytics`, { params }),
};

// Vendor Toolkit
export const toolkitAPI = {
  getSummary: (params?: any) => api.get('/vendor/insights/summary', { params }),
  getProducts: (params?: any) => api.get('/vendor/insights/products', { params }),
  getProductDetail: (productId: string, params?: any) => api.get(`/vendor/insights/products/${productId}`, { params }),
  getPlaybookModules: () => api.get('/vendor/playbook/modules'),
  getPlaybookModule: (slug: string) => api.get(`/vendor/playbook/modules/${slug}`),
  getPlaybookLesson: (slug: string) => api.get(`/vendor/playbook/lessons/${slug}`),
  updateProgress: (data: { lessonId: string; completed?: boolean; checklistUpdates?: Record<string, boolean> }) =>
    api.post('/vendor/playbook/progress', data),
};

// Product Tracking
export const trackingAPI = {
  trackProductView: (data: { productId: string; source?: 'SEARCH' | 'HOMEPAGE' | 'VENDOR_PAGE' | 'DIRECT' | 'OTHER'; sessionId?: string }) =>
    api.post('/track/product-view', data),
  trackProductClick: (data: { productId: string; source?: 'SEARCH' | 'HOMEPAGE' | 'VENDOR_PAGE' | 'DIRECT' | 'OTHER'; sessionId?: string }) =>
    api.post('/track/product-click', data),
  trackAddToCart: (data: { productId: string; source?: 'SEARCH' | 'HOMEPAGE' | 'VENDOR_PAGE' | 'DIRECT' | 'OTHER'; sessionId?: string }) =>
    api.post('/track/add-to-cart', data),
};

// Admin Playbook
export const adminPlaybookAPI = {
  listModules: () => api.get('/admin/playbook/modules'),
  listLessons: (params?: any) => api.get('/admin/playbook/lessons', { params }),
  createModule: (data: any) => api.post('/admin/playbook/modules', data),
  updateModule: (id: string, data: any) => api.put(`/admin/playbook/modules/${id}`, data),
  publishModule: (id: string) => api.patch(`/admin/playbook/modules/${id}/publish`),
  createLesson: (data: any) => api.post('/admin/playbook/lessons', data),
  updateLesson: (id: string, data: any) => api.put(`/admin/playbook/lessons/${id}`, data),
  publishLesson: (id: string) => api.patch(`/admin/playbook/lessons/${id}/publish`),
};

// Help Center (Public)
export const helpAPI = {
  getFaqs: (params?: any) => api.get('/help/faqs', { params }),
  getGuides: (params?: any) => api.get('/help/guides', { params }),
  getGuideBySlug: (slug: string) => api.get(`/help/guides/${slug}`),
  getVideos: (params?: any) => api.get('/help/videos', { params }),
  getVideoBySlug: (slug: string) => api.get(`/help/videos/${slug}`),
  getGuideProgress: (slug: string) => api.get(`/help/guides/${slug}/progress`),
  updateGuideProgress: (slug: string, data: { completedSteps: number[] }) => api.put(`/help/guides/${slug}/progress`, data),
};

// Help Center (Admin)
export const adminHelpAPI = {
  listFaqs: (params?: any) => api.get('/admin/help/faqs', { params }),
  createFaq: (data: any) => api.post('/admin/help/faqs', data),
  updateFaq: (id: string, data: any) => api.put(`/admin/help/faqs/${id}`, data),
  publishFaq: (id: string) => api.patch(`/admin/help/faqs/${id}/publish`),
  unpublishFaq: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) => api.patch(`/admin/help/faqs/${id}/unpublish`, data || {}),
  deleteFaq: (id: string) => api.delete(`/admin/help/faqs/${id}`),
  listGuides: (params?: any) => api.get('/admin/help/guides', { params }),
  createGuide: (data: any) => api.post('/admin/help/guides', data),
  updateGuide: (id: string, data: any) => api.put(`/admin/help/guides/${id}`, data),
  publishGuide: (id: string) => api.patch(`/admin/help/guides/${id}/publish`),
  unpublishGuide: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) => api.patch(`/admin/help/guides/${id}/unpublish`, data || {}),
  deleteGuide: (id: string) => api.delete(`/admin/help/guides/${id}`),
  listVideos: (params?: any) => api.get('/admin/help/videos', { params }),
  createVideo: (data: any) => api.post('/admin/help/videos', data),
  updateVideo: (id: string, data: any) => api.put(`/admin/help/videos/${id}`, data),
  publishVideo: (id: string) => api.patch(`/admin/help/videos/${id}/publish`),
  unpublishVideo: (id: string, data?: { status?: 'DRAFT' | 'ARCHIVED' }) => api.patch(`/admin/help/videos/${id}/unpublish`, data || {}),
  deleteVideo: (id: string) => api.delete(`/admin/help/videos/${id}`),
};

// Support (Public/User/Admin)
export const supportAPI = {
  uploadAttachment: (formData: FormData) =>
    api.post('/support/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  createTicket: (data: any) => api.post('/support/tickets', data),
  getMyTickets: (params?: any) => api.get('/support/tickets/my', { params }),
  getMyTicketByNumber: (ticketNumber: string) => api.get(`/support/tickets/my/${ticketNumber}`),
  sendMyTicketMessage: (ticketNumber: string, data: any) => api.post(`/support/tickets/my/${ticketNumber}/message`, data),
  adminListTickets: (params?: any) => api.get('/admin/support/tickets', { params }),
  adminGetTicket: (ticketNumber: string) => api.get(`/admin/support/tickets/${ticketNumber}`),
  adminUpdateStatus: (ticketNumber: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') =>
    api.patch(`/admin/support/tickets/${ticketNumber}/status`, { status }),
  adminUpdatePriority: (ticketNumber: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') =>
    api.patch(`/admin/support/tickets/${ticketNumber}/priority`, { priority }),
  adminReply: (ticketNumber: string, data: { message: string; attachments?: any[] }) =>
    api.post(`/admin/support/tickets/${ticketNumber}/reply`, data),
};

export const disputesAPI = {
  create: (data: {
    orderId: string;
    reason: string;
    reasonCategory?: 'NON_DELIVERY' | 'WRONG_ITEM' | 'DAMAGED' | 'REFUND_REQUEST' | 'SCAM' | 'OTHER';
    description: string;
    vendorId?: string;
    attachments?: any[];
    evidenceUrls?: string[];
  }) => api.post('/disputes', data),
  getMy: (params?: any) => api.get('/disputes/my', { params }),
  getById: (id: string) => api.get(`/disputes/${id}`),
  getMessages: (id: string) => api.get(`/disputes/${id}/messages`),
  sendMessage: (id: string, data: { message?: string; attachments?: any[] }) => api.post(`/disputes/${id}/messages`, data),
  uploadAttachment: (formData: FormData) =>
    api.post('/disputes/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getAdmin: (params?: any) => api.get('/disputes/admin', { params }),
  adminUpdate: (id: string, data: { status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED'; resolution?: string }) =>
    api.patch(`/disputes/admin/${id}`, data),
  adminResolve: (id: string, data: { outcome: 'REFUND_APPROVED' | 'REFUND_DENIED' | 'REPLACEMENT' | 'PARTIAL_REFUND' | 'OTHER'; resolutionNote: string }) =>
    api.patch(`/admin/disputes/${id}/resolve`, data),
};

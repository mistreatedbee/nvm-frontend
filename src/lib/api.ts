import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

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
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
  adminApprove: (productId: string) => api.patch(`/admin/products/${productId}/approve`),
  adminReject: (productId: string, data: { reason: string }) => api.patch(`/admin/products/${productId}/reject`, data),
  adminUnpublish: (productId: string, data?: { reasonOptional?: string }) => api.patch(`/admin/products/${productId}/unpublish`, data || {}),
  adminRepublish: (productId: string) => api.patch(`/admin/products/${productId}/republish`),
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
};

export const adminOrdersAPI = {
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  getById: (orderId: string) => api.get(`/admin/orders/${orderId}`),
  updateStatus: (orderId: string, data: { status: string; reason?: string }) =>
    api.patch(`/admin/orders/${orderId}/status`, data),
  cancel: (orderId: string, data: { reason: string; items?: Array<{ productId: string; vendorId?: string }> }) =>
    api.patch(`/admin/orders/${orderId}/cancel`, data),
};

export const dashboardAPI = {
  getAdminOverview: () => api.get('/admin/dashboard/overview'),
  getVendorOverview: () => api.get('/vendor/dashboard/overview'),
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
  confirm: (data: any) => api.post('/payments/confirm', data),
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
  getPlatformAnalytics: () => api.get('/analytics/platform'),
  getSalesOverTime: (params?: any) => api.get('/analytics/sales-over-time', { params }),
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

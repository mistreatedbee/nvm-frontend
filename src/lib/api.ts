import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
  verifyEmailWithCode: (data: any) => api.post('/auth/verify-email-code', data),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => api.put(`/auth/reset-password/${token}`, data),
};

// Vendors
export const vendorsAPI = {
  create: (data: any) => api.post('/vendors', data),
  getAll: (params?: any) => api.get('/vendors', { params }),
  getById: (id: string) => api.get(`/vendors/${id}`),
  getBySlug: (slug: string) => api.get(`/vendors/slug/${slug}`),
  getMyProfile: () => api.get('/vendors/me/profile'),
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data),
  // Vendor analytics is derived from the authenticated vendor; no vendorId is required.
  // Keep vendorId optional for backward compatibility with older call sites.
  getAnalytics: (_vendorId?: string) => api.get(`/analytics/vendor`),
  approve: (id: string) => api.put(`/vendors/${id}/approve`),
  reject: (id: string, data: any) => api.put(`/vendors/${id}/reject`, data),
};

// Products
export const productsAPI = {
  create: (data: any) => api.post('/products', data),
  getAll: (params?: any) => api.get('/products', { params }),
  getMyProducts: (params?: any) => api.get('/products/my', { params }),
  getAdminProducts: (params?: any) => api.get('/products/admin', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  getVendorProducts: (vendorId: string, params?: any) =>
    api.get(`/products/vendor/${vendorId}`, { params }),
  getFeatured: () => api.get('/products/featured'),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  getMyOrders: (params?: any) => api.get('/orders/my/orders', { params }),
  getVendorOrders: (params?: any) => api.get('/orders/vendor/orders', { params }),
  updateStatus: (id: string, data: any) => api.put(`/orders/${id}/status`, data),
  cancel: (id: string, data: any) => api.put(`/orders/${id}/cancel`, data),
};

// Invoices
export const invoicesAPI = {
  download: (orderId: string) => api.get(`/invoices/${orderId}`, { responseType: 'blob' }),
  getData: (orderId: string) => api.get(`/invoices/${orderId}/data`),
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
  getProductReviews: (productId: string, params?: any) =>
    api.get(`/reviews/product/${productId}`, { params }),
  getVendorReviews: (vendorId: string, params?: any) =>
    api.get(`/reviews/vendor/${vendorId}`, { params }),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  addResponse: (id: string, data: any) => api.put(`/reviews/${id}/response`, data),
  markHelpful: (id: string) => api.put(`/reviews/${id}/helpful`),
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
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
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
  createChat: (data: any) => api.post('/chats', data),
  getMyChats: (params?: any) => api.get('/chats', { params }),
  getChat: (id: string) => api.get(`/chats/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/chats/${id}/status`, data),
  getUnreadCount: () => api.get('/chats/unread/count'),
  deleteChat: (id: string) => api.delete(`/chats/${id}`),
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

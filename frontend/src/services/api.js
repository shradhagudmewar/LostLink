import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lostlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Items Service
export const itemAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (formData) =>
    api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateItem: (id, formData) =>
    api.put(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getMyReports: () => api.get('/items/my-reports'),
};

// Claims Service
export const claimAPI = {
  submitClaim: (formData) =>
    api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyClaims: () => api.get('/claims/my'),
  getItemClaims: (itemId) => api.get(`/claims/item/${itemId}`),
  getClaimById: (id) => api.get(`/claims/${id}`),
  reviewClaimStatus: (id, data) => api.put(`/claims/${id}/status`, data),
  reuniteItem: (id) => api.post(`/claims/${id}/reunite`),
};

// Matches Service
export const matchAPI = {
  getItemMatches: (itemId, params) => api.get(`/matches/item/${itemId}`, { params }),
  getMyMatches: () => api.get('/matches/my'),
  compareItems: (data) => api.post('/matches/compare', data),
};

// Notifications Service
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Admin Service
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleUserBan: (id) => api.put(`/admin/users/${id}/ban`),
  getItems: (params) => api.get('/admin/items', { params }),
  moderateItem: (id, data) => api.put(`/admin/items/${id}/moderate`, data),
  getClaims: (params) => api.get('/admin/claims', { params }),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
};

// Public Stats Service
export const statsAPI = {
  getPublicStats: () => api.get('/stats/public'),
};

export default api;

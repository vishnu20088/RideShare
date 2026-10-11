import axios from 'axios';

// Automatically normalize API base URL (handles missing protocol, missing /api/v1, trailing slashes)
let rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').trim();
if (!rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}
export const API_BASE_URL = rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ridehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error unwrapping
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear token if session expired
      const path = window.location.pathname;
      if (path.includes('/dashboard') || path.includes('/my-')) {
        localStorage.removeItem('ridehub_token');
        localStorage.removeItem('ridehub_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.patch('/users/me', data),
  getPublicProfile: (id) => apiClient.get(`/users/${id}/public-profile`),
};

export const driverApi = {
  createOrUpdateProfile: (data) => apiClient.post('/driver/profile', data),
  getProfile: () => apiClient.get('/driver/profile'),
  createVehicle: (data) => apiClient.post('/vehicles', data),
  getMyVehicles: () => apiClient.get('/vehicles/my'),
  updateVehicle: (id, data) => apiClient.put(`/vehicles/${id}`, data),
};

export const rideApi = {
  createRide: (data) => apiClient.post('/rides', data),
  searchRides: (params) => apiClient.get('/rides', { params }),
  getRideById: (id) => apiClient.get(`/rides/${id}`),
  getMyRides: () => apiClient.get('/rides/my'),
  updateRide: (id, data) => apiClient.patch(`/rides/${id}`, data),
  cancelRide: (id) => apiClient.delete(`/rides/${id}`),
  completeRide: (id) => apiClient.post(`/rides/${id}/complete`),
};

export const bookingApi = {
  createBooking: (rideId, data) => apiClient.post(`/rides/${rideId}/bookings`, data),
  getMyBookings: () => apiClient.get('/bookings/my'),
  getRideBookings: (rideId) => apiClient.get(`/rides/${rideId}/bookings`),
  confirmBooking: (id) => apiClient.patch(`/bookings/${id}/confirm`),
  rejectBooking: (id) => apiClient.patch(`/bookings/${id}/reject`),
  cancelBooking: (id) => apiClient.patch(`/bookings/${id}/cancel`),
};

export const reviewApi = {
  createReview: (data) => apiClient.post('/reviews', data),
  getUserReviews: (userId) => apiClient.get(`/users/${userId}/reviews`),
};

export const notificationApi = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export const adminApi = {
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserStatus: (id, data) => apiClient.patch(`/admin/users/${id}/status`, data),
  getRides: (params) => apiClient.get('/admin/rides', { params }),
  getBookings: (params) => apiClient.get('/admin/bookings', { params }),
  getReports: (params) => apiClient.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => apiClient.patch(`/admin/reports/${id}`, data),
  createReport: (data) => apiClient.post('/reports', data),
};

export default apiClient;

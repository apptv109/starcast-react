import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Package services
export const packageService = {
  getFibrePackages: () => api.get('/api/packages/fibre'),
  getLTEPackages: () => api.get('/api/packages/lte'),
  getPackageById: (id) => api.get(`/api/packages/${id}`),
};

// Booking services
export const bookingService = {
  createBooking: (bookingData) => api.post('/api/bookings', bookingData),
  getBookings: () => api.get('/api/bookings'),
  getBookingById: (id) => api.get(`/api/bookings/${id}`),
};

// Promo services
export const promoService = {
  getActivePromos: () => api.get('/api/promos/active'),
  getPromoById: (id) => api.get(`/api/promos/${id}`),
};

export default api; 
import axios from 'axios';

// WordPress REST API base URL - update this to your WordPress site URL
const WP_API_BASE_URL = process.env.REACT_APP_WP_API_URL || 'https://starcast.co.za/wp-json';

const api = axios.create({
  baseURL: WP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Package services using WordPress REST API
export const packageService = {
  getFibrePackages: () => api.get('/starcast/v1/packages/fibre'),
  getLTEPackages: () => api.get('/starcast/v1/packages/lte'),
  getPackageById: (id) => api.get(`/wp/v2/fibre_packages/${id}`), // WordPress default endpoint
};

// Booking services using WordPress REST API
export const bookingService = {
  createBooking: (bookingData) => api.post('/starcast/v1/bookings', bookingData),
  checkAvailability: (date) => api.get(`/starcast/v1/bookings/availability/${date}`),
};

// Signup services using WordPress REST API
export const signupService = {
  createSignup: (signupData) => api.post('/starcast/v1/signup', signupData),
};

// Contact form service using WordPress REST API
export const contactService = {
  sendContactEmail: (contactData) => api.post('/starcast/v1/contact', contactData),
};

// Default export for backward compatibility
export default {
  packageService,
  bookingService,
  signupService,
  contactService,
}; 
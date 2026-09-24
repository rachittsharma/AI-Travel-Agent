import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: async (data) => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },
  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};

export const travelAPI = {
  searchFlights: async (params) => {
    const res = await api.post('/api/flights/search', params);
    return res.data;
  },
  getFlightDetails: async (offerId) => {
    const res = await api.get(`/api/flights/${offerId}`);
    return res.data;
  },
  searchHotels: async (params) => {
    const res = await api.post('/api/hotels/search', params);
    return res.data;
  },
  getHotelDetails: async (hotelId) => {
    const res = await api.get(`/api/hotels/${hotelId}`);
    return res.data;
  },
};

export const aiAPI = {
  chat: async (prompt, conversationHistory = []) => {
    const res = await api.post('/api/ai/chat', { prompt, conversationHistory });
    return res.data;
  },
  getItinerary: async (params) => {
    const res = await api.post('/api/ai/itinerary', params);
    return res.data;
  },
};

export const paymentAPI = {
  createOrder: async (data) => {
    const res = await api.post('/api/payments/create', data);
    return res.data;
  },
  verifyPayment: async (data) => {
    const res = await api.post('/api/payments/verify', data);
    return res.data;
  },
};

export const bookingAPI = {
  bookFlight: async (data) => {
    const res = await api.post('/api/bookings/flight', data);
    return res.data;
  },
  bookHotel: async (data) => {
    const res = await api.post('/api/bookings/hotel', data);
    return res.data;
  },
  getUserBookings: async () => {
    const res = await api.get('/api/bookings');
    return res.data;
  },
};

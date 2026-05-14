import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Use proxy in dev
  withCredentials: true, // Important for cookies/auth
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to attach auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { auth } = await import('../config/firebase');
      const user = auth.currentUser;
      
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to attach auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed. Please login again.');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
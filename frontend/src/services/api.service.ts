import axios, { AxiosInstance, AxiosError } from 'axios';
import { authService } from './auth.service';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // If 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              console.log('Token expired, refreshing...');
              const newToken = await authService.getCurrentToken();
              
              if (newToken) {
                this.setAuthToken(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                this.isRefreshing = false;
                return this.api(originalRequest);
              }
            } catch (refreshError) {
              this.isRefreshing = false;
              console.error('Token refresh failed:', refreshError);
              // Redirect to login or show error
              throw new Error('Session expired. Please login again.');
            }
          }
        }

        if (error.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to server. Please ensure the backend is running.');
        }
        
        if (error.response) {
          const data = error.response.data as any;
          throw new Error(data.error || 'An error occurred');
        }
        
        throw error;
      }
    );
  }

  setAuthToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  clearAuthToken() {
    localStorage.removeItem('authToken');
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}

export const apiService = new ApiService();
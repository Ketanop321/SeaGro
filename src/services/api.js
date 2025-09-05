import axios from 'axios';
import { config } from '../config/env';
import { handleError, ErrorTypes, AppError } from '../utils/errorHandler';

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (config.isDev && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new AppError(ErrorTypes.NETWORK, 'Request timeout. Please try again.'));
    }

    if (error.response?.status === 401) {
      // Clear auth data on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

// API methods with error handling
export const apiService = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw handleError(error, false);
    }
  },

  // POST request
  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error, false);
    }
  },

  // PUT request
  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error, false);
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw handleError(error, false);
    }
  },

  // PATCH request
  async patch(url, data, config = {}) {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw handleError(error, false);
    }
  }
};

// Simple in-memory cache for GET requests
class ApiCache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

const cache = new ApiCache();

// Cached API service
export const cachedApiService = {
  async get(url, config = {}, cacheTtl = 300000) {
    const cacheKey = `${url}${JSON.stringify(config)}`;
    
    // Try to get from cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Fetch from API and cache
    const data = await apiService.get(url, config);
    cache.set(cacheKey, data);
    
    return data;
  },

  // Clear cache
  clearCache() {
    cache.clear();
  },

  // Remove specific cache entry
  removeCacheEntry(url, config = {}) {
    const cacheKey = `${url}${JSON.stringify(config)}`;
    cache.delete(cacheKey);
  }
};

export default api;
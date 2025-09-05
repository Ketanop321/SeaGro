import { apiService } from './api';
import { handleError, withErrorHandling } from '../utils/errorHandler';

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.user = this.getStoredUser();
    this.refreshTimer = null;
  }

  // Get stored user data
  getStoredUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Store auth data securely
  storeAuthData(data) {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      this.token = data.token;
    }

    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }

    if (data.user || (data._id && data.name && data.email)) {
      const userData = data.user || {
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      this.user = userData;
    }

    // Set up token refresh if expiry is provided
    if (data.expiresIn) {
      this.scheduleTokenRefresh(data.expiresIn);
    }
  }

  // Clear all auth data
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.token = null;
    this.user = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Schedule token refresh
  scheduleTokenRefresh(expiresIn) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn * 1000) - (5 * 60 * 1000);
    
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.logout();
      }
    }, refreshTime);
  }

  // Register user
  async register(userData) {
    const data = await apiService.post('/users/register', userData);
    this.storeAuthData(data);
    return data;
  }

  // Login user
  async login(credentials) {
    const data = await apiService.post('/users/login', credentials);
    this.storeAuthData(data);
    return data;
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await apiService.post('/users/refresh-token', { refreshToken });
    this.storeAuthData(data);
    return data;
  }

  // Logout user
  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      if (this.token) {
        await apiService.post('/users/logout');
      }
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout server call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && this.user);
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Get auth token
  getToken() {
    return this.token;
  }

  // Update user profile
  async updateProfile(updates) {
    const data = await apiService.put('/users/profile', updates);
    
    // Update stored user data
    const updatedUser = { ...this.user, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    this.user = updatedUser;
    
    return updatedUser;
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    await apiService.put('/users/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Request password reset
  async requestPasswordReset(email) {
    await apiService.post('/users/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token, newPassword) {
    await apiService.post('/users/reset-password', { token, newPassword });
  }

  // Verify email
  async verifyEmail(token) {
    const data = await apiService.post('/users/verify-email', { token });
    this.storeAuthData(data);
    return data;
  }

  // Resend verification email
  async resendVerificationEmail() {
    await apiService.post('/users/resend-verification');
  }
}

// Create singleton instance
const authService = new AuthService();

// Export wrapped methods with error handling
export const authServiceWithErrorHandling = {
  register: withErrorHandling(authService.register.bind(authService)),
  login: withErrorHandling(authService.login.bind(authService)),
  logout: withErrorHandling(authService.logout.bind(authService)),
  refreshToken: withErrorHandling(authService.refreshToken.bind(authService)),
  updateProfile: withErrorHandling(authService.updateProfile.bind(authService)),
  changePassword: withErrorHandling(authService.changePassword.bind(authService)),
  requestPasswordReset: withErrorHandling(authService.requestPasswordReset.bind(authService)),
  resetPassword: withErrorHandling(authService.resetPassword.bind(authService)),
  verifyEmail: withErrorHandling(authService.verifyEmail.bind(authService)),
  resendVerificationEmail: withErrorHandling(authService.resendVerificationEmail.bind(authService)),
  
  // Non-async methods don't need error wrapping
  isAuthenticated: authService.isAuthenticated.bind(authService),
  getCurrentUser: authService.getCurrentUser.bind(authService),
  getToken: authService.getToken.bind(authService)
};

export { authService };
export default authServiceWithErrorHandling;